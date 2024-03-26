document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the form from submitting
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        // Perform validation and send data to the server
        if (!email || !password) {
            showMessage("Please fill in both email and password fields.", "error");
            return;
        }

        try{
            loginUser(email, password)
            .then(response => {
                
                if(response){
                    showMessage('Login Successfull', 'success');
                    // store the response and user_id in sessionStorage
                    sessionStorage.setItem("token", response.token);
                    sessionStorage.setItem("user_id", email);
                    // redirect to dashboard - the path here is relative to index.html and not this .js file
                    window.location.href = './dashboard.html';
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
    
});

async function loginUser(email, password){

    const apiUrl = "http://localhost:3000/auth/login";
    const requestOptions = {
        method: "POST",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({email, password}),
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if(!response.ok)
                throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // console.log(data);
            return data;
        })
        .catch(error => console.log(error));
}

function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;

    // Apply styles based on message type (e.g., success or error)
    messageDiv.className = type;
}
