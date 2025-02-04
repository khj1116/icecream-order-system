const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const mysql = require('mysql2');
const axios = require('axios'); //python api 호출을 위한 라이브러리
const { Server } = require('socket.io');
const path = require('path');



const app = express();
const PORT = 5000;
const server = http.createServer(app); //기존 express 앱을 http 서버로 래핑
const io = new Server(server);

// Middleware 설정
app.use(bodyParser.json({ limit: '50mb'})); //json 요청 본문 크기 제한 설정
app.use(bodyParser.urlencoded( {limit: '50mb',extended: true })); // URL-encoded 데이터 크기 제한 설정
app.use(cors());
app.use(express.static('public')); // Static 파일 제공


/////////////////////////////////////////////////////////////////////////////////

///////////////////SQL/////////////////////////////////////////////
// MySQL 연결 설정
const connection = mysql.createConnection({
    host: 'localhost', // MySQL 서버 주소
    user: 'khj',      // MySQL 사용자 이름
    password: '1234', // MySQL 비밀번호
    database: 'icecream_admin' // 생성한 데이터베이스 이름
});

// MySQL 연결 테스트
connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
    } else {
        console.log('MySQL에 성공적으로 연결되었습니다.');

        //서버 시작시 실시간 주문 내역 초기화
        connection.query('TRUNCATE TABLE live_orders', (err, result) => {
            if (err) {
                console.error('실시간 주문 테이블 초기화 실패:', err);
            } else {
                console.log('실시간 주문 테이블 초기화 완료.');
                connection.query('ALTER TABLE live_orders AUTO_INCREMENT = 1');
            }
        });
    }
});

let liveOrders = [];  //실시간 주문 데이터를 저장할 배열

// 주문 처리 (실시간 + 영구 저장)
app.post('/order', async(req, res) => {
    console.log('POST /order 요청 수신'); //요청 수신 확인 로그 추가
    //req.body 출력
    console.log('req.body:', req.body);

        //클라이언트에서 받은 주문 데이터
        const { flavor, perform, topping, orderType, username } = req.body;
        console.log('서버에서 받은 주문 데이터:' , req.body);

        // orderType이 제공되지 않았을 경우 기본값 설정('hall')
        const finalOrderType = orderType ? orderType : 'hall';
    
        //필수 데이터 확인
        if (!flavor || !perform || !topping || !finalOrderType) {
            console.error('필수 데이터가 누락되었습니다.', req.body);
            return res.status(400).json({ error: '주문 정보가 불완전합니다.' });
        }

        try {
            // 실시간 주문 저장 (초기화 대상)
            const insertLiveOrder = 'INSERT INTO live_orders (flavor, perform, topping, orderType, customer_name) VALUES (?, ?, ?, ?, ?)';
            await connection.promise().query(insertLiveOrder, [flavor, perform, topping, finalOrderType, username || null]);
            
            // 영구 주문 저장(all_orders)
            const insertAllOrder = 'INSERT INTO all_orders (flavor, perform, topping, orderType, customer_name) VALUES (?, ?, ?, ?, ?)';
            await connection.promise().query(insertAllOrder, [flavor, perform, topping, finalOrderType, username || null]);
    
            console.log(`주문 처리 완료: ${flavor}, ${perform}, ${topping}, ${finalOrderType}, ${username || "비회원"}`);
    
            // 주문 내역 최신화
            const [liveResults] = await connection.promise().query('SELECT * FROM live_orders ORDER BY id DESC');
            
            
            io.emit('update_orders', liveResults); // 실시간 업데이트

         
            console.error("주문 내역이 없습니다.");
            
            
            res.status(200).json({ status: 'success', message: '주문이 성공적으로 처리되었습니다.' });
    
        } catch (error) {
            console.error('주문 처리 중 오류:', error);
            res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
    });



     

    //     // SQL에 데이터 삽입
    //     const query = `INSERT INTO live_orders (flavor, perform, topping, orderType, customer_name, customer_id) VALUES (?, ?, ?, ?, ?, ?)`;
    //     const values = [flavor, perform, topping, finalOrderType, username || null, user_id || null];

    //     connection.execute(query, values, (err, results) => {
    //         if (err) {
    //             console.error('주문 데이터 저장 실패:', err);
    //             return res.status(500).json({ error: '주문 데이터를 저장하는 중 오류가 발생했습니다.' });
    //         }

    //         //새 주문 데이터
    //         const newOrder = {
    //             id: results.insertId, //mysql에서 자동 생성된 ID 사용
    //             flavor,
    //             perform,
    //             topping,
    //             orderType: finalOrderType,
    //             customer_name: username || null,
    //             customer_id: user_id || null
            
    //         };
    //         orders.unshift(newOrder); //주문 데이터를 배열에 추가
    //         io.emit('update_orders' , orders); //실시간으로 클라이언트에 업데이트 전송

    //         console.log(`Order received: ${JSON.stringify(newOrder)}`);
    //         res.status(200).json({ status: 'success', message: '주문이 성공적으로 처리되었습니다.' });
    //     });

    // });



// 주문 내역 API
app.get('/api/live_orders', (req, res) => {
    // const query = `
    //       SELECT id, flavor, perform, topping, orderType,
    //              COALESCE(customer_name, '비회원') AS customer_name
    //       FROM live_orders
    //       ORDER BY id DESC;
    // `;

    connection.query('SELECT * FROM live_orders ORDER BY id ASC', (err, results) => {
        if (err) {
            console.error('주문 데이터 로드 실패:', err);
            return res.status(500).json({ error: 'DB 로드 중 오류가 발생했습니다.' });
        }
        res.json(results);
    });
});


// 모든 주문(영구 저장) 데이터 조회 API
app.get('/api/all_orders', (req, res) => {
    connection.query('SELECT * FROM all_orders ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('❌ 모든 주문 내역 로드 실패:', err);
            return res.status(500).json({ error: 'DB 오류' });
        }
        res.json(results);
    });
});



// Socket.IO 연결 이벤트
io.on('connection', (socket) => {
    console.log('클라이언트가 연결되었습니다.', socket.id);

    connection.query('SELECT * FROM live_orders ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error('주문 데이터 로드 실패:', err);
            return;
        }
    

        socket.emit('update_orders', results); // 클라이언트에 초기 주문 데이터 전송
    });
   
});

//////////////////////////////////////////////////////////////////////






// 회원 이미지 저장용 임시 저장소 설정
const storage = multer.memoryStorage();
const upload = multer({ storage });



// 전역 변수
let capturedImages = [];








// 회원 이미지 캡처
app.post('/capture', (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: '이미지가 전달되지 않았습니다.' });
    }

    if (capturedImages.length >= 100) {
        return res.status(400).json({ error: '이미지 개수가 최대치에 도달했습니다.' });
    }

    capturedImages.push(image);
    console.log(`Captured ${capturedImages.length} images.`);
    res.status(200).json({ message: `사진 ${capturedImages.length}장이 캡처되었습니다.` });
});


// 데이터베이스 로드
function loadDatabase() {
    if (fs.existsSync(DATABASE_PATH)) {
        const data = fs.readFileSync(DATABASE_PATH);
        return JSON.parse(data);
    }
    return {};
}

// 데이터베이스 저장
function saveDatabase(database) {
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 4));
}
// 회원 등록 요청 처리
const bcrypt = require('bcrypt');
const saltRounds = 10; //해싱 강도
app.post('/register-user', async (req, res) => {
    const { username, user_id, password } = req.body;
  

    if (!username || !user_id || !password) {
        return res.status(400).json({ error: '모든 필수 정보를 입력해야 합니다.' });
    }


    try {
        //비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //해싱된 비밀번호를 DB에 저장
        const query = `INSERT INTO users (username, user_id, password) VALUES (?, ?, ?)`;

        connection.query(query, [username, user_id, hashedPassword], (err, results) => {
            if (err) {
                console.error('회원 등록 실패:', err);
                return res.status(500).json({ error: '회원 등록 중 오류가 발생했습니다.' });
            }
    
            res.status(200).json({ message: '회원 등록 성공', userId: results.insertId });
        });
    } catch (error) {
        console.error('비밀번호 해싱 오류:' , error);
        res.status(500).json({ error: '비밀번호 해싱 중 오류가 발생했습니다.'});
    }   
});


// // 회원 등록 처리
// app.post('/register', async (req, res) => {

//     const { username, user_id, password, images, currentFace } = req.body;


//     //데이터 유효성 검사
//     if (!username || !user_id || !password) {
//         console.error('요청 데이터가 누락되었습니다.');
//         return res.status(400).json({ error: '등록에 필요한 정보가 부족합니다.' });
//     }

//     console.log(`회원 등록: ${username}, ID: ${user_id}`);

//     //사용자 정보를 DB에 저장
//     const query = 'INSERT INTO users (username, user_id, password) VALUES (?, ?, ?)';
//     connection.execute(query, [username, user_id, password], async (err, results) => {
//         if (err) {
//             console.error('회원 정보 저장 실패:', err);
//             return res.status(500).json({ error: '회원 정보 저장 중 오류가 발생했습니다.' });
//         }
//         console.log('회원 정보 저장 성공:' , results);

//          // 얼굴 등록 서버로 이미지 데이터 전송
//          try {
//             const faceResponse = await axios.post('http://localhost:5003/register-face', {
//                 user_id,
//                 images,
//             });

//             if (faceResponse.status === 200) {
//                 res.status(200).json({ message: '회원 등록 및 얼굴 등록 성공' });
//             } else {
//                 console.error('얼굴 등록 실패:', faceResponse.data);
//                 res.status(500).json({ error: '얼굴 등록 실패' });
//             }
//         } catch (error) {
//             console.error('얼굴 등록 서버 연결 실패:', error.message);
//             res.status(500).json({ error: '얼굴 등록 서버와 연결할 수 없습니다.' });
//         }
//     });
// });

   

    
     
    // // python api 호출하여 얼굴 학습 처리
    // try {
    //     const pythonResponse = await axios.post('http://localhost:5001/register', {
    //         username,
    //         user_id,
    //         password,
    //         images,  //base64 인코딩 된 이미지 배열
    //         currentFace: currentFace, //현재 얼굴 이미지 추가
    //     });
        // //python api 호출 결과 학인
        // if (pythonResponse.status === 200) {
        //     console.log(`회원 등록 성공: ${name}, ID: ${user_id}`);
        //     res.status(200).json({ message: `'${name}' 회원이 성공적으로 등록되었습니다.` });
        // } else {
        //     console.error('Python API에서 오류 발생:', pythonApiResponse.data.error);
        //     res.status(500).json({ error: '회원 등록 중 오류가 발생했습니다.' });
        // }
//         res.status(200).json(pythonApiResponse.data);
//     } catch (error) {
//         console.error('Python API 호출 실패:', error.message);
//         res.status(500).json({ error: '서버 내부 오류로 회원 등록에 실패했습니다.' });
//     }
// });






///////////////////////////////////////////////////

// `/orders.html` 요청 처리
app.get('/orders', (req, res) => {
    res.sendFile(__dirname + '/public/orders.html'); // orders.html 반환
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});



// 로그인 엔드포인트
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 사용자 검증
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

/////////////////////////////////////////////////////


//포장 주문 페이지 라우팅
app.get('/takeout' , (req, res) => {
    res.sendFile(__dirname + '/public/takeout_order.html');

});


// 주문 페이지 라우팅
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/order.html');
});

// 회원 등록 페이지 라우팅
app.get('/customer_registration', (req, res) => {
    res.sendFile(__dirname + '/public/customer_registration.html');
});

// 영구 주문 내역 페이지 라우팅
app.get('/all_orders', (req, res) => {
    res.sendFile(__dirname + '/public/all_orders.html');
});


// 서버 실행
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
