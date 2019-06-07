import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingDetailsComponent } from './holding-details.component';

describe('HoldingDetailsComponent', () => {
  let component: HoldingDetailsComponent;
  let fixture: ComponentFixture<HoldingDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
