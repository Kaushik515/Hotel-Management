// Enhanced email validation
export const EMAIL_VALIDATION_MESSAGE =
  "Please enter a valid email address in format: name@domain.tld (e.g., user@example.com)";

export const isValidEmail = (email = "") => {
  // More comprehensive email validation RFC 5322 compliant (simplified)
  // Requires: name@domain.tld format
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const getEmailValidationError = (email = "") => {
  if (!email) return "Email is required.";

  const trimmed = email.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return 'Email must contain "@" symbol.';
  }

  const parts = trimmed.split("@");
  if (parts.length > 2) {
    return "Email can only contain one @ symbol.";
  }

  const [name, domain] = parts;

  if (!name || name.length === 0) {
    return "Email must have a name before @ (e.g., user@example.com).";
  }

  if (!domain || domain.length === 0) {
    return "Email must have a domain after @ (e.g., user@example.com).";
  }

  if (!domain.includes(".")) {
    return "Email domain must include a dot and extension (e.g., @example.com).";
  }

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2) {
    return "Email domain extension must be at least 2 characters (e.g., .com, .org).";
  }

  if (!isValidEmail(email)) {
    return EMAIL_VALIDATION_MESSAGE;
  }

  return null;
};
