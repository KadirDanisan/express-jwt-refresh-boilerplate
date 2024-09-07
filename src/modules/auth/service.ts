import jwt from 'jsonwebtoken';
import * as argon2 from '@node-rs/argon2';
import * as process from 'process';
import { convertToSeconds, formatSqliteDate, NotFoundException, UnprocessableEntityException } from '../../utils';
import { parseRefreshToken, refreshTokens, users } from '../../database';
import {  RtPayload } from './types';
import { User, UserWithHashedPassword } from '../users';
import { eq, isNull } from "drizzle-orm";
import { db } from '../../database/connection'; 

export const JWT_SECRET_AT= process.env.JWT_SECRET_AT;
export const JWT_SECRET_RT = process.env.JWT_SECRET_RT;

const allTokenSettings = {
    accessToken: {
        expiresIn: 86400, // 1 day
        secret: JWT_SECRET_AT,
    },
    refreshToken: {
        expiresIn: 86400, // 1 day
        secret: JWT_SECRET_RT,
    },
};
class AuthService {

    async findUserFromCredentials(username: string, password: string): Promise<UserWithHashedPassword | null> {
        const userRaw = await db
        .select({
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            hashedPassword: users.hashedPassword // Ensure this is selected
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1) // Ensure only one result is returned
        .then(rows => rows[0] || null); // Handle result as array

    // Handle case where user is not found
    if (!userRaw) {
        return null;
    }

    // Parse and type-cast user
    const user: UserWithHashedPassword = {
        ...userRaw,
        role: userRaw.role as 'user' | 'admin',
        createdAt: new Date(userRaw.createdAt),
        updatedAt: new Date(userRaw.updatedAt)
    };

    // Verify the password
    const passwordMatch = await this.verifyPassword(user.hashedPassword, password);

    // Return user if password matches, otherwise return null
    return passwordMatch ? user : null;
    }

    async generateAuthTokens(user: User, oldRtPayload?: RtPayload): Promise<{
        accessToken: string,
        refreshToken: string
    }> {
        const now = new Date();
        if (!oldRtPayload) {
            // Eğer oldRtPayload tanımlı değilse, işlemi atla
            throw new Error("oldRtPayload is required to generate tokens");
        }
    
        const accessToken = await this.generateAuthToken(user, 'accessToken', now, oldRtPayload);
        const refreshToken = await this.generateAuthToken(user, 'refreshToken', now, oldRtPayload);
    
        return { accessToken, refreshToken };
    }

    async revokeRefreshToken(jti: number) {
        const refreshTokenDb = await db
            .select()
            .from(refreshTokens)
            .where(eq(refreshTokens.id, jti))
            .limit(1)
            .then(rows => rows[0] || null);

        const refreshToken = refreshTokenDb ? parseRefreshToken(refreshTokenDb) : null;

        if (!refreshToken) {
            throw new NotFoundException('Refresh token not found');
        }

        if (refreshToken.revokedAt) {
            throw new UnprocessableEntityException('Refresh token already revoked');
        }

        await db
            .update(refreshTokens)
            .set({ revokedAt: formatSqliteDate(new Date()) })
            .where(eq(refreshTokens.id, jti));

        return true;
    }

    async revokeAllRefreshTokensOfUser(userId: number) {
        const revokedTokensCount = await db.update(refreshTokens).
        set({ revokedAt: formatSqliteDate(new Date())})
        .where(
            (
                eq(refreshTokens.userId, userId),
                isNull(refreshTokens.revokedAt)
            )
        );
        return revokedTokensCount;
    }

    private verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
        return argon2.verify(hashedPassword, password);
    }

    private async generateAuthToken(user: User, type: 'accessToken' | 'refreshToken', iat: Date, oldRtPayload: RtPayload) {
        let jti: number | undefined;
        const iatDate = new Date(iat);
        iatDate.setMilliseconds(0);


        const tokenSettings = allTokenSettings[type];

        const tokenExpiresIn = tokenSettings.expiresIn;
        const tokenExpiresAt = new Date(iatDate);
        tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + tokenExpiresIn, 0);


        if (type === 'refreshToken') {
            jti = await this.upsertRefreshToken({
                userId: user.id,
                issuedAt: iatDate,
                tokenExpiresAt,
                oldRtPayload,
        });        
        }


        // We generate iat (issued at) and exp (expiration) manually because of better precision
        const iatAsSeconds = convertToSeconds(iatDate);
        const exp = convertToSeconds(tokenExpiresAt);

        const secret = tokenSettings.secret;
        if (!secret) {
            throw new Error("Secret key is undefined");
        }
        // You can add more data to the token if you want but make sure to add it also to the AtPayload and RtPayload types
        const token = jwt.sign({
            sub: user.id,
            jti,
            iat: iatAsSeconds,
            exp,
        }
       ,secret);

        return token;

    }

    private async upsertRefreshToken(
        { userId, issuedAt, tokenExpiresAt, oldRtPayload }: {
            userId: number,
            issuedAt: Date,
            tokenExpiresAt: Date,
            oldRtPayload?: RtPayload,
        }) {
        let jti = oldRtPayload?.jti;
        const tokenExpiresAtString = formatSqliteDate(tokenExpiresAt);
        const iatString = formatSqliteDate(issuedAt);
    
        if (!oldRtPayload) {
            // Yeni bir refresh token oluşturulacak
            const [refreshTokenDb] = await db
                .insert(refreshTokens)
                .values({
                    userId,
                    expiresAt: tokenExpiresAtString,
                    createdAt: iatString,
                    updatedAt: iatString,
                })
                .returning({ id: refreshTokens.id }); // 'id' alanını döndürüyoruz
            jti = refreshTokenDb.id;
        } else {
            // Mevcut refresh token ile ilgili işlemler
            const query = db
                .select()
                .from(refreshTokens)
                .where(eq(refreshTokens.id, jti!)) // jti mevcutsa sorgu yap
                .limit(1);
    
            const [refreshTokenDb] = await query;
            if (!refreshTokenDb) {
                throw new NotFoundException('Refresh token not found');
            }
    
            const refreshToken = parseRefreshToken(refreshTokenDb);
    
            if (!refreshToken) {
                throw new NotFoundException('Refresh token not found');
            }
            
            // Bu noktada refreshToken artık kesinlikle null olamaz, bu nedenle hatalar giderilir
            if (refreshToken.revokedAt) {
                throw new UnprocessableEntityException('Refresh token revoked');
            }
            
            if (new Date(refreshToken.expiresAt) < new Date()) {
                throw new UnprocessableEntityException('Refresh token expired');
            }
            
            const refreshTokenDbIssuedAt = new Date(refreshToken.updatedAt);
    
            const oldRefreshTokenIssuedAt = new Date(0);
            oldRefreshTokenIssuedAt.setUTCSeconds(oldRtPayload.iat);
    
            if (refreshTokenDbIssuedAt.getTime() !== oldRefreshTokenIssuedAt.getTime()) {
                throw new UnprocessableEntityException('Refresh token already consumed');
            }
            if (!jti) {
                throw new Error("JTI is undefined");
            }
            // Refresh token'ın son kullanma tarihini güncelleme
            await db.update(refreshTokens)
            .set({
              expiresAt: tokenExpiresAtString,
              updatedAt: iatString
             })
             .where(eq(refreshTokens.id, jti));
        }
    
        return jti!;
    }
}

const service = new AuthService();
export { service as AuthService };