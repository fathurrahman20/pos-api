import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import ForbiddenError from "../errors/forbidden.error";
import UnauthorizedError from "../errors/unauthorized.error";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const decoded = accessToken
    ? verifyAccessToken(accessToken)
    : verifyRefreshToken(refreshToken);
  if (!decoded || typeof decoded === "string") {
    throw new UnauthorizedError("Token tidak valid. Silakan login kembali.");
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
  };
  next();
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    throw new ForbiddenError("Akses ditolak. Hanya untuk admin.");
  }
  next();
};

export const authorizeCashier = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "kasir") {
    throw new ForbiddenError("Akses ditolak. Hanya untuk kasir.");
  }
  next();
};
