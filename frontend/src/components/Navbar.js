import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, logout} from '../auth'
import { Tools } from 'react-bootstrap-icons';

const API = process.env.REACT_APP_API;

export const Navbar = ({showIt, columns}) => {
  const [logged] = useAuth();
  const [uname, setUname] = useState("");

  useEffect(() => {
    // console.log(logged);
    if(logged){
      const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
      // console.log(token)
  
      fetch(`${API}/getUser`,{
          method: 'GET',
          headers: {
              'content-type': 'application/json',
              'Authorization': `Bearer ${JSON.parse(token)}`
          }
      })
      .then(async res => {
        const rdata =  await res.json();
        if (res.ok) {
          setUname(rdata.uname);
        } else {
          var msg = rdata.hasOwnProperty("message")? rdata.message : rdata.msg
          alert(`ERROR ${res.status}:  ${msg}`);
        }
      })
      .catch(error => {
        console.log(error);
      })
    }
  }, [logged]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/"><Tools/>  DB CRUD Tool</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav"> 
          {showIt &&
            <li className="nav-item">
              <Link className="nav-link" to="/it" state={{ columns: columns }}>Table</Link>
            </li>
          }
          {logged?
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/opslog">Operations Log</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/perms">Permissions</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link">Hi, {uname}!</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="#" onClick={()=>{logout()}}>Log Out</a>
            </li>
          </>
          :
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/login">Log In</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">Sign Up</Link>
            </li>
          </>
          }
          
        </ul>
      </div>
    </nav>
  )
  
}
  