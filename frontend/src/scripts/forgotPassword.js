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
                    const captchaErrorMssg = 'error while verifying captcha';
                    console.error(captchaErrorMssg);
                    showMessage(captchaErrorMssg);
                    return;
                }

                if(!isCaptchaValid){
                    showMessage('captcha failed - suspicious activity detected, pls try again later!');
                    return;
                }
            });
        });

        forgotPassword(email)
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