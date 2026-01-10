import bcrypt from "bcrypt";

/**
 * Hash a plain text password
 */
const hashPassword = async (plainPassword) => {
  try {
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

/**
 * Compare plain password with hashed password
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { hashPassword, comparePassword };
