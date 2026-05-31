import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { AuthError } from './errorHandler.js';
let supabase = null;
if (config.supabaseUrl && config.supabaseServiceKey && config.supabaseUrl !== 'your_supabase_url_here') {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
}
export const optionalAuth = async (req, res, next) => {
    req.user = null;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next();
    }
    if (token.startsWith('guest-')) {
        req.user = {
            id: token,
            email: 'guest@vignette.ai',
            isAnonymous: true
        };
        return next();
    }
    if (!supabase) {
        console.warn('[Auth Middleware] Supabase client not initialized. Bypassing user lookup.');
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
    }
    catch (error) {
        console.error('[Auth Middleware] JWT parsing failed:', error);
    }
    next();
};
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        next(new AuthError('Authentication credentials are required to access this resource.'));
        return;
    }
    next();
};
