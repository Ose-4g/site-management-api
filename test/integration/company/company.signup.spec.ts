import 'reflect-metadata';

import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, newCreateCompanyDTO } from '../../helpers';

import { ICompany } from '../../../src/models';
import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import { compare } from 'bcryptjs';

chai.use(chaiHttp);

const URL = '/api/v1/company/new';
const Company = container.get<Model<ICompany>>(TYPES.Company);

describe(`POST ${URL}`, () => {
  before(async () => {
    await database.connect();
  });

  afterEach(async () => {
    await Company.deleteMany();
  });

  after(async () => {
    await database.disconnect();
  });

  it('should throw 422 error if required parameter is not provided', async () => {
    const dto = newCreateCompanyDTO();
    for (const key in dto) {
      const response = await chai
        .request(app)
        .post(URL)
        .send(newCreateCompanyDTO({ [key]: undefined }));

      expect(response.status).to.be.eq(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(response.body.message.toLowerCase()).to.include(key.toLowerCase());
    }
  });

  it('should throw 409 error if company is already registered', async () => {
    const dto = newCreateCompanyDTO();
    await Company.create(dto);
    const response = await chai
      .request(app)
      .post(URL)
      .send(newCreateCompanyDTO({ email: dto.email }));

    expect(response.status).to.be.eq(StatusCodes.CONFLICT);
  });

  it('should create new company successfully', async () => {
    const dto = newCreateCompanyDTO();
    const response = await chai.request(app).post(URL).send(newCreateCompanyDTO(dto));

    expect(response.status).to.be.eq(StatusCodes.CREATED);
    const createdCompany = response.body.data;

    expect(createdCompany.name).to.be.eq(dto.name);
    expect(createdCompany.email).to.be.eq(dto.email);

    const savedCompany = await Company.findOne({ email: dto.email });
    const isHash = await compare(dto.password, savedCompany!.password);
    expect(isHash).to.be.true;
  });
});
