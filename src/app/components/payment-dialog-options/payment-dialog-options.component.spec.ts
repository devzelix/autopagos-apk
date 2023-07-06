import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDialogOptionsComponent } from './payment-dialog-options.component';

describe('PaymentDialogOptionsComponent', () => {
  let component: PaymentDialogOptionsComponent;
  let fixture: ComponentFixture<PaymentDialogOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentDialogOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDialogOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
