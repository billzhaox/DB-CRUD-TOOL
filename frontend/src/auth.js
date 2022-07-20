import {createAuthProvider} from 'react-token-auth'

export const {useAuth, authFetch, login, logout} =
    createAuthProvider({
        getAccessToken: 'access_token',
        onUpdateToken: (token) => fetch('/refresh', {
            method: 'POST',
            body: token.refresh_token
        })
        .then(r => r.json())
    })

const API = process.env.REACT_APP_API;

export function getUserName() {
    const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
    console.log(token)

    fetch(`${API}/getUser`,{
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(token)}`
        }
    })
    .then(res=>res.json())
    .then(rdata=>{
        if (rdata){
            console.log(rdata.uname)
            return rdata.uname
        }
        else{
            alert('Cannot get current user')
        }

    })
}