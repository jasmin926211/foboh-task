import generateException from './generateException';

class InternalServerException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 500, 'Internal server error', exception);
  }
}

export default InternalServerException;
