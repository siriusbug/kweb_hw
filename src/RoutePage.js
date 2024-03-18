import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import SignupPage from './components/SignupPage';
// import CourseManagementPage from './components/CourseManagementPage';
import App from './App';
import Prof from './Prof';
import Stud from './Stud';
import Post from './Post';
import Logoutting from './Logoutting';

function RoutePage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}></Route>
        <Route path="/prof" element={<Prof/>}></Route>
        <Route path="/stud" element={<Stud/>}></Route>
        <Route path="/post/:c_id" element={<Post/>}></Route>
        <Route path="/logoutting" element={<Logoutting/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutePage;
