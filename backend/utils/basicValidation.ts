import validator from 'validator';

export function isValidEmail(email: string): boolean{
    return validator.isEmail(email);
}

export function isValidPassword(password: string): boolean{
    return validator.isStrongPassword(password);
}