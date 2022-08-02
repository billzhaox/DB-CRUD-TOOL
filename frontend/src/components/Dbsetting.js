import React, { useState, useEffect } from 'react'
import {Form, Button, Dropdown} from 'react-bootstrap'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'

const API = process.env.REACT_APP_API;

export const DBForm=()=>{

    const {register,handleSubmit}=useForm()
    
    const [uri, setUri] = useState("");
    const [tablelist, setTablelist] = useState([]);
    const [columns, setColumns] = useState([]);
    const [checkedColumns, setCheckedColumns] = useState({});

    const [showTableList, setShowtablelist] = useState(false);
    const [showColumnList, setShowColumnList] = useState(false);
    

    const navigate = useNavigate()

    const connectDB = async (e) => {
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
        setShowtablelist(true);
    }

    const handleSelectTable = async (e) => {
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
        setColumns(data);
        setShowColumnList(true);
        // navigate('/it',{state:{columns:data}});
    }

    const toggleHandler = (column, index) => () => {
        setCheckedColumns({
            ...checkedColumns,
            [index]: checkedColumns[index] ? null : column
        });
    }

    const toNextPage = (e) => {
        var arr = Object.values(checkedColumns).filter(e => {
            return e !== null;
        }); 
        console.log(arr);
        navigate('/it',{state:{columns:Object.values(arr)}});
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
                        <br></br>
                        <Button variant="primary" onClick={connectDB}>Connect</Button>
                    </Form.Group>
                    <br></br>
                    {showTableList &&
                        <Form.Group>
                            <Dropdown onSelect={handleSelectTable}>
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
                    }

                    {showColumnList &&
                        <Form.Group>
                            {columns.map((column, index) => (
                                <tr
                                    key={index}
                                    style={{
                                    display: "flex",
                                    width: "150px"
                                    }}
                                >
                                    <input
                                    onChange={toggleHandler(column, index)}
                                    checked={checkedColumns[index]}
                                    style={{ margin: "20px" }}
                                    type="checkbox"
                                    />
                                    <td style={{ margin: "20px" }}>{column}</td>
                                </tr>
                            ))}
                            <br></br>
                            <Button variant="primary" onClick={toNextPage}>Next</Button>
                        </Form.Group>
                    }
                </form>
            </div>
        </div>
    )
}