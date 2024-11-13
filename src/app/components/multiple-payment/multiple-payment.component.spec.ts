import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePaymentComponent } from './multiple-payment.component';

describe('MultiplePaymentComponent', () => {
  let component: MultiplePaymentComponent;
  let fixture: ComponentFixture<MultiplePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiplePaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
