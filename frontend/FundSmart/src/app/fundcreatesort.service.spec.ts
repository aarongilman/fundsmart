import { TestBed } from '@angular/core/testing';

import { FundcreatesortService } from './fundcreatesort.service';

describe('FundcreatesortService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FundcreatesortService = TestBed.get(FundcreatesortService);
    expect(service).toBeTruthy();
  });
});
