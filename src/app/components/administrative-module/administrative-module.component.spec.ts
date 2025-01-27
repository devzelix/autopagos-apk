import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeModuleComponent } from './administrative-module.component';

describe('AdministrativeModuleComponent', () => {
  let component: AdministrativeModuleComponent;
  let fixture: ComponentFixture<AdministrativeModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrativeModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
