import { expect } from 'chai';

const BASE_URL = '/api/v1/auth/login';

describe(`POST ${BASE_URL}`, () => {
  it('should return true', async () => {
    expect(1 + 1).to.be.eq(2);
  });
});
