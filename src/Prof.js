import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';


function AddCourse() {
  const [c_name, setName] = useState("");
  const [u_id, setTeacher] = useState("");
  const [u_pw, setPW] = useState("");

  return <>
    <h2>강의 등록</h2>
    <div className="form">
      <p><input className="login" type="text" placeholder="강의명" onChange={event => {
          setName(event.target.value);
        }} /></p>
      <p><input className="login" type="text" placeholder="강의자 ID" onChange={event => {
          setTeacher(event.target.value);
        }} /></p>
      <p><input className="login" type="password" placeholder="강의자 PW" onChange={event => {
        setPW(event.target.value);
      }} /></p>
    
    <p><input className="btn" type="submit" value="강의 등록" onClick={() => {
        const courseData = {
          c_name: c_name,
          u_id: u_id,
          u_pw: u_pw
        };
        fetch("http://localhost:3001/addcourse", { 
          method: "post", // method :통신방법
          headers: {      // headers: API 응답에 대한 정보를 담음
            "content-type": "application/json",
          },
          body: JSON.stringify(courseData), //userData라는 객체를 보냄
        })
          .then((res) => res.json())
          .then((json) => {
            if(json.isSuccess==="True"){
              alert('강의등록이 완료되었습니다!')
              // props.setMode("LOGIN");
            }
            else{
              alert(json.isSuccess)
            }
          });
      }} /></p>
      </div>

      <Link to="/logoutting">로그아웃</Link>
  </>
 
}

function ViewCourse() {
  const [courses, setCourses] = useState([]);
  const userData = {
    userID: localStorage.getItem('u_id')
  }
  
  useEffect(() => {
    // Fetch courses data from server when component mounts
    fetch("http://localhost:3001/viewcourses", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    }) 
      .then(response => response.json())
      .then(data => {
        setCourses(data); // Set courses state with fetched data
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
  }, []);

  return (
    <div>
      <h2>강의 목록</h2>
      <h5>{userData.userID}</h5>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <p>강의명: {course.c_name}</p>
            <p>강의자 ID: {course.u_name}</p>
            <Link to={`/post/${course.c_id}`}>게시물 등록</Link>
          </li>
        ))}
      </ul>
      <Link to="/logoutting">로그아웃</Link>
    </div>
  );
}

function Prof() {
  const [content, setContent] = useState("");

  const handleClickButton = (name) => {
    setContent(name);
  };

  const MAIN_DATA = [
    { id: 1, name: "addCourse", text: "강의 등록" },
    { id: 2, name: "viewCourse", text: "강의 조회" }
  ];

  const selectComponent = {
    addCourse: <AddCourse />,
    viewCourse: <ViewCourse />
  };

  return (
    <div>
      <h2>교수자 페이지</h2>
      {MAIN_DATA.map(data => (
        <button className="screen-btn" onClick={() => handleClickButton(data.name)} key={data.id}>
          {data.text}
        </button>
      ))}
      {content && selectComponent[content]}
    </div>
  );
}

export default Prof;