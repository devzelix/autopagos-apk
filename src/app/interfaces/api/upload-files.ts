export interface IFileReq {
    pathRoute: string,
    register: string,
    refNum?: string,
    typeFile: boolean /** @true (anulation files)(closing files) <-----> @false (ticket files)(pre-closing files) */
    adminFile: boolean /** @true (admin files) <-----> @false (Invoice files)*/
}

export interface IFiles {
    reference_pay?: string,
    file_name: string,
    url_file: string,
}

export interface IUpLoadFiles {
    register: string,
    closingFiles?: IFiles[],
    invoices?: IFiles[]
}