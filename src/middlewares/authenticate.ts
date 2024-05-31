import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

// Define an interface for the JWT payload
interface JwtPayloadWithSub extends JwtPayload {
  sub: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  if (!token) {
    return next(createHttpError(401, "Authorization token is required"));
  }

  try {
    const parsedToken = token.split(' ')[1];
    const decoded = verify(parsedToken, config.jwtSecret as string) as JwtPayloadWithSub;
    console.log("decoded", decoded);

    if (!decoded || !decoded.sub) {
      return next(createHttpError(401, "Invalid token"));
    }

    const _req = req as AuthRequest;
    _req.userId = decoded.sub;
    next();
  } catch (error) {
    console.error(error);
    return next(createHttpError(401, "Token expired or invalid"));
  }
};

export default authenticate;

