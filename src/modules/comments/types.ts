export interface CommentDb {
    commentId: number;
    postId: number;
    userId: number;
    title: string;
    comment: string;
    createdAt: string; // Veritabanından alınan tarih formatı
    updatedAt: string; // Veritabanından alınan tarih formatı
}

export interface Comment extends Omit<CommentDb, 'createdAt' | 'updatedAt'> {
    createdAt: Date; // Tarih nesneleri
    updatedAt: Date; // Tarih nesneleri
}
