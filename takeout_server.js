//커밋//
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');  
const saltRounds = 10; //해싱 강도


const app = express();
const PORT = 5002;

///////express-session 설정 추가////////
app.use(session({
    secret: 'addinedu',  //세션 암호화 키(보안 유의)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  //https가 아니라면 secure: false

}));

// MySQL 연결 설정////////////////////////////////////
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'khj',
    password: '1234',
    database: 'icecream_admin',
});

connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
    } else {
        console.log('MySQL 연결 성공');
    }
});
////////////////////////////////////////////////////
// Middleware 설정
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:5000','http://localhost:5002'], //클라이언트 도메인
    credentials: true,  //세션 쿠키를 포함한 요청 허용
    methods: ["GET", "POST"]
}));
app.use(express.static('public'));

// 포장 주문 로그인 페이지 라우팅
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'takeout_order.html'));
});

// 로그인 엔드포인트
app.post('/login', async (req, res) => {
    const { user_id, password } = req.body;

    // DB에서 사용자 검색
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(sql, [user_id], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "서버 오류" });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "존재하지 않는 사용자입니다." });
        }

        const user = results[0];
        //비밀번호 비교(해싱된 경우)
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }

        //로그인 성공시 세션에 사용자 저장
        req.session.user = { username: user.username, user_id: user.user_id};

        //응답의 Content-Type을 명확히 지정하여 JSON으로 변환 오류 방지
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, username: user.username});
    });
});

// 회원가입 엔드포인트 추가
app.post('/api/register', async (req, res) => {
    const { username, user_id, password, confirm_password } = req.body;

    if (!username || !user_id || !password || !confirm_password) {
        return res.status(400).json({ success: false, message: "모든 필드를 입력해주세요." });
    }

    // 비밀번호 확인
    if (password !== confirm_password) {
        return res.status(400).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }


    try {
        // 비밀번호 암호화(해싱)
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //MySQL 저장
        const sql = "INSERT INTO users (username, user_id, password) VALUES (?, ?, ?)";

        connection.query(sql, [username, user_id, hashedPassword], (err, results) => {
            if (err) {
                console.error("회원가입 실패:", err);
                return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
            }
            res.status(200).json({ success: true, message: "회원가입 성공!" });
        });
    } catch (error) {
        console.error("회원가입 처리 중 오류:", error);
        res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
});

// 로그인 상태 확인 API
app.get('/check-login', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.json({ success: false, message: "로그인되지 않았습니다." });
    }
});

// 로그인 페이지 라우팅 추가
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'takeout_order.html'));
});


// 로그아웃 엔드포인트 추가
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "로그아웃 중 오류가 발생했습니다." });
        }
        res.json({ success: true, message: "로그아웃 성공!" });
    });
});


app.post('/order', async(req, res) => {
    console.log('포장 주문 요청 수신:', req.body);

    const { flavor, perform, topping, orderType, username } = req.body;
    const finalOrderType = orderType ? orderType : 'packed';

    if (!flavor || !perform || !topping) {
        return res.status(400).json({ error: '주문 정보가 불완전합니다.' });
    }

    try {
        // 1️⃣ 포장 주문을 `5002`의 DB에 저장
        const sql = 'INSERT INTO takeout_orders (flavor, perform, topping, orderType, customer_name) VALUES (?, ?, ?, ?, ?)';
        await connection.promise().query(sql, [flavor, perform, topping, finalOrderType, username || "비회원"]);

        console.log("✅ 포장 주문이 성공적으로 저장되었습니다!");

        const forwardOrder = {
            flavor: req.body.flavor,
            perform: req.body.perform,
            topping: req.body.topping,
            orderType: req.body.orderType || "packed",
            username: req.body.username || "비회원",
            user_id: req.body.user_id || null  // 비회원의 경우 user_id를 null로 설정
        };

        // 2️⃣ `5000` 서버로 주문 데이터 전송
        const forwardResponse = await fetch('http://localhost:5000/order', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(forwardOrder),
        });

        if (!forwardResponse.ok) {
            throw new Error("🚨 5000 서버로 주문 데이터 전달 실패");
        }

        console.log("✅ 실시간 주문 내역 서버(5000)로 주문이 전송되었습니다!");
        res.status(200).json({ message: "포장 주문 성공 및 실시간 주문 내역 반영 완료!" });

    } catch (error) {
        console.error('❌ 포장 주문 처리 중 오류 발생:', error);
        res.status(500).json({ error: '포장 주문 처리 중 오류가 발생했습니다.' });
    }
});






    
   

// 서버 실행
app.listen(PORT, () => {
    console.log(`Takeout server is running on http://localhost:${PORT}`);
});
