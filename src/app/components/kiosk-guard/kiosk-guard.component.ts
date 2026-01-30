import { Component, OnInit } from '@angular/core';
import { KioskAuthService } from '../../services/kiosk-auth.service';

@Component({
  selector: 'app-kiosk-guard',
  templateUrl: './kiosk-guard.component.html',
  styleUrls: ['./kiosk-guard.component.scss']
})
export class KioskGuardComponent implements OnInit {

  public kioskStatus$: any;

  constructor(private kioskAuth: KioskAuthService) {
    this.kioskStatus$ = this.kioskAuth.kioskStatus$;
  }

  ngOnInit(): void {
  }

  get kioskUuid() {
    return this.kioskAuth.getUuid();
  }

  retryAuth() {
    this.kioskAuth.setLoadingState();
    setTimeout(() => {
      this.kioskAuth.initAuth();
    }, 1000);
  }
}
