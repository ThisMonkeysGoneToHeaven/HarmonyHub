// const serverIp = `localhost`;
// const protocol = `http`;
// const PORT = 3000;

const serverIp = `harmonyhub-u29y.onrender.com`;
const protocol = `https`;
const PORT = 10000;

const backendServerBaseURL = `${protocol}://${serverIp}${serverIp == `localhost` ? `:3000` : ``}`;

export {backendServerBaseURL};