import { TestBed } from '@angular/core/testing';

import { AdministrativeRequestService } from './administrative-request.service';

describe('AdministrativeRequestService', () => {
  let service: AdministrativeRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministrativeRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
