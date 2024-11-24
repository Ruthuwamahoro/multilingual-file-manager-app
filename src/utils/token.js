import jwt from "jsonwebtoken";

// Generate JWT Token
export const generateAuthToken = (user) => {
    const token = jwt.sign(
        { id: user._id, admin: user.admin },
        "yourSecretKey", // Replace with your secret key
        { expiresIn: "1h" }
    );
    return token;
};
