import showMessage from '../utils/showMessage.mjs';
import {verifyCaptcha} from '../controllers/authController.mjs';
import { forgotPassword } from '../controllers/userController.mjs';
import {isEmailValid} from '../utils/basicValidation.mjs';

document.addEventListener('DOMContentLoaded', function(){
    
    //captcha div 
    const recaptchaContainer = document.querySelector('.g-recaptcha');


    document.getElementById('forgotPasswordButton').addEventListener('click', function(){
        
        const email = document.getElementById('forgotPasswordEmail').value.toLowerCase();
        const messageBox = document.getElementById('message');

        if(!isEmailValid(email)){
            messageBox.textContent = 'Pls enter a valid email address';
            return;
        }

        // making sure the messageBox is clear of any warnings from previously enterred invalid emails
        messageBox.textContent = '';

        grecaptcha.ready(function(){
            grecaptcha.execute('6LfkBrwpAAAAAFnyEV5V2iX6sNyumzyKmbSHf1lK')
            .then(function(token){
                
                const isCaptchaValid = verifyCaptcha(token);

                if(isCaptchaValid === undefined){
                    console.error('error while verifying captcha');
                    showMessage('error while verifying captcha');
                    return;
                }

                if(!isCaptchaValid){
                    showMessage('captcha failed - suspicious activity detected, pls try again later!');
                    return;
                }

                console.log('captcha valid!');
            });
        });

        forgotPassword(email)
        .then(response => {
            // success, reset link sent to your email if it exists in our db
            // failure, something went wrong
            // DO THIS
            
        });

    });
});