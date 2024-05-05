import crypto from 'crypto';

const getRandomToken = () => {
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex');
}

export default getRandomToken;