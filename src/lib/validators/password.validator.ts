export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  regex: {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    digit: /\d/,
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },
} as const;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasLowercase: PASSWORD_REQUIREMENTS.regex.lowercase.test(password),
    hasUppercase: PASSWORD_REQUIREMENTS.regex.uppercase.test(password),
    hasDigit: PASSWORD_REQUIREMENTS.regex.digit.test(password),
    hasSymbol: PASSWORD_REQUIREMENTS.regex.symbol.test(password),
  };

  const errors: string[] = [];

  if (!requirements.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
    );
  }
  if (!requirements.hasLowercase) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }
  if (!requirements.hasUppercase) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }
  if (!requirements.hasDigit) {
    errors.push("Password must contain at least one digit (0-9)");
  }
  if (!requirements.hasSymbol) {
    errors.push("Password must contain at least one symbol (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
  };
}
