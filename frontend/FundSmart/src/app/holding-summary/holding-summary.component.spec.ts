import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingSummaryComponent } from './holding-summary.component';

describe('HoldingSummaryComponent', () => {
  let component: HoldingSummaryComponent;
  let fixture: ComponentFixture<HoldingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
