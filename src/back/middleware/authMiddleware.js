// src/back/middleware/authMiddleware.js
import { supabase } from '../services/supabaseClient.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token)
    return res.status(401).json({ error: 'Token de autenticação ausente.' });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user)
    return res.status(401).json({ error: 'Token inválido ou expirado.' });

  req.user = data.user;
  next();
};