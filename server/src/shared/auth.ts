import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { failure } from './http';

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'stage-workflow-demo-secret';
const TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: number;
  username: string;
  realName: string;
  roles: string[];
};

type TokenPayload = AuthUser & {
  exp: number;
};

function encode(input: string) {
  return Buffer.from(input).toString('base64url');
}

function decode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(content: string) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(content).digest('base64url');
}

export function createToken(user: AuthUser) {
  const payload: TokenPayload = {
    ...user,
    exp: Date.now() + TOKEN_EXPIRES_IN_MS
  };

  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): AuthUser | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  if (sign(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as TokenPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      realName: payload.realName,
      roles: payload.roles
    };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return failure(res, 'unauthorized', 4010, 401);
  }

  const user = verifyToken(authorization.slice(7));

  if (!user) {
    return failure(res, 'invalid token', 4011, 401);
  }

  req.user = user;
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return failure(res, 'unauthorized', 4010, 401);
    }

    if (!roles.some((role) => user.roles.includes(role))) {
      return failure(res, 'forbidden', 4030, 403);
    }

    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
