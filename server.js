const express = require('express')
const session = require('express-session')
const path = require('path');
const app = express()
const port = 3001

const db = require('./lib/db');
const sessionOption = require('./lib/sessionOption');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { send } = require('process');

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(sessionOption);
app.use(session({  
	key: 'session_cookie_name',
    secret: '~',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}))

app.use(session({
    secret: '0205',
    resave: true,
    saveUninitialized: true
}))

app.get('/base', (req, res) => {    
    req.sendFile(path.join(__dirname, '/build/index.html'));
})

app.get('/authcheck', (req, res) => {      
    const sendData = { isLogin: "" };
    if (req.session.is_logined) {
        sendData.isLogin = "True"
    } else {
        sendData.isLogin = "False"
    }
    res.send(sendData);
})

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/logoutting');
    });
});

app.post("/login", (req, res) => { // 데이터 받아서 결과 전송
    const username = req.body.userId;
    const password = req.body.userPassword;
    const sendData = { isLogin: "" , isProf: ""};

    if (username && password) {             // id와 pw가 입력되었는지 확인
        db.query('SELECT * FROM user WHERE u_name = ?', [username], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있다 = 일치하는 아이디가 있다.      
                bcrypt.compare(password , results[0].u_pw, (err, result) => {    // 입력된 비밀번호가 해시된 저장값과 같은 값인지 비교

                    if (result === true) {                  // 비밀번호가 일치하면
                        req.session.is_logined = true;      // 세션 정보 갱신
                        req.session.nickname = username;
                        if (results[0].u_role === '교수') {
                            sendData.isProf = "True";
                        }
                        else {
                            sendData.isProf = "False";
                        }
                        req.session.save(function () {
                            sendData.isLogin = "True";
                            res.send(sendData);
                        });
                        db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`
                            , [req.session.nickname, '-', `React 로그인 테스트`], function (error, result) { });
                    }
                    else{                                   // 비밀번호가 다른 경우
                        sendData.isLogin = "로그인 정보가 일치하지 않습니다."
                        res.send(sendData);
                    }
                })                      
            } else {    // db에 해당 아이디가 없는 경우
                sendData.isLogin = "아이디 정보가 일치하지 않습니다."
                res.send(sendData);
            }
        });
    } else {            // 아이디, 비밀번호 중 입력되지 않은 값이 있는 경우
        sendData.isLogin = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);
    }
});

app.post('/checkid', (req, res) => {
    const username = req.body.userID;
    db.query('SELECT * FROM user WHERE u_name = ?', [username], function(error, results, fields) { 
        if (error) throw error;
        if (results.length == 1) {
            res.send(results)
        }
        else {                                         
            sendData = "회원 정보에 문제가 있습니다!"
            res.send(sendData);
        }
    });
});


app.get('/courselist', (req, res) => {
    const username = req.body.userID;
    db.query('SELECT * FROM course inner join user ON course.t_id=user.u_id', function(error, results, fields) { 
        if (error) throw error;
        if (results.length > 0) {
            res.send(results)
        }
        else {                                         
            sendData = "현재 열린 강의가 없습니다!"
            res.send(sendData);
        }
    });
  });

app.post('/viewcourses', (req, res) => {
    const username = req.body.userID;
    db.query('SELECT * FROM course natural join user WHERE u_name = ?', [username], function(error, results, fields) { 
        if (error) throw error;
        if (results.length > 0) {
            res.send(results)
        }
        else {                                         
            sendData = "담당하시는 강의가 없습니다!"
            res.send(sendData);  
        }
    });
  });

app.post('/viewpost', (req, res) => {
    const c_id = req.body.c_id;
    // console.log(c_id);
    db.query('SELECT * FROM post inner join course on course.c_id=post.course_id join user on course.t_id=user.u_id WHERE c_id = ?', [c_id], function(error, results, fields) { 
        if (error) throw error;
        if (results.length > 0) {
            // console.log('durl');
            res.send(results)
        }
        else {                                         
            sendData = "해당 강의가 없습니다!"
            // console.log('durl');
            res.send(sendData);  
        }
    });
});

app.post('/addpost', (req, res) => {

    const sendData = { isSuccess: ""};

    const c_id = req.body.c_id;
    const title = req.body.p_title;
    const content = req.body.p_content;

    db.query('SELECT * FROM course WHERE c_id = ?', [c_id], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
        if (error) throw error;
        if (results.length > 0) {
            db.query('INSERT INTO post (p_title, p_content, course_id) VALUES(?,?,?)', [title, content, c_id], function (error, data) {
                if (error) throw error;
                req.session.save(function () {            
                    sendData.isSuccess = "True"
                    res.send(sendData);
                });
            });
        }
        else {                                         
            sendData = "해당 강의가 존재하지 않습니다!"
            res.send(sendData);
        }
    });
});


app.post("/enrolledcourses", (req, res) => {
    const userId = req.body.userID;
    const sendData = { isSuccess: "" };

    if (userId) {
        db.query('SELECT * FROM takes natural join course natural join user WHERE u_name = ? ', [userId], function(error, results, fields) { 
            if (error) throw error;
            if (results.length > 0) {
                res.send(results);
            }
            else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "수강 중인 과목이 없습니다!"
                res.send(sendData);  
            }            
        });        
    } else {
        sendData.isSuccess = "회원 정보가 부족합니다!"
        res.send(sendData);  
    }
    
});


app.post("/regcourse", (req, res) => {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const sendData = { isSuccess: "" };
    let id;

    db.query('SELECT * FROM user WHERE u_name = ?', [userId], function (error, data) {
        if (error) throw error;
        // console.log(userId);
        // console.log(typeof data);
        // console.log(data);
        if (data && data.length > 0) {
            id = data[0].u_id;
        } else {
            console.log("사용자를 찾을 수 없습니다.");
        }
    });
    if (courseId) {
        db.query('SELECT * FROM takes WHERE u_id = ? and c_id = ?', [id, courseId], function(error, results, fields) { 
            if (error) throw error;
            if (results.length <= 0) {
                db.query('INSERT INTO takes (u_id, c_id) VALUES(?,?)', [id, courseId], function (error, data) {
                    if (error) throw error;
                    req.session.save(function () {                        
                        sendData.isSuccess = "True"
                        res.send(sendData);
                    });
                });
            }
            else {                                    // DB에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "이미 수강중인 과목입니다!"
                res.send(sendData);  
            }            
        });        
    } else {
        sendData.isSuccess = "회원/과목 정보가 부족합니다!"
        res.send(sendData);  
    }
    
});

app.post("/signin", (req, res) => {  // 데이터 받아서 결과 전송
    const username = req.body.userId;
    const password = req.body.userPassword;
    const password2 = req.body.userPassword2;
    const role = req.body.role;
    const number = req.body.number;
    
    const sendData = { isSuccess: "" };

    let flag = 0;
    if (role == '교수' || role == '학생') {
        flag = 1;
    }

    if (username && password && password2 && flag == 1 && number) {
        db.query('SELECT * FROM user WHERE u_name = ?', [username], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0 && password == password2) {         // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                const hasedPassword = bcrypt.hashSync(password, 10);    // 입력된 비밀번호를 해시한 값
                db.query('INSERT INTO user (u_name, u_pw, u_role, u_number) VALUES(?,?,?,?)', [username, hasedPassword, role, number], function (error, data) {
                    if (error) throw error;
                    req.session.save(function () {                        
                        sendData.isSuccess = "True"
                        res.send(sendData);
                    });
                });
            } else if (password != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우                  
                sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다."
                res.send(sendData);
            }
            else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "이미 존재하는 아이디 입니다!"
                res.send(sendData);  
            }            
        });        
    } else {
        sendData.isSuccess = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);  
    }
    
});

app.post("/addcourse", (req, res) => {  // 데이터 받아서 결과 전송
    const c_name = req.body.c_name;
    const u_id = req.body.u_id;
    const u_pw = req.body.u_pw;
    
    const sendData = { isSuccess: "" };
    if (c_name && u_id && u_pw ){
        db.query('SELECT * FROM user WHERE u_name = ?', [u_id], function(error, results, fieelds) {
            if (error) throw error;
            if (results.length > 0) { 
                bcrypt.compare(u_pw , results[0].u_pw, (err, result) => {    // 입력된 비밀번호가 해시된 저장값과 같은 값인지 비교

                    if (result === true) {                  // 비밀번호가 일치하면
                        db.query('INSERT INTO course (c_name, t_id) VALUES(?,?)', [c_name, results[0].u_id], function (error, data) {
                            if (error) throw error;
                            req.session.save(function () {                        
                                sendData.isSuccess = "True"
                                res.send(sendData);
                            });
                        });    
                    }
                    else{                                   // 비밀번호가 다른 경우
                        sendData.isLogin = "강의자 정보가 일치하지 않습니다."
                        res.send(sendData);
                    }
                }) 
            }
            else {
                sendData.isSuccess = "해당 강의자 정보가 존재하지 않습니다!"
                res.send(sendData);
            }
        })
    }
    else {
        sendData.isSuccess = "강의 정보를 입력하세요!"
        res.send(sendData);
    }
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})