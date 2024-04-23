import showMessage from "../utils/showMessage.mjs";
import {backendServerBaseURL} from '../utils/constants.mjs'

const connectSpotify = async () => {
    const apiUrl = `${backendServerBaseURL}/api/spotify/connect`;
    const token = sessionStorage.getItem('token');

    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            // 'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    fetch(apiUrl, requestOptions)
    .then(response => response.text())
    .then(data => {
        console.log('redirect to auth server successful.');
        window.location.href=data;
    })
    .catch(error => {
        const spotifyConnectError = 'an issue occured during connecting to spotify';
        console.error(spotifyConnectError + ' : ' + error);
        showMessage(spotifyConnectError);    
    });
}

const disconnectSpotify = async () => {
        
    const apiUrl = `${backendServerBaseURL}/api/spotify/disconnect`;
    const token = sessionStorage.getItem('token');

    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => {
        if(data.message !== undefined){
            console.log(data.message);
            location.reload();
        }
        else
            throw new Error(data.error);
        })
    .catch(error => {
        const spotifyDisconnectError = 'an issue occured during disconnecting spotify';
        console.error(spotifyDisconnectError + ' : ' + error);
        showMessage(spotifyDisconnectError);    
    });
}

const fetchUsersTopArtists = async (token) => {

    const apiUrl = `${backendServerBaseURL}/api/spotify/topArtists`;
    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    return fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => {
        console.error(`Error Fetching User's Top Aritsts` + error);
    })    
}

export {disconnectSpotify, fetchUsersTopArtists, connectSpotify};