import { TestBed } from '@angular/core/testing';

import { PortfoliofundhelperService } from './portfoliofundhelper.service';

describe('PortfoliofundhelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PortfoliofundhelperService = TestBed.get(PortfoliofundhelperService);
    expect(service).toBeTruthy();
  });
});
