import { TestBed } from '@angular/core/testing';

import { VposuniversalRequestService } from './vposuniversal-request.service';

describe('VposuniversalRequestService', () => {
  let service: VposuniversalRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VposuniversalRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
