import bcrypt from 'bcrypt';

export async function hashPassword(password: string){
    try{
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }
    catch(error){
        throw new Error('Password Hashing Failed.');
    }
};

export async function comparePassword(providedPassword: string, correctPassword: string){
    return await bcrypt.compare(providedPassword, correctPassword);
}