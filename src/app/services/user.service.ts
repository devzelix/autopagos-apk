import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor() { }

    async GetUserPromise(): Promise<any> {
        // Placeholder - implement actual user retrieval
        return null;
    }

    async GetContratoSelectedPromise(): Promise<any> {
        // Placeholder - implement actual contract retrieval
        return null;
    }
}
