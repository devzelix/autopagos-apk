export interface FileUrl {
    url: string;
    fileId?: string;
    validate?: boolean;
    status?: number;
}

export interface FileUrlDeleted {
    fileDeleted: string;
    deleted: boolean,
    err?: any;
}