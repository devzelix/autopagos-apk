import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Estado de visibilidad del panel de administración.
 * Usado para no mostrar el carrusel de publicidad mientras el panel admin está abierto.
 */
@Injectable({ providedIn: 'root' })
export class AdminPanelStateService {
  private readonly isOpen$ = new BehaviorSubject<boolean>(false);

  get isOpen(): Observable<boolean> {
    return this.isOpen$.asObservable();
  }

  setOpen(open: boolean): void {
    this.isOpen$.next(open);
  }
}
