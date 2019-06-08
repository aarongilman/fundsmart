import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundRecommendationComponent } from './fund-recommendation.component';

describe('FundRecommendationComponent', () => {
  let component: FundRecommendationComponent;
  let fixture: ComponentFixture<FundRecommendationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundRecommendationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
