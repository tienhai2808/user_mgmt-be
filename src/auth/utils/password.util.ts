import * as argon2 from 'argon2';

export const hashPassword = async(password: string): Promise<string> => {
  const hashPassword = await argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 2 ** 16,
    parallelism: 2,
  })
  return hashPassword;
}

export const comparePassword = async(password: string, hashedPassword: string): Promise<boolean> => {
  return await argon2.verify(hashedPassword, password)
}
