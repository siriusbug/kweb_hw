import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function RegCourse() {
    const [course, setCourse] = useState([]);
    const [u_id, setID] = useState([]);
    const userData = {
        userID: localStorage.getItem('u_id')
      }
    let user_id = ""

    useEffect(() => {
        fetch("http://localhost:3001/checkid", {
            method: "post",
            headers: {
            "content-type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(userData),
        }) 
            .then(response => response.json())
            .then(data => {
                setID(data); 
                // console.alert(data);
            })
            .catch(error => {
            console.error('Error: ', error);
            });
        }, []);
    user_id = u_id.u_id;
    let u_id_plz = localStorage.getItem('u_id');
    useEffect(() => {
    fetch("http://localhost:3001/courselist", {
        method: "get",
        headers: {
        "content-type": "application/json",
        },
        credentials: 'include',
    }) 
        .then(response => response.json())
        .then(data => {
            setCourse(data); 
        })
        .catch(error => {
        console.error('Error: ', error);
        });
    }, []);


    return (
        <div>
          <h2>강의 목록</h2>
          <ul>
            {course.map(course => (
              <li key={course.c_id}>
                <p>강의명: {course.c_name}
                교수자: {course.u_name}
                <input className="btn-reg" type="submit" value="수강신청" onClick={() => {
                    const regData = {
                    userId: u_id_plz,
                    courseId: course.c_id
                    };
                    fetch("http://localhost:3001/regcourse", { 
                    method: "post", 
                    headers: {      
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(regData), 
                    })
                    .then((res) => res.json())
                    .then((json) => {
                        if(json.isSuccess==="True"){
                        alert('수강신청이 완료되었습니다!')
                        }
                        else{
                        alert(json.isSuccess)
                        }
                    });
                }} /></p>
              </li>
            ))}
          </ul>
        </div>
    );
}

function ViewEnrolledCourses() {
  const [course, setCourse] = useState([]);
  const userData = {
    userID: localStorage.getItem('u_id')
  }

  useEffect(() => {
    fetch("http://localhost:3001/enrolledcourses", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })
      .then(response => response.json())
      .then(data => {
        setCourse(data); // Set enrolled courses state with fetched data
      })
      .catch(error => {
        console.error('Error fetching enrolled courses:', error);
      });
  }, []);

  return (
    <div>
      <h2>수강 중인 강의 목록</h2>
      <ul>
        {course.map(course => (
          <li key={course.id}>
            <p>강의명: {course.c_name}</p>
            <p>강의자: {course.u_name}</p>
            <Link to={`/post/${course.c_id}`}>게시물 확인</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


function Stud() {
  const [content, setContent] = useState("");

  const handleClickButton = (name) => {
    setContent(name);
  };

  const MAIN_DATA = [
    { id: 1, name: "regCourse", text: "수강 신청" },
    { id: 2, name: "viewEnrolledCourses", text: "수강 중인 강의 목록" }
  ];

  const selectComponent = {
    regCourse: <RegCourse />,
    viewEnrolledCourses: <ViewEnrolledCourses />
  };

  return (
    <div>
        <h2>학습자 페이지</h2>
      {MAIN_DATA.map(data => (
        <button className="screen-btn" onClick={() => handleClickButton(data.name)} key={data.id}>
          {data.text}
        </button>
      ))}
      {content && selectComponent[content]}
      <Link to="/logoutting">로그아웃</Link>
    </div>
  );
}

export default Stud;
