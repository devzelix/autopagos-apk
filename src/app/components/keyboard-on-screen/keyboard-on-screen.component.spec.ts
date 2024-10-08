import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardOnScreenComponent } from './keyboard-on-screen.component';

describe('KeyboardOnScreenComponent', () => {
  let component: KeyboardOnScreenComponent;
  let fixture: ComponentFixture<KeyboardOnScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyboardOnScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyboardOnScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
