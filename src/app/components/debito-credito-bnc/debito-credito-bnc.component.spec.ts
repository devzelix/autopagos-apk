import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitoCreditoBNCComponent } from './debito-credito-bnc.component';

describe('DebitoCreditoBNCComponent', () => {
  let component: DebitoCreditoBNCComponent;
  let fixture: ComponentFixture<DebitoCreditoBNCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebitoCreditoBNCComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebitoCreditoBNCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
