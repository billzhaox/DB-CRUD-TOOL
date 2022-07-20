import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { About } from "./components/About";
import { Employee } from "./components/Employee";
import { LoginPage } from "./components/Login";
import { SignUpPage } from "./components/SignUp";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container p-4">
        <Routes>
          <Route path="/about" element={<About/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/" element={<Employee/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
