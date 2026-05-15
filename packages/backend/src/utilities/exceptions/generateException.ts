interface ExceptionPayload {
  statusCode?: number;
  title?: string;
  description?: string;
}

function generateException(
  instance: any,
  statusCode: number,
  title: string,
  exception: string | ExceptionPayload
) {
  if (typeof exception === 'string') {
    instance.statusCode = statusCode;
    instance.title = title;
    instance.description = exception;
  } else {
    instance.statusCode = exception.statusCode || statusCode;
    instance.title = exception.title || title;
    instance.description = exception.description || '';
  }
}

export default generateException;
