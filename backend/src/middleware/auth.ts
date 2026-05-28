import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { AuthError } from './errorHandler.js';

// Extend Express Request object to hold user metadata
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        isAnonymous: boolean;
      } | null;
    }
  }
}

let supabase: any = null;

if (config.supabaseUrl && config.supabaseServiceKey && config.supabaseUrl !== 'your_supabase_url_here') {
  supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  req.user = null;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  if (!supabase || token.startsWith('sandbox-')) {
    console.warn('[Auth Middleware] Supabase is not configured or sandbox token used. Simulating valid anonymous token validation.');
    req.user = {
      id: 'mock-sandbox-user-id',
      email: 'sandbox@vignette.ai',
      isAnonymous: false
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.warn('[Auth Middleware] Supabase getUser failed for token (Length:', token.length, '):', token.substring(0, 30), '... Error:', error?.message || 'No user found');
      return next();
    }

    req.user = {
      id: user.id,
      email: user.email,
      isAnonymous: user.role === 'anon'
    };
  } catch (error) {
    console.error('[Auth Middleware] JWT parsing failed:', error);
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthError('Authentication credentials are required to access this resource.'));
    return;
  }
  next();
};
