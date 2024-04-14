export default function showMessage(message) {
    try{
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = message;    
    }
    catch(error){
        console.error('an error occured while priting message using the showMessage function');
    }
}