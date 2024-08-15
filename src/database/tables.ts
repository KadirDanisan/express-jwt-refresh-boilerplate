import { db } from './instance';

const Users = () => db('users');
const RefreshTokens = () => db('refreshTokens');
const Posts = () => db('posts');
const Comments = () => db('comments');
export {
    Users,
    RefreshTokens,
    Posts,
    Comments,
};
