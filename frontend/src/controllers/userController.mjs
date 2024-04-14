const fetchUserData = async (userId, token) => {
    const apiUrl = `http://localhost:3000/api/user/${userId}`;
    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if(!response.ok){
                console.log(response);
                throw new Error('Fetching User Data: Network response was not okay!');
            }
            return response.json();
        })
        .then(data => data)
        .catch(error => {
            console.error(error)
        });
};

export {fetchUserData};