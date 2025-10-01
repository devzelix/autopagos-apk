import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigIpUbiiposComponent } from './config-ip-ubiipos.component';

describe('ConfigIpUbiiposComponent', () => {
  let component: ConfigIpUbiiposComponent;
  let fixture: ComponentFixture<ConfigIpUbiiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigIpUbiiposComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigIpUbiiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
