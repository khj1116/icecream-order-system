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
app.use(cors());
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


    
   

// 서버 실행
app.listen(PORT, () => {
    console.log(`Takeout server is running on http://localhost:${PORT}`);
});
