import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validateRequest.js';
import { requireAuth } from '../middleware/auth.js';
import { saveGeneration, getUserHistory, getGenerationById, deleteGeneration, renameGeneration, getUserCredits, decrementUserCredits, deleteGuestProfile } from '../services/historyService.js';
import { NotFoundError } from '../middleware/errorHandler.js';
export const historyRouter = Router();
// Secure all endpoints under requireAuth middleware
historyRouter.use(requireAuth);
// GET /api/history/credits -> Retrieves user's active credit count
historyRouter.get('/credits', async (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const user = req.user;
        let credits = await getUserCredits(user.id);
        const guestId = req.query.guestId;
        if (guestId && typeof guestId === 'string' && guestId.startsWith('guest-')) {
            try {
                const guestCredits = await getUserCredits(guestId);
                // If guest has spent their 1 free credit (balance is 0)
                if (guestCredits === 0) {
                    // If the user's credits are at default starting balance of 5
                    if (credits === 5) {
                        credits = await decrementUserCredits(user.id, 1);
                        await deleteGuestProfile(guestId);
                        console.log(`[History Router] Migrated guest spent credit for ${guestId}. Decremented user ${user.id} starting credits to 4 and cleaned up guest profile.`);
                    }
                }
            }
            catch (migrationErr) {
                console.error('[History Router] Failed to migrate guest credits:', migrationErr);
            }
        }
        res.json({ credits });
    }
    catch (error) {
        next(error);
    }
});
const analysisSchema = z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
    roast: z.array(z.string()).optional(),
    attentionHierarchy: z.array(z.string()),
    suggestedTitles: z.array(z.string())
});
const saveSchema = z.object({
    videoId: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    prompt: z.string().min(1, 'Prompt is required'),
    imageUrl: z.string().refine(val => {
        return val.startsWith('data:') || z.string().url().safeParse(val).success;
    }, {
        message: 'Image URL must be a valid HTTP/HTTPS URL or base64 data URL'
    }),
    niche: z.string().min(1, 'Niche is required'),
    archetype: z.string().min(1, 'Archetype is required'),
    aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
    provider: z.string().min(1, 'Provider is required'),
    analysis: analysisSchema
});
// POST /api/history -> Saves a generation + analysis
historyRouter.post('/', validate(saveSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const result = await saveGeneration({
            userId: user.id,
            ...req.body
        });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/history -> Paginated user generations library
historyRouter.get('/', async (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const user = req.user;
        const rawPage = req.query.page;
        const page = rawPage ? parseInt(typeof rawPage === 'string' ? rawPage : String(rawPage), 10) : 1;
        const rawLimit = req.query.limit;
        const limit = rawLimit ? parseInt(typeof rawLimit === 'string' ? rawLimit : String(rawLimit), 10) : 20;
        const result = await getUserHistory(user.id, page, limit);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// GET /api/history/:id -> Single generation item details
historyRouter.get('/:id', async (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const user = req.user;
        const id = req.params.id;
        const result = await getGenerationById(id, user.id);
        if (!result) {
            throw new NotFoundError('Saved thumbnail generation not found.');
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/history/:id -> Updates title (renames) of a generation
historyRouter.patch('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const { title } = req.body;
        if (!title || typeof title !== 'string' || title.trim() === '') {
            res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
            return;
        }
        const success = await renameGeneration(id, user.id, title.trim());
        if (!success) {
            throw new NotFoundError('Saved thumbnail generation not found.');
        }
        res.status(200).json({ success: true, title: title.trim() });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/history/:id -> Delete a generation
historyRouter.delete('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const success = await deleteGeneration(id, user.id);
        if (!success) {
            throw new NotFoundError('Saved thumbnail generation not found or already deleted.');
        }
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
});
