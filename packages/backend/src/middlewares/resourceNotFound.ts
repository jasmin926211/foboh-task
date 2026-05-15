import { Request, Response } from 'express';

const resourceNotFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      title: 'Not found',
      description: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};

export default resourceNotFound;
