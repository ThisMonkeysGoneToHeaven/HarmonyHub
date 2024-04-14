export default async function loginUser(email, password){
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
                throw new Error('Network response was not ok when logging the user!!');
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => console.log(error));
}