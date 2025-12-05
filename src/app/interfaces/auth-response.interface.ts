export interface IAuthData {
    id_user: number;
    id_sede: number;
}

export interface IAuthResponse {
    status: number;
    message: string;
    response: IAuthData;
}
