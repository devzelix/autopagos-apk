import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMobileBNCComponent } from './payment-mobile-bnc.component';

describe('PaymentMobileBNCComponent', () => {
  let component: PaymentMobileBNCComponent;
  let fixture: ComponentFixture<PaymentMobileBNCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentMobileBNCComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMobileBNCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
