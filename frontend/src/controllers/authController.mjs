import showMessage from "../utils/showMessage.mjs";
import {backendServerBaseURL} from '../utils/constants.mjs'

export async function loginUser(email, password){
    const apiUrl = `${backendServerBaseURL}/auth/login`;
    const requestOptions = {
        method: "POST",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({email, password}),
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if(!response.ok)
                throw new Error('Network response was not ok when logging the user!!');
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => console.error(error));
}

export async function logoutUser(){
    const apiUrl = `${backendServerBaseURL}/auth/logout`;
    const token = sessionStorage.getItem('token');
    const requestOptions = {
        method: "POST",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    fetch(apiUrl, requestOptions)
    .then(response => {
        if(response.ok){
            // redirect to the homepage
            window.location.href = './index.html';
            // delete the sessionData
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user_id');
        }   
        else{
            const logoutErrorMessage = `Couldn't successfully log you out!`;
            console.error(logoutErrorMessage);
            showMessage(logoutErrorMessage);
        }
    });
}

export async function verifyCaptcha(token){

    const apiUrl = `${backendServerBaseURL}/auth/verifyCaptcha`;

    const requestOptions = {
        method: "POST",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({token})
    };

    return fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => data.captcha_success)
    .catch(error => console.error(error));
}

export async function registerUser(email, password){
    const apiUrl = `${backendServerBaseURL}/auth/register`;
    const requestOptions = {
        method: "POST",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({email, password}),
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if(!response.ok)
                throw new Error('Network response was not ok while registering the user!!');
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => console.error(error));

}