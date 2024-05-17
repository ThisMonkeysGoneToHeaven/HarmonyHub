import {loginUser, registerUser} from "../controllers/authController.mjs";
import showMessage from "../utils/showMessage.mjs";
import {isEmailValid, isPasswordValid} from '../utils/basicValidation.mjs';

document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the form from submitting via HTML

        const email = document.getElementById("email").value.toLowerCase();
        const password = document.getElementById("password").value;
        
        // basic validation
        if(!isEmailValid(email) || !isPasswordValid(password)){
            showMessage("Please enter valid email and password!");
            return;
        }
        
        try{
            loginUser(email, password)
            .then(response => {                
                if(response){
                    showMessage('Login Successfull', 'success');
                    sessionStorage.setItem("token", response.token);
                    sessionStorage.setItem("user_id", email);
                    // redirect to dashboard - the path here is relative to index.html and not this .js file
                    window.location.href = '../../dashboard.html';
                }
                else
                    showMessage('Login failed. Please check your credentials.', 'error');
            })
        }
        catch(error){
            console.error(error);
            showMessage("An error occurred while logging in. Please try again later.");
        }        

    });

    document.getElementById('forgotPassword').addEventListener('click', function(){
        window.location.href = '../../forgotPassword.html';
    });

    document,this.getElementById('registerForm').addEventListener('submit', function(event){
        event.preventDefault();

        const email = document.getElementById('register-email').value.toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if(password !== confirmPassword){
            showMessage('Passwords don\'t match!');
            return;
        }

        // basic validation
        if(!isEmailValid(email) || !isPasswordValid(password)){
            showMessage("Please enter valid email and password!");
            return;
        }
        
        registerUser(email, password)
        .then(response => {
            if(response){
                showMessage('A link has been sent to your email address. Please check it within next 5 minutes!')
            }
            else{
                showMessage('Something probably went wrong mate :( ');
            }
        })
        .catch(error => {
            console.error(error);
            showMessage("An error occurred while registering the user. Please try again!");
        });
        
    });
});