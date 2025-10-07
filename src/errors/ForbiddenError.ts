import AppError from "./AppError";

class ForbiddenError extends AppError {
  constructor(message: string = "Access to this resource is forbidden.") {
    super(message, 403);
  }
}

export default ForbiddenError;
