import 'reflect-metadata';

import { ICompany, IDevice, IHeartBeat, IManager, ISite, InflatedDeviceInfo } from '../../../src/models';
import { INotificationService, ISessionService } from '../../../src/services';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken, newCreateCompanyDTO, newInviteManagerDTO } from '../../helpers';
import { newCreateDeviceDTO, newManagerDTO, newSiteDTO } from '../../helpers/manager';

import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

chai.use(chaiHttp);

const URL = '/api/v1/manager/devices';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const Manager = container.get<Model<IManager>>(TYPES.Manager);
const Site = container.get<Model<ISite>>(TYPES.Site);
const Device = container.get<Model<IDevice>>(TYPES.Device);
const HeartBeat = container.get<Model<IHeartBeat>>(TYPES.HeartBeat);

const sessionService = container.get<ISessionService>(TYPES.SessionService);
const notificationService = container.get<INotificationService>(TYPES.NotificationService);

describe(`POST ${URL}`, () => {
  before(async () => {
    await database.connect();
  });

  afterEach(async () => {
    await Company.deleteMany();
    await Manager.deleteMany();
    await Site.deleteMany();
    await Device.deleteMany();
    await HeartBeat.deleteMany();
  });

  after(async () => {
    await database.disconnect();
  });

  it('should fetch single device for a site successfully', async () => {
    const company = await Company.create(newCreateCompanyDTO());

    const manager = await Manager.create(newManagerDTO({ company: company._id.toString() }));

    const site = await Site.create(newSiteDTO({ manager: manager._id.toString() }));
    const device = await Device.create(newCreateDeviceDTO({ site: site._id.toString() }));

    for (let i = 0; i < 9; i++) {
      await Device.create(newCreateDeviceDTO({ site: site._id.toString() }));
    }

    await HeartBeat.create({
      site: site._id.toString(),
      device: device._id.toString(),
      metadata: {},
    });
    const token = await generateToken({ userType: 'Manager', id: manager._id.toString() }, sessionService);
    const response = await chai.request(app).get(`${URL}/${device._id.toString()}/`).set('Authorization', token);

    expect(response.status).to.be.eq(StatusCodes.OK);
    const deviceInfo: InflatedDeviceInfo = response.body.data;

    expect(deviceInfo.isOnline).to.be.true;
    expect(deviceInfo.logs!.length).to.be.eq(1);
  });
});
