export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 25;

  // Character variety checks
  if (/[A-Z]/.test(password)) strength += 25; // Has uppercase
  if (/[a-z]/.test(password)) strength += 25; // Has lowercase
  if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25; // Has number or special char

  return strength;
};
