import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {Form, Button, Dropdown, Alert} from 'react-bootstrap'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const API = process.env.REACT_APP_API;

export const DBForm = ({showItChange, columnsChange}) => {
    
    const [uri, setUri] = useState("");
    const [tablelist, setTablelist] = useState([]);
    const [columns, setColumns] = useState([]);
    const [checkedColumns, setCheckedColumns] = useState({});

    const [showTableList, setShowtablelist] = useState(false);
    const [showColumnList, setShowColumnList] = useState(false);

    const [curTable, setCurTable] = useState("Table Name");

    const [showError, setShowError] = useState(false);
    const [errorContent, setErrorContent] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

    const connectDB = async (e) => {
        e.preventDefault();
        // console.log(data);

        const res = await fetch(`${API}/dbset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${JSON.parse(token)}`
            },
            body: JSON.stringify({
                uri:uri
            }),
          });
        const data = await res.json();
        if (res.ok) {
            setTablelist(data);
            setShowtablelist(true);
        } else {
            setErrorContent(`ERROR ${res.status}:  ${data.message}`);
            setShowError(true);
        }
    }

    const handleSelectTable = async (e) => {
        // console.log(e);
        setCurTable(e);
        const res = await fetch(`${API}/tbset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${JSON.parse(token)}`
            },
            body: JSON.stringify({
                table_name:e
            }),
        });
        const data = await res.json();
        if (res.ok) {
            setColumns(data);
            setShowColumnList(true);
        } else {
            setErrorContent(`ERROR ${res.status}:  ${data.message}`);
            setShowError(true);
        }
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
        // console.log(arr);
        showItChange(true);
        columnsChange(arr);
        navigate('/it',{state:{columns:arr}});
    }

    return(
        <div className="container">
            <div>
                { showError &&
                    <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                        <p>{errorContent}</p>
                    </Alert>
                }
                <h1>Database Setting</h1>
                <br></br>
                <Form>
                    <Row className="align-items-center">
                        <Col xs="auto">
                            <Form.Label>URI:</Form.Label>
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                placeholder="sqlite:///myweb.db"
                                onChange={(e) => setUri(e.target.value)}
                                value={uri}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" onClick={connectDB}>Connect</Button>
                        </Col>     
                    </Row>
                    <br></br>
                    {showTableList &&
                        <Form.Group>
                            <Dropdown onSelect={handleSelectTable}>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {curTable}
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
                                    <td style={{ margin: "20px" }}>{column.c_name}</td>
                                    <td style={{ margin: "20px" }}>{column.c_type}</td>
                                </tr>
                            ))}
                            <br></br>
                            <Button variant="primary" onClick={toNextPage}>Next</Button>
                        </Form.Group>
                    }
                </Form>
            </div>
        </div>
    )
}