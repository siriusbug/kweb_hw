import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';


function Post_prof() {
  const {c_id} = useParams();
  const [p_title, setTitle] = useState("");
  const [p_content, setContetnt] = useState("");

  return <>
    <h2>{}</h2>
    <h2>게시물 등록 페이지</h2>
    <div className="form">
      <p><input className="login" type="text" placeholder="게시물 제목" onChange={event => {
          setTitle(event.target.value);
        }} /></p>
      <p><input className="login" type="text" placeholder="게시물 내용" onChange={event => {
          setContetnt(event.target.value);
        }} /></p>
    <p><input className="btn" type="submit" value="게시물 등록" onClick={() => {
        const postData = {
          p_title: p_title,
          p_content: p_content,
          c_id: c_id
        };
        fetch("http://localhost:3001/addpost", { 
          method: "post", // method :통신방법
          headers: {      // headers: API 응답에 대한 정보를 담음
            "content-type": "application/json",
          },
          body: JSON.stringify(postData), //userData라는 객체를 보냄
        })
          .then((res) => res.json())
          .then((json) => {
            if(json.isSuccess==="True"){
              alert('게시물 등록이 완료되었습니다!')
              // props.setMode("LOGIN");
            }
            else{
              alert(json.isSuccess)
            }
          });
      }} /></p>
      </div>
  </>
 
}

function Post_stud() {
  const [post, setPost] = useState([]);
  const {c_id} = useParams();
  const courseData = {
    c_id: c_id
  }
  
  useEffect(() => {
    // Fetch courses data from server when component mounts
    fetch("http://localhost:3001/viewpost", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(courseData),
    }) 
      .then(response => response.json())
      .then(data => {
        setPost(data); // Set courses state with fetched data
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
  }, []);

  return (
    <div>
      <h2>{post.c_name} 게시물 목록</h2>
      <h5>교수자 : {post.u_name}</h5>
      <ul>
        {post.map(post => (
          <li key={post.id}>
            <p>제목: {post.p_title}</p>
            <p>내용: {post.p_content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Post() {
  let content = null;
  
  if (localStorage.getItem('isProf') == 'True') {
    content = <Post_prof></Post_prof>
  }
  else {
    content = <Post_stud></Post_stud>
  }

  return (
    <div>
      {content}
      <Link to="/logoutting">로그아웃</Link>
    </div>
  );
}

export default Post;