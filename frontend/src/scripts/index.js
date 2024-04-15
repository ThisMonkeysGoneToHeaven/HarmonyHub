import {loginUser} from "../controllers/authController.mjs";
import showMessage from "../utils/showMessage.mjs";

document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the form from submitting via HTML

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        // basic validation
        if (!email || !password) {
            showMessage("Please fill in both email and password fields.", "error");
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
                    window.location.href = '../../../frontend/dashboard.html';
                }
                else
                    showMessage('Login failed. Please check your credentials.', 'error');
            })
        }
        catch(error){
            console.error(error);
            showMessage("An error occurred. Please try again later.", "error");
        }        

    });

    document.getElementById('forgotPassword').addEventListener('click', function(){
        window.location.href = '../../../frontend/forgotPassword.html';
    });
});