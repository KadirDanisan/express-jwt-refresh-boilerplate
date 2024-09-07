import { NextFunction, Request, Response } from 'express';
import { users } from '../../database';
import { AuthService } from './service';
import { User, UsersService } from '../users';
import { RtPayload } from './types';
import { eq } from "drizzle-orm";
import { BadRequestException } from '../../utils';
import { db } from '../../database/connection'; 

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        // We will use the first language in the list of accepted languages as the default language for the user data
        // We need to remove the "*" character from the language string if exists (happens when user accepts all languages)
        const lang = req.acceptsLanguages()[0].replace('*', '') || 'en';

        const username = req.body.username.toLocaleLowerCase(lang);
        // Check if the username is already taken
        const existingUser = await db.select().from(users).where(eq(username.username, 5));

        if (existingUser) {
            throw new BadRequestException('Username already taken');
        }

        const user = await UsersService.store(req.body, lang);
        const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user);

        const response = {
            user,
            accessToken,
            refreshToken,
        };

        res.json(response);
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const user = (await req.user) as User & { hashedPassword: any };

        const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user);

        delete user.hashedPassword;

        const response = {
            user: user as User,
            accessToken,
            refreshToken,
        };

        res.json(response);
    }

    static async me(req: Request, res: Response, next: NextFunction) {
        const user = req.user;

        res.json(user);
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        const rtPayload: RtPayload = (req as any).jwtPayload;

        const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user, rtPayload);

        res.json({ user, accessToken, refreshToken });
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        const rtPayload: RtPayload = (req as any).jwtPayload;

        await AuthService.revokeRefreshToken(rtPayload.jti);

        res.json({ message: 'Logged out' });
    }

    static async logoutAll(req: Request, res: Response, next: NextFunction) {
        const user = req.user;

        const revokedTokensCount = await AuthService.revokeAllRefreshTokensOfUser(user.id);
        
        if (revokedTokensCount.changes === 0) {
            throw new BadRequestException('No active sessions to logout');
        }
        

        res.json({ message: 'Logged out all sessions' });
    }
}