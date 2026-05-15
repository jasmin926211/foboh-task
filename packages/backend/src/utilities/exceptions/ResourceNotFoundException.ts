import generateException from './generateException';

class ResourceNotFoundException extends Error {
  statusCode!: number;
  title!: string;
  description!: string;

  constructor(exception: string | { statusCode?: number; title?: string; description?: string }) {
    super(typeof exception === 'string' ? exception : exception.description);
    generateException(this, 404, 'Resource not found', exception);
  }
}

export default ResourceNotFoundException;
