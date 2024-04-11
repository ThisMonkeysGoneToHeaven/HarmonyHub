document.addEventListener("DOMContentLoaded", function(){

    const fetchUsersTopArtists = async (token) => {

        const apiUrl = `http://localhost:3000/api/spotify/topArtists`;
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
        .then(data => data)
        .catch(error => {
            console.error(`Error Fetching User's Top Aritsts` + error);
        })    
    }

    const fetchUserData = async (userId, token) => {
        const apiUrl = `http://localhost:3000/api/user/${userId}`;
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
    
    try{
        const userId = sessionStorage.getItem('user_id');
        const token = sessionStorage.getItem('token');

         fetchUserData(userId, token)
        .then(async response => {
            if(response.email){
                const nameSpan = document.getElementById('username');
                nameSpan.innerHTML = `${response.username}`;
                const welcomeElement = document.getElementById('welcomeElement');
                welcomeElement.innerHTML = `<h3>Welcome to HarmonyHub, ${response.email}</h3>`;
                if(response.isSpotifyConnected){
                    const spotifyData = document.getElementById('spotifyData');
                    let spotifyDataHTML = ``;

                    const usersTopArtists = await fetchUsersTopArtists(token);
                    console.log(usersTopArtists);

                    disconnectSpotifyButton.innerHTML = `<button>Disconnect Spotify</button>`;
                } 
                else{
                    const connectSpotifyButton = document.getElementById('connectSpotifyButton');
                    connectSpotifyButton.innerHTML = `<button>Connect Spotify</button>`;
                }
            }
            else{
                const userDataResponseError = 'User data response is invalid!';
                showMessage(userDataResponseError, 'error');
                console.error(userDataResponseError);
            }
        })
    }
    catch(error){
        console.error(error);
        showMessage('An error occured while fetching user data!', 'error');        
    }

    const logoutButton = document.getElementById('logoutButton');
    const connectSpotifyButton = document.getElementById('connectSpotifyButton');
    const disconnectSpotifyButton = document.getElementById('disconnectSpotifyButton');

    disconnectSpotifyButton.addEventListener('click', function(){
        const apiUrl = 'http://localhost:3000/api/spotify/disconnect';
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
    });

    connectSpotifyButton.addEventListener('click', function(){

        const apiUrl = 'http://localhost:3000/api/spotify/connect';
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
    });


    logoutButton.addEventListener('click', function(){

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
                showMessage(logoutErrorMessage, 'error');
            }
        });

    });

    const showMessage = (mssg, type) => {
        const messageDiv = document.getElementById('messageDiv');
        console.log('logging: ' + mssg);
        messageDiv.textContent(mssg);
        messageDiv.className(type);
    };
    
});
