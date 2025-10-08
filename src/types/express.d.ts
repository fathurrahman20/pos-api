import "express";

// Untuk menambahkan properti 'user' ke interface Request Express
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; username: string; email: string; role: string };
    }
  }
}

export {};
