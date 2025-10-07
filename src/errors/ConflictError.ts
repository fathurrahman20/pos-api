import AppError from "./AppError";

class ConflictError extends AppError {
  constructor(
    message: string = "Conflict with the current state of the resource."
  ) {
    super(message, 409);
  }
}

export default ConflictError;
