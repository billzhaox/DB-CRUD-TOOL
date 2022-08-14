import React, { useState, useEffect } from "react";
import {useLocation} from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

const API = process.env.REACT_APP_API;

export const ItemsPage = () => {
  const [id, setId] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState("");
  const [alertVariant, setAlertVariant] = useState("");

  const [editing, setEditing] = useState(false);

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
      const data = await res.json();
      if (res.ok) {
        setShowAlert(false);
        setAlertContent("Successfully Added!");
        setAlertVariant("info");
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertContent(`ERROR ${res.status}:  ${data.message}`);
        setAlertVariant("danger");
        setShowAlert(true);
      }
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
      if (res.ok) {
        setEditing(false);
        setId("");
        setShowAlert(false);
        setAlertContent("Successfully Updated!");
        setAlertVariant("info");
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertContent(`ERROR ${res.status}:  ${data.message}`);
        setAlertVariant("danger");
        setShowAlert(true);
      }
      
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
    // console.log(data);
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
      const data = await res.json();
      if (res.ok) {
        await getItems();
        setShowAlert(false);
        setAlertContent("Successfully Deleted!");
        setAlertVariant("info");
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertContent(`ERROR ${res.status}:  ${data.message}`);
        setAlertVariant("danger");
        setShowAlert(true);
      }
    }
  };

  const editItem = async (id) => {
    const res = await fetch(`${API}/items/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${JSON.parse(token)}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      setEditing(true);
      setId(id);
      // Reset
      var newObj = {};
      fields.forEach((field) => newObj[field.c_name] = data[field.c_name]);
      setThisObj(newObj);
    } else {
      setShowAlert(false);
      setAlertContent(`ERROR ${res.status}:  ${data.message}`);
      setAlertVariant("danger");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (location.state.hasOwnProperty("columns")){
      setFields(location.state.columns);
    }
    getItems();
  }, []);

  return (
    <>
    { showAlert &&
        <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
          <p>{alertContent}</p>
        </Alert>
    }
    <div className="row">
      <div className="col-md-4">
        <form className="card card-body">
          {fields.map((field) => (
            <>
              <Form.Group>
                <Form.Control
                  type= "text"
                  onChange={(e) => setThisObj({
                    ...thisObj,
                    [field.c_name]: e.target.value
                })}
                  value={thisObj[field.c_name]}
                  placeholder={field.c_name}
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
              {fields.map((field) => (<th>{field.c_name}</th>))}
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {fields.map((field) => (<td>{item[field.c_name]}</td>))}
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
    </>
  );
};
