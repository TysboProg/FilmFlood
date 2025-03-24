export interface IUser {
    username: string;
    email: string;
    password: string;
}

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}