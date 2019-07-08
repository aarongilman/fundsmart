import { TestBed } from '@angular/core/testing';

import { HoldingdetailsSortService } from './holdingdetails-sort.service';

describe('HoldingdetailsSortService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HoldingdetailsSortService = TestBed.get(HoldingdetailsSortService);
    expect(service).toBeTruthy();
  });
});
