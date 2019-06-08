import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadSearchComponent } from './head-search.component';

describe('HeadSearchComponent', () => {
  let component: HeadSearchComponent;
  let fixture: ComponentFixture<HeadSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
