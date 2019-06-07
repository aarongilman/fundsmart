import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationRecommendationComponent } from './allocation-recommendation.component';

describe('AllocationRecommendationComponent', () => {
  let component: AllocationRecommendationComponent;
  let fixture: ComponentFixture<AllocationRecommendationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationRecommendationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
