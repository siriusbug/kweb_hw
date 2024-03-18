import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Logoutting() {

    localStorage.removeItem('isLogin');
    localStorage.removeItem('u_id');
    localStorage.removeItem('isProf');

    let content = null;

    content = <>
    <h2>로그아웃하셨습니다.</h2>
    <Link to="/">로그인 페이지</Link>  
    </>

    return (
    <>
        <div className="background">
        {content}
        </div>
    </>
    );
}

export default Logoutting;