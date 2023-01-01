import 'reflect-metadata';

import { ICompany, IManager } from '../../../src/models';
import { INotificationService, ISessionService } from '../../../src/services';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken, newCreateCompanyDTO, newInviteManagerDTO } from '../../helpers';

import { Model } from 'mongoose';
import { Redis } from 'ioredis';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

chai.use(chaiHttp);

const URL = '/api/v1/company/invite-manager';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const redis = container.get<Redis>(TYPES.Redis);
const Manager = container.get<Model<IManager>>(TYPES.Manager);
const sessionService = container.get<ISessionService>(TYPES.SessionService);
const notificationService = container.get<INotificationService>(TYPES.NotificationService);

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
    await redis.quit();
  });

  it('should throw 422 error if required parameter is not provided', async () => {
    const dto = newInviteManagerDTO();
    for (const key in dto) {
      const response = await chai
        .request(app)
        .post(URL)
        .send(newInviteManagerDTO({ [key]: undefined }));

      expect(response.status).to.be.eq(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(response.body.message.toLowerCase()).to.include(key.toLowerCase());
    }
  });

  it('should invite manager successfully', async () => {
    const company = await Company.create(newCreateCompanyDTO());
    const dto = newInviteManagerDTO();

    const emailStub = sinon.stub(notificationService, 'sendMail').resolves();

    const token = await generateToken({ userType: 'Company', id: company._id.toString() }, sessionService);
    const response = await chai.request(app).post(URL).send(dto).set('Authorization', token);

    expect(response.status).to.be.eq(StatusCodes.OK);
    expect(emailStub.calledOnce).to.be.true;
    expect(emailStub.calledWith(dto.email)).to.be.true;

    const savedManager = await Manager.findOne({ email: dto.email });
    expect(savedManager).not.to.be.undefined;
    expect(savedManager).not.to.be.null;

    expect(savedManager!.name).to.be.eq(dto.name);
    expect(savedManager!.company.toString()).to.be.eq(company._id.toString());

    emailStub.restore();
  });
});
