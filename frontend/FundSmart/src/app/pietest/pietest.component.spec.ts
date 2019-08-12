import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PietestComponent } from './pietest.component';

describe('PietestComponent', () => {
  let component: PietestComponent;
  let fixture: ComponentFixture<PietestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PietestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PietestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
