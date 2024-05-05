import { registerationCompletion } from "../controllers/userController.mjs";
import showMessage from "../utils/showMessage.mjs";

document.addEventListener('DOMContentLoaded', function(){

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('userId');

    showMessage('Wait while we confirm your registeration ... ');

    registerationCompletion(email, token)
    .then(data => {
        if(data.message)
            showMessage(data.message);
    })
    .catch(error => {
        showMessage('Something went wrong mate. Try again later :(')
    });
});