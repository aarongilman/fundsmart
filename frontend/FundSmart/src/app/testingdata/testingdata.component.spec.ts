import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingdataComponent } from './testingdata.component';

describe('TestingdataComponent', () => {
  let component: TestingdataComponent;
  let fixture: ComponentFixture<TestingdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestingdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
