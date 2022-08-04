import React, { useState, useEffect, useRef } from "react";
import {useLocation} from 'react-router-dom';

const API = process.env.REACT_APP_API;

export const Permission = () => {

  let [users, setUsers] = useState([]);

  const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

  const getUsers = async () => {
    const res = await fetch(`${API}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${JSON.parse(token)}`
      }
    });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="row">
      <div className="col">
        <table className="table table-striped">
          <thead>
            <tr>
              <td rowspan="2" style={{verticalAlign:'middle',fontWeight: 'bold'}}>User Name</td>
              <td rowspan="2" style={{verticalAlign:'middle',fontWeight: 'bold'}}>Email</td>
              <th colspan="5" style={{textAlign:'center',fontWeight: 'bold'}}>Permissions</th>
            </tr>
            <tr>
              <th>Read</th>
              <th>Create</th>
              <th>Update</th>
              <th>Delete</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><input checked={(user.permission & 0x01)} type="checkbox"/></td>
                <td><input checked={(user.permission & 0x02)} type="checkbox"/></td>
                <td><input checked={(user.permission & 0x04)} type="checkbox"/></td>
                <td><input checked={(user.permission & 0x08)} type="checkbox"/></td>
                <td><input checked={(user.permission & 0x80)} type="checkbox"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
