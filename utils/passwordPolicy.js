export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

export const getPasswordCriteria = (password = "") => {
  const safePassword = typeof password === "string" ? password : "";

  return {
    minLength: safePassword.length >= 8,
    uppercase: /[A-Z]/.test(safePassword),
    lowercase: /[a-z]/.test(safePassword),
    number: /[0-9]/.test(safePassword),
    special: /[^A-Za-z0-9]/.test(safePassword),
  };
};

export const isStrongPassword = (password = "") => {
  const criteria = getPasswordCriteria(password);
  return Object.values(criteria).every(Boolean);
};
