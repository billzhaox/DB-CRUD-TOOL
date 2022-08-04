import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, logout, getUserName} from '../auth'

const API = process.env.REACT_APP_API;

export const Navbar = () => {
  const [logged] = useAuth();
  const [uname, setUname] = useState("");
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
    .then(res=>res.json())
    .then(rdata=>{
        if (rdata){
            // console.log(rdata.uname)
            setUname(rdata.uname)
        }
        else{
            alert('Cannot get current user')
        }

    })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">DB CRUD Tool</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
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
  