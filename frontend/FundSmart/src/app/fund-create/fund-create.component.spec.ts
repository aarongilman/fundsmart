import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundCreateComponent } from './fund-create.component';

describe('FundCreateComponent', () => {
  let component: FundCreateComponent;
  let fixture: ComponentFixture<FundCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
