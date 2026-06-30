import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

// ==========================================
// REGISTER A NEW USER
// ==========================================
export const register = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Hash the password so it isn't stored as plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        fullName: fullName ? fullName.trim() : null,
        password: hashedPassword
      }
    });

    // 💡 FIX: Generate a token for auto-login after successful registration
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 💡 FIX: Return the token and user payload so the frontend can save it immediately
    res.status(201).json({ 
      message: "Registration successful!", 
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName
      }
    });
  } catch (error) {
    // Prisma Code P2002 means a unique constraint failed (username already taken)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "That username is already taken." });
    }
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// LOGIN EXISTING USER
// ==========================================
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    // Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Issue a security token valid for 7 days
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: "Login successful!",
      token,
      user: { 
        id: user.id, 
        username: user.username,
        fullName: user.fullName 
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// GET CURRENT USER SESSION
// ==========================================
export const getMe = async (req, res) => {
  try {
    // req.user.id comes from your authentication middleware after decoding the JWT
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        // Exclude the password string entirely so it doesn't leak!
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User session not found." });
    }

    // 💡 FIX: Ensure the frontend receives user data inside a standard layout structure if needed,
    // but returning the raw 'user' object matches our api.ts client wrapper beautifully!
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};