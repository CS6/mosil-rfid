import { VercelRequest, VercelResponse } from '@vercel/node';
import { main } from '../src/app';

let app: any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!app) {
      app = await main();
      await app.ready();
    }

    // Forward the request to Fastify
    await app.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body
    }).then((response: any) => {
      res.status(response.statusCode);
      
      // Set headers
      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key]);
      });
      
      res.send(response.payload);
    });
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : 'Something went wrong'
    });
  }
}