import generateException from './generateException';

class BadRequestException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 400, 'Bad request', exception);
  }
}

export default BadRequestException;
