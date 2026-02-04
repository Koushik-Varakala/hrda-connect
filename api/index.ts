// Note: We use .js extension because Vercel ESM resolution requires it in the compiled output
// @ts-ignore
import app, { setupPromise } from '../server/app.js';

export default async function handler(req: any, res: any) {
    await setupPromise;
    return app(req, res);
}
