import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env variables defensively from multiple possible directories
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    falKey: process.env.FAL_KEY,
    visionApiKey: process.env.VISION_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    nodeEnv: process.env.NODE_ENV || 'development'
};
// Validate critical parameters in production
if (config.nodeEnv === 'production') {
    if (!config.falKey) {
        console.warn('[Config Warning] FAL_KEY is missing in production environment.');
    }
    if (!config.visionApiKey) {
        console.warn('[Config Warning] VISION_API_KEY is missing in production environment.');
    }
}
