import { Injectable, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from './user.service';
import { TelegramNotifierService } from './telegram-notifier.service';
import { NetworkInfoService } from './network-info.service';
import { LocalstorageService } from './localstorage.service';

interface ApiErrorContext {
    source: 'api';
    url?: string;
    method?: string;
    status?: number;
    statusText?: string;
    error?: unknown;
}

interface ClientErrorContext {
    source: 'client';
    error?: unknown;
}

type ErrorContext = ApiErrorContext | ClientErrorContext;

@Injectable({
    providedIn: 'root',
})
export class ErrorNotifierService {
    private static readonly WINDOW_MS = 20 * 60 * 1000;
    private static readonly MAX_KEYS_PER_USER = 50;
    private static readonly MAX_USERS = 500;
    private static readonly sentMap: Map<string | number, Map<string, number>> = new Map();
    private telegramNotifierService: TelegramNotifierService | undefined;

    constructor(private injector: Injector) { }

    async notify(context: ErrorContext): Promise<void> {
        try {
            const userService = this.injector.get(UserService);
            const location = this.injector.get(Location);
            const networkInfo = this.injector.get(NetworkInfoService);
            const localStorage = this.injector.get(LocalstorageService);

            // Recolectar datos asíncronos y síncronos
            const [user, contrato, ipLocal] = await Promise.all([
                userService.GetUserPromise().catch(() => null),
                userService.GetContratoSelectedPromise().catch(() => null),
                networkInfo.getLocalIpAddress().catch(() => 'No disponible')
            ]);

            const userId = user?.id_abonado ?? 'anon';
            const contratoAdm = (contrato as any)?.id_contrato_adm ?? 'N/A';
            const contratoAbonado = (contrato as any)?.nro_abonado ?? 'N/A';
            const ubiiposHost = localStorage.get<string>('ubiiposHost') || 'No configurado';

            const signature = this.buildSignature(
                context,
                userId,
                `${contratoAdm}|${contratoAbonado}`
            );

            if (!this.shouldSend(userId, signature)) return;

            const currentRoute = location.path();
            const userAgent = navigator.userAgent;

            const markdownMessage = this.buildMarkdownMessage(
                context,
                user,
                contratoAdm,
                contratoAbonado,
                currentRoute,
                ipLocal,
                ubiiposHost,
                userAgent
            );

            await this.sendToTelegram(markdownMessage);
        } catch (e) {
            console.error('ErrorNotifierService failed to notify:', e);
            // Evitar loops por fallos en el notifier
        }
    }

    private shouldSend(userId: string | number, signature: string): boolean {
        const now = Date.now();

        // Cleanup global users if too many
        if (ErrorNotifierService.sentMap.size > ErrorNotifierService.MAX_USERS) {
            let oldestUser: string | number | undefined;
            let oldestTime = Infinity;
            for (const [uid, map] of ErrorNotifierService.sentMap.entries()) {
                for (const time of map.values()) {
                    if (time < oldestTime) {
                        oldestTime = time;
                        oldestUser = uid;
                    }
                }
            }
            if (oldestUser !== undefined) {
                ErrorNotifierService.sentMap.delete(oldestUser);
            }
        }

        let userMap = ErrorNotifierService.sentMap.get(userId);
        if (!userMap) {
            userMap = new Map();
            ErrorNotifierService.sentMap.set(userId, userMap);
        }

        // Cleanup expired entries
        for (const [key, time] of userMap.entries()) {
            if (now - time > ErrorNotifierService.WINDOW_MS) {
                userMap.delete(key);
            }
        }

        // Enforce per-user size limit
        if (userMap.size > ErrorNotifierService.MAX_KEYS_PER_USER) {
            let oldestKey: string | undefined;
            let oldestTime = Infinity;
            for (const [key, time] of userMap.entries()) {
                if (time < oldestTime) {
                    oldestTime = time;
                    oldestKey = key;
                }
            }
            if (oldestKey) userMap.delete(oldestKey);
        }

        const last = userMap.get(signature);
        if (last && now - last < ErrorNotifierService.WINDOW_MS) {
            return false;
        }

        userMap.set(signature, now);
        return true;
    }

    private buildSignature(
        context: ErrorContext,
        userId: string | number,
        contratoKey: string,
    ): string {
        const base = this.normalizeError(context.error);
        const apiPart =
            context.source === 'api'
                ? `${context.method || ''}|${context.url || ''}|${context.status || ''}`
                : 'client';

        return `${userId}|${contratoKey}|${context.source}|${apiPart}|${base}`;
    }

    private buildMarkdownMessage(
        context: ErrorContext,
        user: any,
        contratoAdm: string | number,
        contratoAbonado: string | number,
        currentRoute: string,
        ipLocal: string | null,
        ubiiposHost: string,
        userAgent: string
    ): string {
        const createdAt = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const safe = (value: unknown) => this.sanitizeSimple(String(value ?? 'N/A'));

        const lines = [
            '🚨 *Error en Caja Autopago*',
            '',
            `📅 *Fecha:* ${safe(createdAt)}`,
            `📱 *App:* ${safe('autopago')}`,
            '',
            '🖥 *Sistema:*',
            `- *IP Local:* ${safe(ipLocal)}`,
            `- *Ubiipos Host:* ${safe(ubiiposHost)}`,
            `- *Ruta:* ${safe(currentRoute)}`,
            `- *User Agent:* ${safe(userAgent).substring(0, 50)}...`, // Truncated for brevity
            '',
            '👤 *Usuario / Sesión:*',
            `- *ID Abonado:* ${safe(user?.id_abonado)}`,
            `- *Nombre:* ${safe(user?.nombres_abonado)} ${safe(user?.apellidos_abonado)}`,
            `- *Cédula:* ${safe(user?.cedula_abonado)}`,
            `- *Contrato:* ${safe(contratoAdm)}`,
        ];

        if (context.source === 'api') {
            lines.push(
                '',
                '🌐 *Contexto API (Request):*',
                `- *Método:* ${safe(context.method)}`,
                `- *URL:* ${safe(context.url)}`,
                `- *Status:* ${safe(context.status)} ${safe(context.statusText)}`
            );
        }

        const normalizedError = this.normalizeError(context.error);

        // Formatear error como bloque de código para mejor legibilidad
        lines.push('', '⚠️ *Detalle Exception:*', '```');
        lines.push(normalizedError.replace(/`/g, "'")); // Escape backticks
        lines.push('```');

        return lines.join('\n');
    }

    private normalizeError(error: unknown): string {
        if (!error) return 'Error desconocido';
        let str: string;
        if (typeof error === 'string') {
            str = error;
        } else if (error instanceof Error) {
            str = [error.message, error.stack].filter(Boolean).join('\nStack: ');
        } else {
            try {
                str = JSON.stringify(error, null, 2); // Pretty print JSON
            } catch {
                str = String(error);
            }
        }
        // Para Telegram, hay límite de caracteres (4096), pero aquí cortamos un poco para seguridad
        return str.length > 2000 ? str.substring(0, 2000) + '...' : str;
    }

    private sanitizeSimple(text: string): string {
        // Remove emojis or non-text chars if strict sanitization is needed, 
        // but Markdown allows them. We just trim.
        // Escape markdown special chars if not intended, but manual formatting is used here.
        // For simple text values, we might want to escape `*` and `_` to avoid breaking format.
        return text.replace(/[*_`[\]()]/g, '').trim();
    }

    private async sendToTelegram(message: string): Promise<void> {
        try {
            if (!this.telegramNotifierService) {
                this.telegramNotifierService = this.injector.get(TelegramNotifierService);
            }

            await this.telegramNotifierService.sendMessage({
                message,
                app_name: 'autopago',
                parse_mode: 'Markdown',
            });
        } catch {
            // evitar loops por fallos en telegram
        }
    }
}
