export const generateOtp = (length: number): string => {
  const otp = Math.floor(10**length + Math.random() * 90**length).toString();
  return otp;
}