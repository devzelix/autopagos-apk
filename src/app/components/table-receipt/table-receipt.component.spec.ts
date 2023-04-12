import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReceiptComponent } from './table-receipt.component';

describe('TableReceiptComponent', () => {
  let component: TableReceiptComponent;
  let fixture: ComponentFixture<TableReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableReceiptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
