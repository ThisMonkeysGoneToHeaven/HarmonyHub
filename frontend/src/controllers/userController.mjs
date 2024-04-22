import { backendServerBaseURL } from "../utils/constants.mjs";

export const fetchUserData = async (userId, token) => {
    const apiUrl = `${backendServerBaseURL}/api/user/${userId}`;
    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if(!response.ok){
                console.log(response);
                throw new Error('Fetching User Data: Network response was not okay!');
            }
            return response.json();
        })
        .then(data => data)
        .catch(error => {
            console.error(error)
        });
};

export async function forgotPassword(email){
    const apiUrl = `${backendServerBaseURL}/api/user/forgotPassword`;

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({email}),
        headers:{
            'Content-Type': 'application/json'
        }
    }

    return fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

export async function resetPassword(email, token, password){
    const apiUrl = `${backendServerBaseURL}/api/user/resetPassword`;

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({email, token, password}),
        headers:{
            'Content-Type': 'application/json'
        }
    }

    return fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}