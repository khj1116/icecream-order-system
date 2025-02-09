//커밋//
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const mysql = require('mysql2');
const axios = require('axios'); //python api 호출을 위한 라이브러리
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');



const app = express();
const PORT = 5000;
const server = http.createServer(app); //기존 express 앱을 http 서버로 래핑

//cors 설정 추가
const corsOptions = {
    origin: ['http://localhost:5002', 'http://localhost:5000'], // 5002, 5000 모두 허용
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};


app.use(cors(corsOptions));

// Middleware 설정
app.use(bodyParser.json({ limit: '50mb'})); //json 요청 본문 크기 제한 설정
app.use(bodyParser.urlencoded( {limit: '50mb',extended: true })); // URL-encoded 데이터 크기 제한 설정
app.use(express.static('public')); // Static 파일 제공

/////////////////////////////////////////////////////////////////////////////////

// Socket.IO에 대한 CORS 설정 추가
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5002', 'http://localhost:5000'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});


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

        // 주문 내역 초기화 로직 수정
        connection.query('TRUNCATE TABLE live_orders', (err, result) => {
            if (err) {
                console.error('실시간 주문 테이블 초기화 실패:', err);
            } else {
                console.log('실시간 주문 테이블 초기화 완료.');
            }
        });
    }
});

let liveOrders = [];  //실시간 주문 데이터를 저장할 배열

// 주문 처리 (실시간 + 영구 저장)
app.post('/order', async(req, res) => {
    console.log('POST /order 요청 수신'); //요청 수신 확인 로그 추가
    

        // //클라이언트에서 받은 주문 데이터
        const { flavor, perform, topping, orderType, username, user_id } = req.body;
        // console.log('서버에서 받은 주문 데이터:' , req.body);

        // orderType이 제공되지 않았을 경우 기본값 설정('hall')
        const finalOrderType = orderType ? orderType : 'hall';
        const userIdValue = user_id ? user_id : null; //비회원이면 user_id를 null 처리
    
        //필수 데이터 확인
        if (!flavor || !perform || !topping || !finalOrderType) {
            console.error('필수 데이터가 누락되었습니다.', req.body);
            return res.status(400).json({ error: '주문 정보가 불완전합니다.' });
        }

        try {
            // 실시간 주문 저장 (초기화 대상)(비회원도 가능하게 수정)
            const insertLiveOrder = 'INSERT INTO live_orders (flavor, perform, topping, orderType, customer_name, customer_id) VALUES (?, ?, ?, ?, ?, ?)';
            await connection.promise().query(insertLiveOrder, [flavor, perform, topping, finalOrderType, username || "비회원", userIdValue]);
            
            // 영구 주문 저장(all_orders)
            const insertAllOrder = 'INSERT INTO all_orders (flavor, perform, topping, orderType, customer_name, customer_id) VALUES (?, ?, ?, ?, ?, ?)';
            await connection.promise().query(insertAllOrder, [flavor, perform, topping, finalOrderType, username || "비회원", userIdValue]);
    
            console.log(`주문 처리 완료: ${flavor}, ${perform}, ${topping}, ${finalOrderType}, ${username || "비회원"}, ID: ${userIdValue}`);
    
            // 실시간 주문 내역 최신화
            const [liveResults] = await connection.promise().query('SELECT * FROM live_orders ORDER BY id DESC');
            io.emit('update_orders', liveResults); // 실시간 업데이트

         
            
            
            return res.status(200).json({ status: 'success', message: '주문이 성공적으로 처리되었습니다.' });
    
        } catch (error) {
            console.error('주문 처리 중 오류:', error);
            return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
    });
////////////////////////////////////////////////////////////////////////////////////////////////////////////
















// 특정 회원의 최근 3개 주문 조회 API
app.get('/api/recommendations/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "회원 ID가 필요합니다." });
    }

    try {
        const query = `
            SELECT flavor, perform, topping, orderType
            FROM all_orders
            WHERE customer_id = ?
            ORDER BY created_at DESC
            LIMIT 3
        `;
        const [orders] = await connection.promise().query(query, [user_id]);

        if (orders.length === 0) {
            return res.json({ message: "최근 주문 내역이 없습니다." });
        }

        res.json(orders);
    } catch (error) {
        console.error("❌ 최근 주문 조회 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});



// favicon.ico 요청 무시 (404 에러 방지)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 주문 내역 API
app.get('/api/live_orders', (req, res) => {

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





// Socket.IO 연결 이벤트
io.on('connection', (socket) => {
    console.log(`클라이언트(${socket.id})가 연결되었습니다.`);

    //주문 내역을 항상 emit하지 않도록 조건 추가
    socket.on('request_live_orders', () => {
        connection.query('SELECT * FROM live_orders ORDER BY id DESC', (err, results) => {
            if (err) {
                console.error('주문 데이터 로드 실패:', err);
                return;
            }
            socket.emit('update_orders', results); // 클라이언트에 초기 주문 데이터 전송
        });

    });
    // 클라이언트가 새로운 주문을 추가하면 실시간으로 업데이트
    socket.on('new_order', async (orderData) => {
        console.log("🛒 클라이언트에서 주문 발생:", orderData);

        try {
            const insertLiveOrder = `
                INSERT INTO live_orders (flavor, perform, topping, orderType, customer_name, customer_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.promise().query(insertLiveOrder, [
                orderData.flavor, orderData.perform, orderData.topping, orderData.orderType, orderData.username || "비회원", orderData.user_id || null
            ]);

            // 최신 주문 목록을 클라이언트에 전송
            const [liveResults] = await connection.promise().query('SELECT * FROM live_orders ORDER BY id DESC');
            io.emit('update_orders', liveResults);
            console.log("✅ 주문이 실시간으로 업데이트되었습니다!");

        } catch (error) {
            console.error('❌ 주문 데이터 삽입 중 오류 발생:', error);
        }
    });
 
});

//////////////////////////////////////////////////////////////////////

// 이미지 저장 폴더 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `user_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });






// Base64 이미지 파일 변환 및 저장 함수
function saveBase64Image(base64Data, filename) {
    try {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            console.log("📁 uploads 폴더 생성 중...");
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, ""); 

        fs.writeFileSync(filePath, base64Image, { encoding: "base64" });
        console.log(`✅ 얼굴 이미지 저장 완료: ${filePath}`);

        return `/uploads/${filename}`; 


    } catch (error) {
        console.error("❌ 얼굴 이미지 저장 오류:", error);
        return null;
    }
    
}


// 회원 가입 API (웹캠 사진 포함)
const bcrypt = require('bcrypt');
const saltRounds = 10; //해싱 강도
app.post('/register-user', async (req, res) => {

    const { username, user_id, password, face_image } = req.body;
    // const faceImage = req.file; //업로드한 얼굴 이미지
  

    if (!username || !user_id || !password || !face_image) {
        return res.status(400).json({ error: '모든 필수 정보를 입력해야 합니다.' });
    }


    try {
        //비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const imagePath = saveBase64Image(face_image, `user_${user_id}.jpg`); 

        //해싱된 비밀번호를 DB에 저장
        const query = `INSERT INTO users (username, user_id, password, face_image_path) VALUES (?, ?, ?, ?)`;

        connection.query(query, [username, user_id, hashedPassword, imagePath], (err, results) => {
            if (err) {
                console.error('회원 등록 실패:', err);
                return res.status(500).json({ success: false, message: "회원 등록 중 오류가 발생했습니다." });
            }
    
            res.status(200).json({ success: true, message: '회원 등록 성공', userId: results.insertId });
        });
    } catch (error) {
        console.error('회원가입 오류:' , error);
        res.status(500).json({ success: false, message: "서버 오류 발생" });
    }   
});








///////////////////////////////////////////////////

// `/orders.html` 요청 처리
app.get('/orders', (req, res) => {
    res.sendFile(__dirname + '/public/orders.html'); // orders.html 반환
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hall_order.html'));
});

//로그인 API
app.get('/face-login', async (req, res) => {
    const { spawn } = require('child_process');

    console.log("⚡ Python 얼굴 인식 프로세스 실행 시작");

    const pythonProcess = spawn('/usr/bin/python3', [__dirname + '/face_recognition/face_login.py'], {
        env: { 
            ...process.env,
            TF_ENABLE_ONEDNN_OPTS: '0',
            TF_CPP_MIN_LOG_LEVEL: '2',
            CUDA_VISIBLE_DEVICES: '0',
            TF_FORCE_GPU_ALLOW_GROWTH: 'true',
            LD_LIBRARY_PATH: '/usr/local/cuda/lib64:/usr/local/cuda/extras/CUPTI/lib64',
            QT_QPA_PLATFORM: "offscreen",
            DB_PATH: __dirname + '/face_recognition/uploads',
            DISPLAY: undefined
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    console.log("📷 얼굴 인식 Python 프로세스 시작됨");
    let responseSent = false;

    // 45초 제한 타이머 설정 (DeepFace 인식 시간이 오래 걸릴 수 있음)
    let timeout = setTimeout(() => {
        if (!responseSent) {
            console.error("⏳ 얼굴 인식 응답 지연 - 강제 응답 반환");
            pythonProcess.kill();
            res.status(500).json({ success: false, message: "얼굴 인식 시간이 초과되었습니다." });
            responseSent = true;
        }
    }, 45000);

    pythonProcess.stdout.on('data', async (data) => {
        if (responseSent) return;
        clearTimeout(timeout);

        let user_id = data.toString().trim();

        // **불필요한 로그 제거**
        user_id = user_id.split("\n").pop().trim();
         

        // console.log(`얼굴 인식된 사용자 ID: '${user_id}'`);

        // // 불필요한 경로 및 메시지 제거
        // user_id = user_id.replace("얼굴 이미지 저장 완료:", "").trim();
        // user_id = user_id.replace("/home/addinedu/icecream-order/face_recognition/output/compare_img.jpg", "").trim();

        // console.log(`얼굴 인식된 사용자 ID: '${user_id}'`);

        // 
        
         // DeepFace 로그가 아닌 경우만 처리
        if (!user_id || user_id.includes("Found") || user_id.includes("Searching") || user_id.includes("representations")) {
            console.log("❌ 얼굴 인식 실패: 매칭된 사용자 없음");
            res.status(400).json({ success: false, message: "얼굴을 인식할 수 없습니다." });
            responseSent = true;
            return;
        }

        console.log(`📸 얼굴 인식된 사용자 ID: '${user_id}'`);

        // DB에서 회원 정보 확인
        try {
            console.log(`🔍 DB에서 조회하는 user_id: '${user_id}'`);
            const [rows] = await connection.promise().query(
                "SELECT username FROM users WHERE user_id = ?",
                [user_id]
            );

            if (rows.length > 0) {
                const username = rows[0].username;
                console.log(`얼굴 인식 성공! ${username}님 로그인`);
                res.json({ success: true, username });
            } else {
                console.log(`데이터베이스에서 회원을 찾을 수 없음 (user_id: ${user_id})`);
                res.status(404).json({ success: false, message: "회원 정보가 존재하지 않습니다." });
            }
            responseSent = true;

        } catch (error) {
            console.error("DB 조회 오류:", error);
            if (!responseSent) {
                res.status(500).json({ success: false, message: "서버 오류 발생" });
                responseSent = true;
            }
        }
    });

    // Python 실행 중 에러 메시지 처리
    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();

        // cuDNN, cuFFT 중복 등록 오류 무시 (실제 오류 아님)
        if (errorMessage.includes("Unable to register cuDNN factory") ||
            errorMessage.includes("Unable to register cuFFT factory") ||
            errorMessage.includes("Unable to register cuBLAS factory")) {
            return; // 해당 오류는 무시
        }

        console.error("❌ 얼굴 인식 오류 (상세 로그):", errorMessage);

        if (!responseSent) {
            responseSent = true;
            pythonProcess.kill();
            res.status(500).json({ success: false, message: "얼굴 인식 중 오류 발생" });
        }
    });

    // Python 프로세스 종료 후 응답 반환
    pythonProcess.on('close', (code) => {
        if (!responseSent) {
            console.error(`🚨 Python 얼굴 인식 프로세스 비정상 종료 (코드: ${code})`);
            res.status(500).json({ success: false, message: "얼굴 인식 프로세스 종료 오류" });
            responseSent = true;
        }
    });
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

// // 회원 등록 페이지 라우팅
// app.get('/customer_registration', (req, res) => {
//     res.sendFile(__dirname + '/public/customer_registration.html');
// });
// // 회원 등록 페이지 라우팅
// app.get('/customer_registration', (req, res) => {
//     res.sendFile(__dirname + '/public/customer_registration.html');
// });

// 영구 주문 내역 페이지 라우팅
app.get('/all_orders', (req, res) => {
    res.sendFile(__dirname + '/public/all_orders.html');
});


// 서버 실행
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
