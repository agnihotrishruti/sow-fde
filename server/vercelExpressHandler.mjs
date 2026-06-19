/**
 * Run Express on Vercel serverless: wait until the response finishes and always return JSON on crash.
 */
export function createVercelExpressHandler(app) {
  return async function handler(req, res) {
    try {
      await new Promise((resolve, reject) => {
        res.on('finish', resolve);
        res.on('close', resolve);
        app(req, res, (err) => {
          if (err) reject(err);
        });
      });

      if (!res.headersSent) {
        res.status(404).json({ error: 'Not found', detail: 'No API route matched this request.' });
      }
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Server error',
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  };
}
