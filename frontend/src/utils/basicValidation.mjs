export function isEmailValid(email){
    // this regex checks for the format text@text.com where text is a string of one or more characters, not including an @ or whitespace
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isPasswordValid(password){
    // this regex checks for the password length between [8, 20] and if it includes, 1 lowercase, 1 uppercase, 1 special character, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}
