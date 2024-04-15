import showMessage from '../utils/showMessage.mjs';
import {verifyCaptcha} from '../controllers/authController.mjs';

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

                if(isCaptchaValid){
                    // start the forgot password proceess -> send the email to the forgotPassword function to be made in the auth/userController

                    // if everything goes right, we'll show a mssg saying that a reset link has been sent to your email, if it exists in our database
                    // otherwise, there was an error during reset password process
                }
                else{
                    // captcha failed - suspicious activity
                }             
            });
        });

    });
});