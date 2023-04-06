import 'reflect-metadata';

import { ICompany, IManager } from '../../../src/models';
import { INotificationService, ISessionService } from '../../../src/services';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken, newCreateCompanyDTO, newInviteManagerDTO } from '../../helpers';

import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import { newManagerDTO } from '../../helpers/manager';
import sinon from 'sinon';

chai.use(chaiHttp);

const URL = '/api/v1/company/managers';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const Manager = container.get<Model<IManager>>(TYPES.Manager);
const sessionService = container.get<ISessionService>(TYPES.SessionService);
const notificationService = container.get<INotificationService>(TYPES.NotificationService);

describe.only(`POST ${URL}`, () => {
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

  it('should fetch managers successfully', async () => {
    const company = await Company.create(newCreateCompanyDTO());

    const managers: IManager[] = [];

    for (let i = 0; i < 10; i++) {
      const newManager = await Manager.create(newManagerDTO({ company: company._id.toString() }));
      managers.push(newManager);
    }

    const token = await generateToken({ userType: 'Company', id: company._id.toString() }, sessionService);
    const response = await chai.request(app).get(URL).set('Authorization', token);

    console.log(response.body);
    expect(response.status).to.be.eq(StatusCodes.OK);
    expect(response.body.data.length).to.be.eq(10);
    console.log(response.body);
  });
});
