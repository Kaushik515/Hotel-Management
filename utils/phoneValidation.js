// Country code to phone code and length mappings
// Format: { country: { code: "+X", minLength: X, maxLength: Y, format: "description" } }
export const COUNTRY_PHONE_CODES = {
  "United States": { code: "+1", minLength: 10, maxLength: 10, format: "10 digits" },
  Canada: { code: "+1", minLength: 10, maxLength: 10, format: "10 digits" },
  "United Kingdom": { code: "+44", minLength: 10, maxLength: 11, format: "10-11 digits" },
  India: { code: "+91", minLength: 10, maxLength: 10, format: "10 digits" },
  Germany: { code: "+49", minLength: 10, maxLength: 13, format: "10-13 digits" },
  France: { code: "+33", minLength: 9, maxLength: 9, format: "9 digits" },
  Spain: { code: "+34", minLength: 9, maxLength: 9, format: "9 digits" },
  Italy: { code: "+39", minLength: 10, maxLength: 10, format: "10 digits" },
  Australia: { code: "+61", minLength: 9, maxLength: 9, format: "9 digits" },
  Japan: { code: "+81", minLength: 10, maxLength: 11, format: "10-11 digits" },
  China: { code: "+86", minLength: 11, maxLength: 11, format: "11 digits" },
  Brazil: { code: "+55", minLength: 11, maxLength: 11, format: "11 digits" },
  Mexico: { code: "+52", minLength: 10, maxLength: 10, format: "10 digits" },
  Netherlands: { code: "+31", minLength: 9, maxLength: 9, format: "9 digits" },
  Singapore: { code: "+65", minLength: 8, maxLength: 8, format: "8 digits" },
  "United Arab Emirates": { code: "+971", minLength: 9, maxLength: 9, format: "9 digits" },
  Thailand: { code: "+66", minLength: 9, maxLength: 9, format: "9 digits" },
  "South Korea": { code: "+82", minLength: 10, maxLength: 11, format: "10-11 digits" },
  Russia: { code: "+7", minLength: 11, maxLength: 11, format: "11 digits" },
  "South Africa": { code: "+27", minLength: 9, maxLength: 9, format: "9 digits" },
};

export const PHONE_VALIDATION_MESSAGE =
  "Please enter a valid phone number using digits only (do not include country code).";

export const getPhoneCodeByCountry = (country = "") => {
  return COUNTRY_PHONE_CODES[country]?.code || null;
};

export const getPhoneFormatByCountry = (country = "") => {
  return COUNTRY_PHONE_CODES[country]?.format || "digits only";
};

export const getPhoneValidationRules = (country = "") => {
  return COUNTRY_PHONE_CODES[country] || null;
};

export const isValidPhoneNumber = (phone = "", country = "") => {
  if (!phone || !country) return false;

  const rules = getPhoneValidationRules(country);
  if (!rules) return false;

  const digitsOnly = phone.replace(/\D/g, "");
  if (!/^\d+$/.test(digitsOnly)) {
    return false;
  }

  return (
    digitsOnly.length >= rules.minLength &&
    digitsOnly.length <= rules.maxLength
  );
};

export const getPhoneValidationError = (phone = "", country = "") => {
  if (!phone) return "Phone number is required.";
  if (!country) return "Country is required for phone validation.";

  const rules = getPhoneValidationRules(country);
  if (!rules) return `Phone validation not configured for ${country}.`;

  if (!/^\d+$/.test(phone)) {
    return "Phone number must contain digits only.";
  }

  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length < rules.minLength) {
    return `Phone number is too short. Expected at least ${rules.minLength} digits.`;
  }

  if (digitsOnly.length > rules.maxLength) {
    return `Phone number is too long. Expected at most ${rules.maxLength} digits.`;
  }

  return null;
};
