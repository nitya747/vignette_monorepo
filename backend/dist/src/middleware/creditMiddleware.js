import { getUserCredits } from '../services/historyService.js';
/**
 * Enforces check constraints for credit-spent endpoints.
 * Blocks the request with 403 Forbidden if the user is authenticated
 * but has 0 credits. Failing open defensively if database query exceptions occur.
 */
export const creditMiddleware = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication or guest session is required to perform this action.'
        });
        return;
    }
    try {
        const credits = await getUserCredits(req.user.id);
        if (credits < 1) {
            res.status(403).json({
                error: 'Insufficient credits. Please top up to generate more thumbnails.'
            });
            return;
        }
        req.userCredits = credits;
    }
    catch (err) {
        console.error('[Credit Middleware] Credit validation check failed, failing fast:', err);
        return next(err);
    }
    next();
};
