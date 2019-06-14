import { TestBed } from '@angular/core/testing';

import { GetfileforuploadService } from './getfileforupload.service';

describe('GetfileforuploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetfileforuploadService = TestBed.get(GetfileforuploadService);
    expect(service).toBeTruthy();
  });
});
