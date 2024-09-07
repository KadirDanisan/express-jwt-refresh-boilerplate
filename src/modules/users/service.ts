import * as argon2 from '@node-rs/argon2';
import { db, parseUser } from '../../database';
import {  Users } from '../../database/schema'; // 'Users' yerine 'users' kullanıldı
import { UserUpdatePayload } from './request-schemas';
import { capitalize, formatSqliteDate, NotFoundException } from '../../utils';
import { UserDb } from './types';
import { UserRegistrationPayload } from '../auth/request-schemas';
import { eq } from "drizzle-orm";

// 'users' tablosu ile ilişkili alanları seçmek için yapılandırma
export const returningUserFields = {
    id: Users.id,
    username: Users.username,
    firstName: Users.firstName,
    lastName: Users.lastName,
    role: Users.role,
    createdAt: Users.createdAt,
    updatedAt: Users.updatedAt, // 'updateAt' => 'updatedAt' olarak düzeltildi
};

class UsersService {
    async index({ role }: { role?: 'user' | 'admin' } = {}) {
        let query = db.select({ ...returningUserFields }).from(Users);
        if (role) {
            query = query.where(eq(Users.role, role));
        }

        const usersRaw: UserDb[] = await query.execute(); // .execute() ile sorguyu çalıştırma
        const users = usersRaw.map(userRaw => parseUser(userRaw)!); // parseUser fonksiyonunu kullanma

        return users;
    }

    async show(id: number) {
        const userRaw: UserDb = await db
            .select({ ...returningUserFields })
            .from(Users) // 'Users' kullanılıyor
            .where(eq(Users.id, id)) // 'id' ile kullanıcıyı sorguluyoruz
            .execute(); // 'execute()' eklendi
        
        const user = parseUser(userRaw);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async store(payloadRaw: UserRegistrationPayload, lang?: string) {
        const payload = await this.prepareUserPayload({ ...payloadRaw, role: payloadRaw.role ?? 'user' }, lang);

        const [userRaw]: [UserDb] = await db
            .insert(Users)
            .values(payload) // Verileri ekler
            .returning({ ...returningUserFields }) // Seçilen alanları döner
            .execute(); // 'execute()' eklendi
        
        const user = parseUser(userRaw);

        return user!;
    }

    async update(id: number, payloadRaw: UserUpdatePayload, lang?: string) {
        const payload = await this.prepareUserPayload(payloadRaw, lang);

        await db.update(Users)
            .set({ ...payload, updatedAt: formatSqliteDate(new Date()) })
            .where(eq(Users.id, id))
            .execute(); // 'execute()' eklendi

        const updatedUserRaw: UserDb = await db
            .select({ ...returningUserFields })
            .from(Users)
            .where(eq(Users.id, id))
            .execute(); // 'execute()' eklendi
        
        const updatedUser = parseUser(updatedUserRaw);

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser;
    }

    async destroy(id: number) {
        const deletedUsersCount = await db
            .delete(Users)
            .where(eq(Users.id, id))
            .execute(); // 'execute()' eklendi

        return deletedUsersCount === 1;
    }

    private async prepareUserPayload(payloadRaw: UserUpdatePayload, lang = 'en') {
        const username = (payloadRaw.username as string)?.toLocaleLowerCase(lang);

        const firstName = payloadRaw.firstName ? capitalize(payloadRaw.firstName, lang) : undefined;
        const lastName = payloadRaw.lastName ? capitalize(payloadRaw.lastName, lang) : undefined;

        const role = payloadRaw.role;

        const password = payloadRaw.password;
        const hashedPassword = password ? await argon2.hash(password) : undefined;

        const userPayload: Partial<UserUpdatePayload> = {
            username,
            firstName,
            lastName,
            hashedPassword,
            role
        };

        // Gereksiz alanları temizle
        Object.keys(userPayload).forEach(key => {
            if (userPayload[key] == null) {
                delete userPayload[key];
            }
        });

        return userPayload;
    }
}

const service = new UsersService();

export { service as UsersService };
