import jwt from "jsonwebtoken";

export const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "1d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
  } catch (err) {
    return null;
  }
};
