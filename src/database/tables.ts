import { db } from './connection';
import { Users } from './migrations/20240716211511_create_users_table';
import { RefreshTokens} from './migrations/20240716211512_create_refresh_tokens_table';
import { Posts } from './migrations/20240716211513_create_posts_table';
import { Comments } from './migrations/20240716211514_create_comments_table';

export { 
    db,
    Users, 
    RefreshTokens, 
    Posts, 
    Comments 
};


