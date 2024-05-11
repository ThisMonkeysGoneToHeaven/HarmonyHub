import {isPasswordValid} from '../utils/basicValidation.mjs';
import showMessage from '../utils/showMessage.mjs';
import { resetPassword } from '../controllers/userController.mjs';

document.addEventListener("DOMContentLoaded", function(){
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('userId');

    document.getElementById('resetPasswordButton').addEventListener('click', function(event){
        event.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if(!isPasswordValid(password)){
            showMessage('Unacceptable password. Make sure the criteria is fulfilled.');
            return;
        }

        if(password !== confirmPassword){
            showMessage('Password and Confirm Password don\'t match. Try Again!');
            return;
        }


        resetPassword(email, token, password)
        .then(data => {
            if(data.message)
                showMessage(data.message);
            else if(data.error)
                showMessage(data.error)
            else
                showMessage(`Something went wrong. Pls try again later!`);
        });
    });
});