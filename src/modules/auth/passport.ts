import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions as JwtStrategyOptions } from 'passport-jwt';
import { User, UsersService } from '../users';

const JWT_SECRET_AT: string = process.env.JWT_SECRET_AT!;
const JWT_SECRET_RT: string = process.env.JWT_SECRET_RT!;

const optsForAt: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET_AT,
};

const optsForRt: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET_RT,
    passReqToCallback: true,
};


passport.use('jwt-refresh', new JwtStrategy(optsForRt, async function(req, jwtPayload, done) {
    try {
        const user = await UsersService.show(+jwtPayload.sub);
        req.jwtPayload = jwtPayload;

        return done(null, user);
    } catch (e) {
        return done(null, false);
    }
}));


passport.use('jwt', new JwtStrategy(optsForAt, async function(jwtPayload, done) {
    try {
        const user = await UsersService.show(+jwtPayload.sub);

        return done(null, user);
    } catch (e) {
        return done(null, false);
    }
}));

passport.use('jwt-refresh', new JwtStrategy(optsForRt, async function(req, jwtPayload, done) {
    try {
        const user = await UsersService.show(+jwtPayload.sub);
        req.jwtPayload = jwtPayload;

        return done(null, user);
    } catch (e) {
        return done(null, false);
    }
}));


declare module 'express' {
    interface Request {
        user: User;
    }
}
