import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-pos-guard',
    templateUrl: './pos-guard.component.html',
    styleUrls: ['./pos-guard.component.scss']
})
export class PosGuardComponent implements OnInit {

    @Input() status: 'LOADING' | 'CONNECTION_ERROR' | 'SERVER_ERROR' = 'LOADING';
    @Output() retry = new EventEmitter<void>();
    @Output() continue = new EventEmitter<void>();

    constructor() { }

    ngOnInit(): void {
    }

    onRetry() {
        this.retry.emit();
    }

    onContinue() {
        this.continue.emit();
    }
}
