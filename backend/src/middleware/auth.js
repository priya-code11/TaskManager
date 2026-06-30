import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extracts token from "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. Please log in first." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attaches { id: user.id } directly to the request object
    next();
  } catch (error) {
    res.status(403).json({ error: "Session expired or invalid token. Please log in again." });
  }
};

