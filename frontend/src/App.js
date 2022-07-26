import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { Permission } from "./components/Permission";
import { ItemsPage } from "./components/Items";
import { LoginPage } from "./components/Login";
import { SignUpPage } from "./components/SignUp";
import { OpsLog } from "./components/OpsLog";
import { DBForm } from "./components/Dbsetting";

function App() {
  const [showIt, setShowIt] = React.useState(false);
  const [columns, setColumns] = React.useState([]);

  return (
    <Router>
      <Navbar showIt={showIt} columns={columns}/>
      <div className="container p-4">
        <Routes>
          <Route path="/perms" element={<Permission/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/it" element={<ItemsPage/>} />
          <Route path="/" element={<DBForm showItChange={setShowIt} columnsChange={setColumns}/>} />
          <Route path="/opslog" element={<OpsLog/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
