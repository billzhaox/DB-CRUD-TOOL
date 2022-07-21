import React, { useState, useEffect, useRef } from "react";
import {useLocation} from 'react-router-dom';

const API = process.env.REACT_APP_API;

export const Employee = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const [editing, setEditing] = useState(false);

  const nameInput = useRef(null);

  const location = useLocation();

  let [employees, setEmployees] = useState([]);

  const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing) {
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        },
        body: JSON.stringify({
          name,
          email,
          department
        }),
      });
      await res.json();
    } else {
      const res = await fetch(`${API}/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        },
        body: JSON.stringify({
          name,
          email,
          department
        }),
      });
      const data = await res.json();
      console.log(data);
      setEditing(false);
      setId("");
    }
    await getEmployees();

    setName("");
    setEmail("");
    setDepartment("");
    nameInput.current.focus();
  };

  const getEmployees = async () => {
    const res = await fetch(`${API}/employees`);
    const data = await res.json();
    setEmployees(data);
  };

  const deleteEmployee = async (id) => {
    const userResponse = window.confirm("Are you sure you want to delete this record?");
    if (userResponse) {
      const res = await fetch(`${API}/employees/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        }
      });
      await getEmployees();
    }
  };

  const editEmployee = async (id) => {
    const res = await fetch(`${API}/employees/${id}`);
    const data = await res.json();

    setEditing(true);
    setId(id);

    // Reset
    setName(data.name);
    setEmail(data.email);
    setDepartment(data.department);
    nameInput.current.focus();
  };

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <div className="row">
      <div className="col-md-4">
        <form onSubmit={handleSubmit} className="card card-body">
          <div className="form-group">
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="form-control"
              placeholder="Name"
              ref={nameInput}
              autoFocus
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="form-control"
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              onChange={(e) => setDepartment(e.target.value)}
              value={department}
              className="form-control"
              placeholder="Department"
            />
          </div>
          <button className="btn btn-primary btn-block">
            {editing ? "Update" : "Add"}
          </button>
        </form>
      </div>
      <div className="col-md-6">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm btn-block"
                    onClick={(e) => editEmployee(employee.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-block"
                    onClick={(e) => deleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
