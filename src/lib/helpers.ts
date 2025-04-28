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

export const cleanGeminiJsonResponse = (dirtyJson: string): string => {
  const jsonWithMarkdown = dirtyJson.match(/```json\n([\s\S]*?)\n```/)?.[1];

  const jsonWithBackticks =
    jsonWithMarkdown || dirtyJson.match(/```\n([\s\S]*?)\n```/)?.[1];

  return (jsonWithBackticks || dirtyJson).trim();
};

export const isBoilerplate = (text: string): boolean => {
  const phrases = [
    "as shown in figure",
    "as we can see",
    "in this section",
    "the following section",
    "as mentioned earlier",
  ];
  return phrases.some((phrase) => text.toLowerCase().includes(phrase));
}
