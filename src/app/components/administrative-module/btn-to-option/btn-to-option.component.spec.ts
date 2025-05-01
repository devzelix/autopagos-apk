import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnToOptionComponent } from './btn-to-option.component';

describe('BtnToOptionComponent', () => {
  let component: BtnToOptionComponent;
  let fixture: ComponentFixture<BtnToOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtnToOptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnToOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
