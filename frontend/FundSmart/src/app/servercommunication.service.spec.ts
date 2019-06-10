import { TestBed } from '@angular/core/testing';

import { ServercommunicationService } from './servercommunication.service';

describe('ServercommunicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServercommunicationService = TestBed.get(ServercommunicationService);
    expect(service).toBeTruthy();
  });
});
