import React, { useState, useEffect } from "react";
import Alert from 'react-bootstrap/Alert';

const API = process.env.REACT_APP_API;

export const Permission = () => {

  let [users, setUsers] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorContent, setErrorContent] = useState("");
  

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
    if (res.ok) {
      data.forEach(function (element) {
        element.editing = 0;
      });
      setUsers(data);
      // console.log(data);
    } else {
      setShowAlert(false);
      setErrorContent(`ERROR ${res.status}:  ${data.message}`);
      setShowError(true);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const checkboxHandler = (id, perm) => () => {
    setUsers(
      users.map(user => 
          (user.id === id && user.editing === 1)
          ? {...user, permission : user.permission^perm} 
          : user 
    ));
  };

  const handleSubmit = async (id) => {
    // console.log(id)
    var editing = users.find(x => x.id === id).editing;
    if (editing === 0) {
      setUsers(
        users.map(user => 
            (user.id === id)
            ? {...user, editing : 1} 
            : user 
      ));
    } else {
        var permission = users.find(x => x.id === id).permission;
        const res = await fetch(`${API}/perms/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${JSON.parse(token)}`
          },
          body: JSON.stringify({permission:permission})
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(
            users.map(user => 
                (user.id === id)
                ? {...user, editing : 0} 
                : user 
          ));
          setShowAlert(true);
        } else {
          setShowAlert(false);
          setErrorContent(`ERROR ${res.status}:  ${data.message}`);
          setShowError(true);
        }    
    }
      
  };

  

  return (
    <>
    { showAlert &&
      <Alert variant="info" onClose={() => setShowAlert(false)} dismissible>
        <p>Successfully Updated!</p>
      </Alert>
    }
    { showError &&
      <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
        <p>{errorContent}</p>
      </Alert>
    }
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
                <td><input className="form-check-input" checked={(user.permission & 0x01)} onChange={checkboxHandler(user.id, 0x01)} type="checkbox"/></td>
                <td><input className="form-check-input" checked={(user.permission & 0x02)} onChange={checkboxHandler(user.id, 0x02)} type="checkbox"/></td>
                <td><input className="form-check-input" checked={(user.permission & 0x04)} onChange={checkboxHandler(user.id, 0x04)} type="checkbox"/></td>
                <td><input className="form-check-input" checked={(user.permission & 0x08)} onChange={checkboxHandler(user.id, 0x08)} type="checkbox"/></td>
                <td><input className="form-check-input" checked={(user.permission & 0x80)} onChange={checkboxHandler(user.id, 0x80)} type="checkbox"/></td>
                <td>
                  <button
                    className={user.editing === 1 ? "btn btn-danger btn-sm btn-block" : "btn btn-secondary btn-sm btn-block"}
                    onClick={(e) => handleSubmit(user.id)}
                  > 
                    {user.editing === 1 ? "Update" : "Edit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};
