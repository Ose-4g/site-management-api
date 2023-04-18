import 'reflect-metadata';

import { ICompany, IManager, ISite } from '../../../src/models';
import { INotificationService, ISessionService } from '../../../src/services';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken, newCreateCompanyDTO, newInviteManagerDTO } from '../../helpers';
import { newManagerDTO, newSiteDTO } from '../../helpers/manager';

import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

chai.use(chaiHttp);

const URL = '/api/v1/company/sites';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const Manager = container.get<Model<IManager>>(TYPES.Manager);
const Site = container.get<Model<ISite>>(TYPES.Site);

const sessionService = container.get<ISessionService>(TYPES.SessionService);
const notificationService = container.get<INotificationService>(TYPES.NotificationService);

describe.only(`POST ${URL}/:siteId`, () => {
  before(async () => {
    await database.connect();
  });

  afterEach(async () => {
    await Company.deleteMany();
    await Manager.deleteMany();
    await Site.deleteMany();
  });

  after(async () => {
    await database.disconnect();
  });

  it('should fetch manager sites successfully', async () => {
    const company = await Company.create(newCreateCompanyDTO());

    const [manager1, manager2] = await Manager.create([
      newManagerDTO({ company: company._id.toString() }),
      newManagerDTO({ company: company._id.toString() }),
    ]);

    for (let i = 0; i < 10; i++) {
      await Site.create([
        newSiteDTO({ manager: manager1._id.toString() }),
        newSiteDTO({ manager: manager2._id.toString() }),
      ]);
    }

    const token = await generateToken({ userType: 'Company', id: company._id.toString() }, sessionService);
    const response = await chai.request(app).get(`${URL}/${manager1._id.toString()}`).set('Authorization', token);

    expect(response.status).to.be.eq(StatusCodes.OK);
    expect(response.body.data.length).to.be.eq(10);
  });
});
