import { config } from './src/config/index.js';

async function main() {
    const key = config.visionApiKey;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data.models.map((m: any) => m.name).join('\n'));
}

main();
