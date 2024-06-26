import showMessage from '../utils/showMessage.mjs';
import {fetchUserData} from '../controllers/userController.mjs';
import {logoutUser} from '../controllers/authController.mjs';
import {connectSpotify, disconnectSpotify, fetchUsersTopArtists} from '../controllers/spotifyController.mjs';

document.addEventListener("DOMContentLoaded", function(){

    const logoutButton = document.getElementById('logoutButton');
    const connectSpotifyButton = document.getElementById('connectSpotifyButton');
    const disconnectSpotifyButton = document.getElementById('disconnectSpotifyButton');

    try{
        const userId = sessionStorage.getItem('user_id');
        const token = sessionStorage.getItem('token');

         fetchUserData(userId, token)
        .then(async response => {

            if(response && response.email){

                const nameSpan = document.getElementById('username');
                nameSpan.innerHTML = `${response.username}`;
                const welcomeElement = document.getElementById('welcomeElement');
                welcomeElement.innerHTML = `<h3>Welcome to HarmonyHub, ${response.email}</h3>`;

                if(response.isSpotifyConnected){
                    const artistContainer = document.getElementById('artistContainer');
                    const usersTopArtists = await fetchUsersTopArtists(token);
                    usersTopArtists.items.forEach(artist => {

                        const artistElement = document.createElement('div');
                        artistElement.className = 'artist';

                        const artistImage = document.createElement('img');
                        artistImage.className = 'artistImage';
                        artistImage.src = artist.images[0].url;            

                        const artistName = document.createElement('h2');
                        artistName.textContent = artist.name;

                        artistElement.appendChild(artistName);
                        artistElement.appendChild(artistImage);
                        artistContainer.appendChild(artistElement);
                    });
                    disconnectSpotifyButton.innerHTML = `<button>Disconnect Spotify</button>`;
                } 
                else{
                    const connectSpotifyButton = document.getElementById('connectSpotifyButton');
                    connectSpotifyButton.innerHTML = `<button>Connect Spotify</button>`;
                }
            }
            else{
                const userDataResponseError = 'User data response is invalid!';
                showMessage(userDataResponseError);
                console.error(userDataResponseError);
            }
        })
    }
    catch(error){
        console.error(error);
        showMessage('An error occured while fetching user data!');        
    }

    disconnectSpotifyButton.addEventListener('click', function(){
        disconnectSpotify();
    });

    connectSpotifyButton.addEventListener('click', function(){
        connectSpotify();
    });

    logoutButton.addEventListener('click', function(){
        logoutUser();
    });
});