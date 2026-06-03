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
            console.warn('[Auth Middleware] Supabase getUser failed for token:', error?.message || 'No user found');
            // Fallback: create a deterministic guest-style ID from token hash so user isn't completely blocked
            const tokenHash = token.substring(token.length - 16).replace(/[^a-zA-Z0-9]/g, '0');
            req.user = {
                id: `guest-unverified-${tokenHash}`,
                email: undefined,
                isAnonymous: true
            };
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
        // Fallback to anonymous guest on parsing errors too
        const tokenHash = token.substring(token.length - 16).replace(/[^a-zA-Z0-9]/g, '0');
        req.user = {
            id: `guest-error-${tokenHash}`,
            email: undefined,
            isAnonymous: true
        };
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
