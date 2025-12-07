export type TUserRole = 'admin' | 'customer';

export type TUser = {
    id?: number;
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: TUserRole;
    createdAt?: Date;
    updatedAt?: Date;
};
