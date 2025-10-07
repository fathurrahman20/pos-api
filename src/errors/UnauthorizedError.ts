import AppError from "./AppError";

class UnauthorizedError extends AppError {
  constructor(
    message: string = "Authentication is required to access this resource."
  ) {
    super(message, 401);
  }
}

export default UnauthorizedError;
