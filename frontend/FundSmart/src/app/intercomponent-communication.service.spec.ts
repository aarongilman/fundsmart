import { TestBed } from '@angular/core/testing';

import { IntercomponentCommunicationService } from './intercomponent-communication.service';

describe('IntercomponentCommunicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntercomponentCommunicationService = TestBed.get(IntercomponentCommunicationService);
    expect(service).toBeTruthy();
  });
});
