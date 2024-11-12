import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnTransactionComponent } from './btn-transaction.component';

describe('BtnTransactionComponent', () => {
  let component: BtnTransactionComponent;
  let fixture: ComponentFixture<BtnTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtnTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
