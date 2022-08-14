import React, { useState } from 'react'
import {Form, Button, Alert} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {useForm} from 'react-hook-form'
import { login } from '../auth'
import {useNavigate} from 'react-router-dom'

const API = process.env.REACT_APP_API;

export const LoginPage = () => {
    
    const {register,handleSubmit,reset,formState:{errors}}=useForm();

    const navigate = useNavigate();

    const [showError, setShowError] = useState(false);
    const [errorContent, setErrorContent] = useState("");
    
    const loginUser = async (data) => {
    // console.log(data)

       const requestOptions={
           method:"POST",
           headers:{
               'content-type':'application/json'
           },
           body:JSON.stringify(data)
       };
        
       const res = await fetch(`${API}/login`,requestOptions);
       const rdata = await res.json();
       if (res.ok) {
            login(rdata.access_token);
            reset();
            navigate('/',{state:{uname:data.username}});
       } else {
            setErrorContent(`ERROR ${res.status}:  ${rdata.message}`);
            setShowError(true);
       }
    }

    return(
        <div className="container">
        <div className="form">
            { showError &&
                <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                    <p>{errorContent}</p>
                </Alert>
            }
            <h1>Login Page</h1>
            <form>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text"
                        placeholder="Your username"
                        {...register('username',{required:true,maxLength:25})}
                    />
                </Form.Group>
                {errors.username && <p style={{color:'red'}}><small>Username is required</small></p>}
                {errors.username?.type === "maxLength" && <p style={{color:'red'}}><small>Max characters should be 25</small></p>}
                <br></br>
               
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password"
                        placeholder="Your password"
                        {...register('password',{required:true,minLength:8})}
                    />
                    {errors.username && <p style={{color:'red'}}><small>Password is required</small></p>}
                    {errors.password?.type === "minLength" && <p style={{color:'red'}}>
                        <small>Password should be more than 8 characters</small>
                        </p>}
                </Form.Group>
                <br></br>
                <Form.Group>
                    <Button as="sub" variant="primary" onClick={handleSubmit(loginUser)}>Login</Button>
                </Form.Group>
                <br></br>
                <Form.Group>
                    <small>Do not have an account? <Link to='/signup'>Create One</Link></small>
                </Form.Group>
                
            </form>
        </div>
    </div>
    )
}