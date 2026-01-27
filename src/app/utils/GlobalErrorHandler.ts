import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorNotifierService } from '../services/error-notifier.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) { }

  handleError(error: any) {
    try {
      const errorNotifier = this.injector.get(ErrorNotifierService);
      errorNotifier.notify({
        source: 'client',
        error: error
      });
    } catch {
      // Failed to notify
    }

    console.error('GlobalErrorHandler:', error);
  }
}
