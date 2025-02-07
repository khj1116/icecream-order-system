const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5003;

//CORS 활성화
app.use(cors());
/////////////////////////////////////////////////////////////////////
// Middleware 설정
app.use(bodyParser.json({ limit: '50mb' })); // JSON 요청 본문 크기 제한
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
/////////////////////////////////////////////////////////////////////


//MySQL 연결/////////////////////////////////////////////////////////
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'khj',
    password: '1234',
    database: 'icecream_admin'
});

connection.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
    } else {
        console.log('MySQL에 성공적으로 연결되었습니다.');
    }
});
///////////////////////////////////////////////////////////////////






// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer();

// 얼굴 등록 요청 처리
app.post('/register-face', upload.fields([
    { name: 'images', maxCount: 100 }, // 'images'라는 이름의 최대 100개 파일 허용
]), (req, res) => {
    console.log('POST /register-face 요청 수신');
    console.log('요청 데이터:', req.body);
    console.log('업로드된 파일 데이터:', req.files);

    if (!req.body.user_id) {
        console.error('user_id가 누락되었습니다.');
    }

    if (!req.files || req.files.length < 5) {
        console.error('이미지가 누락되었거나 부족합니다.');
    }


    const { user_id } = req.body;

    if (!user_id || !req.files || req.files.length < 5) {
        console.log('요청 데이터가 누락되었습니다.');
        return res.status(400).json({ error: '사용자 ID와 최소 5장의 이미지가 필요합니다.' });
    }

    console.log(`사용자 ID: ${user_id}`);
    console.log(`등록된 이미지 수: ${req.files.length}`);
    // 필요 시 등록된 이미지 데이터를 처리하거나 DB에 저장
    res.status(200).json({ message: '얼굴 등록 성공', imageCount: req.files.length });
});


const bcrypt = require('bcrypt');
// 회원 등록 엔드포인트
app.post('/register-user', async (req, res) => {
    const { username, user_id, password } = req.body;

    if (!username || !user_id || !password) {
        return res.status(400).json({ error: '모든 필수 정보를 입력해주세요.' });
    }

    try {
        // 비밀번호를 bcrypt로 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('암호화된 비밀번호:' , hashedPassword);
        //데이터 베이스에 회원 정보 저장
        const query = 'INSERT INTO users (username, user_id, password) VALUES (?, ? ,?)';
        await connection.promise().execute(query, [username, user_id, hashedPassword]);
        
        console.log(`회원 ${username}가 성공적으로 등록되었습니다.`);
        res.status(201).json({ message: '회원 등록 성공' }); 
    } catch (error) {
        console.error('회원등록 중 오류 발생:', error);
        res.status(500).json({ error: '회원 등록에 실패했습니다.'});
    }
});






// 서버 실행
app.listen(PORT, () => {
    console.log(`Face Registration Server is running on http://localhost:${PORT}`);
});
//커밋//