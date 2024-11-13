import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniquePaymentComponent } from './unique-payment.component';

describe('UniquePaymentComponent', () => {
  let component: UniquePaymentComponent;
  let fixture: ComponentFixture<UniquePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniquePaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniquePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
