import showMessage from "../utils/showMessage.mjs";

export async function loginUser(email, password){
    const apiUrl = "http://localhost:3000/auth/login";
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
        .catch(error => console.log(error));
}

export async function logoutUser(){
    const apiUrl = `http://localhost:3000/auth/logout`;
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

    const apiUrl = `http://localhost:3000/auth/verifyCaptcha`;

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
    .then(response => {
        if(response.ok){
            console.log(response);
        }
        else{
            console.log(response);
        }
    });
}