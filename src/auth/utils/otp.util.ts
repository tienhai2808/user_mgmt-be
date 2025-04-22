export const generateOtp = (length: number): string => {
  const otp = Math.floor(10**length + Math.random() * 9*10**length).toString();
  return otp;
}