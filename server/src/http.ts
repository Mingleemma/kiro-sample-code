import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Request body must be valid JSON.' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
};
