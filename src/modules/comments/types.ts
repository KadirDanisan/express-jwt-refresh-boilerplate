export interface CommentDb {
    id: number;
    userId: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment extends Omit<CommentDb, 'createdAt' | 'updatedAt'> {
    createdAt: Date;
    updatedAt: Date;
}