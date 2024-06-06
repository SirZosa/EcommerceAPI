import jwt from 'jsonwebtoken'
import 'dotenv/config'

export async function authenticate(req, res,next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Access denied! No token provided.' });
    try {
      req.user = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || '');
      next();
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }