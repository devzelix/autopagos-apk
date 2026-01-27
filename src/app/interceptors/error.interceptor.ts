import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorNotifierService } from '../services/error-notifier.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private errorNotifier: ErrorNotifierService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                this.errorNotifier.notify({
                    source: 'api',
                    url: request.url,
                    method: request.method,
                    status: error.status,
                    statusText: error.statusText,
                    error: error.message || error.error
                });
                return throwError(() => error);
            })
        );
    }
}
