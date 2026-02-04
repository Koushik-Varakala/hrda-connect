// Use the bundled CommonJS file to avoid ESM resolution issues (missing .js extensions)
// @ts-ignore
import builtServer from '../dist/index.cjs';

export default async function handler(req: any, res: any) {
    // Wait for the server setup (DB, routes) to finish
    await builtServer.setupPromise;
    // Handle the request
    return builtServer.default(req, res);
}
