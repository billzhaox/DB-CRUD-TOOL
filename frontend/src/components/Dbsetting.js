import React, { useState } from 'react'
import {Form,Button} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'

const API = process.env.REACT_APP_API;

export const DBForm=()=>{

    const {register,handleSubmit}=useForm()
    
    const [uri, setUri] = useState("");

    const navigate = useNavigate()

    const ConnectDB=(data)=>{
        // console.log(data)
 
        navigate('/it',{state:{dbs:data}})
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
                            {...register('uri',{required:true})}
                        />
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                        <Form.Label>Table Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="employee"
                            {...register('table_name',{required:true})}
                        />
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                        <Button as="sub" variant="primary" onClick={handleSubmit(ConnectDB)}>Connect</Button>
                    </Form.Group>
                </form>
            </div>
        </div>
    )
}