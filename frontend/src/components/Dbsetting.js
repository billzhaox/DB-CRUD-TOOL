import React, { useState } from 'react'
import {Form, Button, Dropdown} from 'react-bootstrap'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'

const API = process.env.REACT_APP_API;

export const DBForm=()=>{

    const {register,handleSubmit}=useForm()
    
    const [uri, setUri] = useState("");
    const [tablelist, setTablelist] = useState([]);

    const navigate = useNavigate()

    const ConnectDB = async (e) => {
        e.preventDefault();
        // console.log(data);

        const res = await fetch(`${API}/dbset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uri:uri
            }),
          });
        const data = await res.json();
        setTablelist(data);
    }

    const handleSelect = async (e)=>{
        // console.log(e);
        const res = await fetch(`${API}/tbset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
                table_name:e
            }),
        });
        const data = await res.json();
        navigate('/it',{state:{columns:data}});
    }
    


    return(
        <div className="container">
            <div className="form">
                <h1>Database Setting</h1>
                <form>
                    <Form.Group>
                        <Form.Label>URI</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="sqlite:///myweb.db"
                            onChange={(e) => setUri(e.target.value)}
                            value={uri}
                        />
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                        <Button as="sub" variant="primary" onClick={ConnectDB}>Connect</Button>
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                        <Dropdown onSelect={handleSelect}>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                Table Name
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {tablelist.map((table) => (
                                    <Dropdown.Item eventKey={table}>{table}</Dropdown.Item>
                                ))}                            
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>
                    <br></br>
                </form>
            </div>
        </div>
    )
}