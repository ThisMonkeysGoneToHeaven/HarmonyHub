import showMessage from '../utils/showMessage.mjs';
import {verifyCaptcha, forgotPassword} from '../controllers/authController.mjs';

document.addEventListener('DOMContentLoaded', function(){

    function isEmailValid(email){
        // this regex checks for the format text@text.com where text is a string of one or more characters, not including an @ or whitespace
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    //captcha div 
    const recaptchaContainer = document.querySelector('.g-recaptcha');


    document.getElementById('forgotPasswordButton').addEventListener('click', function(){
        
        const email = document.getElementById('forgotPasswordEmail').value;
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
            // failure, something went wrong nigga
        });

    });
});