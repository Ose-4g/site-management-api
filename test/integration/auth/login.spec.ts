import 'reflect-metadata';

import { ICompany, IManager } from '../../../src/models';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, newCreateCompanyDTO, newLoginDTO } from '../../helpers';

import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

chai.use(chaiHttp);

const URL = '/api/v1/auth/login';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const Manager = container.get<Model<IManager>>(TYPES.Manager);

describe(`POST ${URL}`, () => {
  before(async () => {
    await database.connect();
  });

  afterEach(async () => {
    await Company.deleteMany();
    await Manager.deleteMany();
  });

  after(async () => {
    await database.disconnect();
  });

  it('should login company successfully', async () => {
    const dto = newCreateCompanyDTO();
    const originalPassword = dto.password;
    dto.password = await hash(dto!.password, 10);
    const comp = await Company.create(dto);

    const response = await chai
      .request(app)
      .post(URL)
      .send(
        newLoginDTO({
          userType: 'Company',
          email: dto.email,
          password: originalPassword,
        })
      );

    expect(response.status).to.be.eq(StatusCodes.OK);
  });

  it('should login manager successfully', async () => {
    const company = await Company.create(newCreateCompanyDTO());

    const originalPassword = faker.random.alphaNumeric(10);
    const hashedPassword = await hash(originalPassword, 10);
    const email = faker.internet.email().toLowerCase();

    await Manager.create({
      email,
      password: hashedPassword,
      company: company._id.toString(),
      name: faker.name.firstName(),
    });

    const response = await chai
      .request(app)
      .post(URL)
      .send(
        newLoginDTO({
          userType: 'Manager',
          email: email,
          password: originalPassword,
        })
      );

    expect(response.status).to.be.eq(StatusCodes.OK);
    const data = response.body.data;
  });
});
