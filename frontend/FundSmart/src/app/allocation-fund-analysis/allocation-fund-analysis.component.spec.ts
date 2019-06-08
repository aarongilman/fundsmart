import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationFundAnalysisComponent } from './allocation-fund-analysis.component';

describe('AllocationFundAnalysisComponent', () => {
  let component: AllocationFundAnalysisComponent;
  let fixture: ComponentFixture<AllocationFundAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationFundAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationFundAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
