import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-btn-transaction',
  templateUrl: './btn-transaction.component.html',
  styleUrls: ['./btn-transaction.component.scss']
})
export class BtnTransactionComponent implements OnInit {
  @Output() onBtnClick = new EventEmitter<void>();
  @Input() title: string = 'Aceptar';
  @Input() disabled: boolean = false;
  @Input() btnType: string = 'button'

  private clickBlockTimer: NodeJS.Timeout | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  public onTransactionClick = () => {
    try {
      if (!this.clickBlockTimer) {
        const btnTransaction = document.querySelector('.container-transaction-btn')
        btnTransaction?.classList.add('btnActiveTransaction')

        this.clickBlockTimer = setTimeout(() => { //* timout that waits 3s until animation finishes
          this.onBtnClick.emit();
          btnTransaction?.classList.remove('btnActiveTransaction')
          if (this.clickBlockTimer) clearTimeout(this.clickBlockTimer)
          this.clickBlockTimer = null;
        }, 3000);
      }
    } catch (error) {
      console.error(error)
    }
  }

}
