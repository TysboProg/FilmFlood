export interface ICreatePayment {
    userId: string;
    email: string;
    redirectUrl: string;
    amount: number;
}

export interface ISuccessPayment {
    userId: string;
}

export interface IGetPayment {
    userId: string;
}