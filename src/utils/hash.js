import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
}

function testHashPassword() {
    const password = '@adrian!_25';
    return hashPassword(password);
    
}

const pass = await testHashPassword();

console.log(pass)
