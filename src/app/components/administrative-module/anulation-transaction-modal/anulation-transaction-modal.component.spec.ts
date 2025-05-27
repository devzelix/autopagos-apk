import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnulationTransactionModalComponent } from './anulation-transaction-modal.component';

describe('AnulationTransactionModalComponent', () => {
  let component: AnulationTransactionModalComponent;
  let fixture: ComponentFixture<AnulationTransactionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnulationTransactionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnulationTransactionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
