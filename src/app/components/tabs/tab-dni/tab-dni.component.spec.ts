import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDniComponent } from './tab-dni.component';

describe('TabDniComponent', () => {
  let component: TabDniComponent;
  let fixture: ComponentFixture<TabDniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabDniComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabDniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
