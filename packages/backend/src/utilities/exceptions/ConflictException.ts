import generateException from './generateException';

class ConflictException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 409, 'Conflict', exception);
  }
}

export default ConflictException;
