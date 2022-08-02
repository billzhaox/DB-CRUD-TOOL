import React, { useState, useEffect, useRef } from "react";
import {useLocation} from 'react-router-dom';
import {Form,Button} from 'react-bootstrap'

const API = process.env.REACT_APP_API;

export const ItemsPage = () => {
  const [id, setId] = useState("");

  const [editing, setEditing] = useState(false);

  const nameInput = useRef(null);

  const location = useLocation();

  let [items, setItems] = useState([]);
  let [fields, setFields] = useState([]);

  const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

  let [thisObj, setThisObj] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing) {
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        },
        body: JSON.stringify(thisObj)
      });
    } else {
      const res = await fetch(`${API}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        },
        body: JSON.stringify(thisObj)
      });
      const data = await res.json();
      console.log(data);
      setEditing(false);
      setId("");
    }

    await getItems();
    var new_obj = {...thisObj};
    for (const key in new_obj) {
      new_obj[key]='';
    }
    setThisObj(new_obj);

    // nameInput.current.focus();
  };

  const getItems = async () => {
    const res = await fetch(`${API}/items`);
    const data = await res.json();
    setItems(data);
  };

  const deleteItem = async (id) => {
    const userResponse = window.confirm("Are you sure you want to delete this record?");
    if (userResponse) {
      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${JSON.parse(token)}`
        }
      });
      await getItems();
    }
  };

  const editItem = async (id) => {
    const res = await fetch(`${API}/items/${id}`);
    const data = await res.json();

    setEditing(true);
    setId(id);

    // console.log(data)

    // Reset
    var newObj = {};
    fields.forEach((field) => newObj[field] = data[field]);
    setThisObj(newObj);


    // nameInput.current.focus();
  };

  useEffect(() => {
    setFields(location.state.columns);
    getItems();
  }, []);

  return (
    <div className="row">
      <div className="col-md-4">
        <form className="card card-body">
          {fields.map((field) => (
            <>
              <Form.Group>
                <Form.Control
                  type= {field == "timestamp" ? "time" : "text"}
                  onChange={(e) => setThisObj({
                    ...thisObj,
                    [field]: e.target.value
                })}
                  value={thisObj[field]}
                  placeholder={field}
                />
              </Form.Group>
              <br></br>
            </>
            ))}
          <Button variant="primary" onClick={handleSubmit} >
            {editing ? "Update" : "Add"}
          </Button>
        </form>
      </div>
      <div className="col-md-6">
        <table className="table table-striped">
          <thead>
            <tr>
              {fields.map((field) => (<th>{field}</th>))}
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {fields.map((field) => (<td>{item[field]}</td>))}
                <td>
                  <button
                    className="btn btn-secondary btn-sm btn-block"
                    onClick={(e) => editItem(item.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-block"
                    onClick={(e) => deleteItem(item.id)}
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
