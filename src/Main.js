import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Prof from './Prof'
import Stud from './Stud'

function Login(props) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  
  return <>
    <h2>로그인</h2>

    <div className="form">
      <p><input className="login" type="text" name="username" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" name="pwd" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>

      <p><input className="btn" type="submit" value="로그인" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
        };
        fetch("http://localhost:3001/login", { //auth 주소에서 받을 예정
          method: "post", // method :통신방법
          headers: {      // headers: API 응답에 대한 정보를 담음
            "content-type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(userData), //userData라는 객체를 보냄
        })
          .then((res) => res.json())
          .then((json) => {            
            if(json.isLogin==="True"){
              localStorage.setItem('isLogin', 'True');
              localStorage.setItem('u_id', id);
              if(json.isProf === "True"){
                props.setMode("WELCOME PROF");
                localStorage.setItem('isProf', 'True');
              }
              else {
                props.setMode("WELCOME STUD");
                localStorage.setItem('isProf', 'False');
              }
              
            }
            else {
              alert(json.isLogin)
            }
          });
          // .then((json) => {            
          //   if(json.isLogin==="True"){
          //       // 로그인 성공 시
          //       localStorage.setItem('isLogin', 'True');
          //       if(json.isProf === "True"){
          //           localStorage.setItem('isProf', 'True');
          //           props.setMode("WELCOME PROF");
          //       } else {
          //           localStorage.setItem('isProf', 'False');
          //           props.setMode("WELCOME STUD");
          //       }
          //   } else {
          //       // 로그인 실패 시
          //       alert(json.isLogin);
          //   }
        // });
        }} /></p>
        </div>
        <br></br>
        <p>계정이 없으신가요?  <button onClick={() => {
          props.setMode("SIGNIN");
        }}>회원가입</button></p>
      </> 
    }
    
    function Signin(props) {
      const [id, setId] = useState("");
      const [password, setPassword] = useState("");
      const [password2, setPassword2] = useState("");
      const [role, setRole] = useState("");
      const [number, setNumber] = useState("");

      return <>
        <h2>회원가입</h2>
    
        <div className="form">
        <p><input className="login" type="text" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호 확인" onChange={event => {
        setPassword2(event.target.value);
      }} /></p>
      <p><input className="login" type="text" placeholder="교수 / 학생" onChange={event => {
        setRole(event.target.value);
      }} /></p>
      <p><input className="login" type="text" placeholder="학번" onChange={event => {
        setNumber(event.target.value);
      }} /></p>

      <p><input className="btn" type="submit" value="회원가입" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
          userPassword2: password2,
          role: role,
          number: number
        };
        fetch("http://localhost:3001/signin", { //signin 주소에서 받을 예정
          method: "post", // method :통신방법
          headers: {      // headers: API 응답에 대한 정보를 담음
            "content-type": "application/json",
          },
          body: JSON.stringify(userData), //userData라는 객체를 보냄
        })
          .then((res) => res.json())
          .then((json) => {
            if(json.isSuccess==="True"){
              alert('회원가입이 완료되었습니다!')
              props.setMode("LOGIN");
            }
            else{
              alert(json.isSuccess)
            }
          });
      }} /></p>
      </div>

<p>로그인화면으로 돌아가기  <button onClick={() => {
  props.setMode("LOGIN");
}}>로그인</button></p>
</> 
}

function Main() {
const [mode, setMode] = useState("");

useEffect(() => {
fetch("http://localhost:3001/authcheck")
  .then((res) => res.json())
  .then((json) => {        
    if (json.isLogin === "True") {
      if (json.isProf === "True") {
        setMode("WELCOME PROF");
      }
      else {
        setMode("WELCOME STUD");
      }
    }
    else {
      setMode("LOGIN");
    }
  });
}, []); 

let content = null;

if(mode==="LOGIN"){
content = <Login setMode={setMode}></Login> 
}
else if (mode === 'SIGNIN') {
content = <Signin setMode={setMode}></Signin> 
}
else if (mode === 'WELCOME PROF') {
//   content = <Prof></Prof>
  content = <>
  <h2>교수님, 메인 페이지에 오신 것을 환영합니다</h2>
  <p>로그인에 성공하셨습니다.</p>
  <Link to="/prof">교수자 페이지</Link>
  <br></br>
  <Link to="/logoutting">로그아웃</Link>
  </>
}
else if (mode === 'WELCOME STUD') {
    content = <>
    <h2>학습자님, 메인 페이지에 오신 것을 환영합니다</h2>
    <p>로그인에 성공하셨습니다.</p>
    <Link to="/stud">학습자 페이지</Link>
    <br></br>
    <Link to="/logoutting">로그아웃</Link>
    </>
}

return (
  <>
    <div className="background">
      {content}
    </div>
  </>
);
}

export default Main;