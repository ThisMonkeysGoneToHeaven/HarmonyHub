// const serverIp = `localhost`;
// const protocol = `http`;
// const PORT = 3000;

const serverIp = `harmonyhub-u29y.onrender.com`;
const protocol = `https`;
const PORT = 10000;

/*
No need to enter the port number when app is hosted on a live server on an online service like render, because they route the user to the right port by using the domain name, internally. Since they do it for us, we don't have to do it explicitly.
*/

const backendServerBaseURL = `${protocol}://${serverIp}${serverIp == `localhost` ? `:3000` : ``}`;

export {backendServerBaseURL};