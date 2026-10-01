import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { JwtPayload } from '../types';

// 签发 token
export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, config.jwtSecret, {
		expiresIn: config.jwtExpiresIn as never,
	});
}

// 校验 token，失败抛出异常
export function verifyToken(token: string): JwtPayload {
	return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
