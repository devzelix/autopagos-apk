import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

export interface ITelegramMessagePayload {
    message: string;
    app_name: string;
    parse_mode?: 'Markdown' | 'HTML';
}

@Injectable({
    providedIn: 'root'
})
export class TelegramNotifierService {
    constructor(private http: HttpClient) { }

    private generateSignature(data: object, timestamp: number): string {
        const message = `${JSON.stringify(data)}:${timestamp}`;
        return CryptoJS.HmacSHA256(message, environment.api_telegram_token).toString(CryptoJS.enc.Hex);
    }

    async sendMessage(params: { message: string, app_name?: string, parse_mode?: 'Markdown' | 'HTML' }): Promise<void> {
        try {
            const payload: ITelegramMessagePayload = {
                message: params.message,
                app_name: params.app_name || 'autopago',
                parse_mode: params.parse_mode || 'Markdown'
            };

            const timestamp = Math.floor(Date.now() / 1000);
            const signature = this.generateSignature(payload, timestamp);

            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'x-api-key': environment.api_telegram_token,
                'x-signature': signature,
                'x-timestamp': timestamp.toString()
            });

            await firstValueFrom(this.http.post(`${environment.url_api_telegram}message`, payload, { headers }));
        } catch (error) {
            console.error('Error sending telegram message', error);
            // Suppress error to avoid loop if this service is used within error handling
        }
    }
}
