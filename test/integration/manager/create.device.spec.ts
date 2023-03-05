import 'reflect-metadata';

import { ICompany, IDevice, IManager, ISite } from '../../../src/models';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken } from '../../helpers';
import { newCreateDeviceDTO, newManagerDTO, newSiteDTO } from '../../helpers/manager';

import { ISessionService } from '../../../src/services';
import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

const URL = '/api/v1/manager/new-device';
const Company = container.get<Model<ICompany>>(TYPES.Company);
const Manager = container.get<Model<IManager>>(TYPES.Manager);
const Site = container.get<Model<ISite>>(TYPES.Site);
const Device = container.get<Model<IDevice>>(TYPES.Device);
const sessionService = container.get<ISessionService>(TYPES.SessionService);

describe(`POST ${URL}`, () => {
  before(async () => {
    await database.connect();
  });

  afterEach(async () => {
    await Company.deleteMany();
    await Manager.deleteMany();
    await Site.deleteMany();
    await Device.deleteMany();
  });

  after(async () => {
    await database.disconnect();
  });

  it('should create device sucessfully', async () => {
    const manager = await Manager.create(newManagerDTO());
    const site = await Site.create(newSiteDTO({ manager: manager._id.toString() }));
    const token = await generateToken({ userType: 'Manager', id: manager._id.toString() }, sessionService);

    const dto = newCreateDeviceDTO({
      site: site._id.toString(),
      type: 'generator',
      metadata: {
        MVARating: 100,
      },
    });

    const response = await chai.request(app).post(URL).send(dto).set('Authorization', token);

    expect(response.status).to.be.eq(StatusCodes.CREATED);

    const device: IDevice = response.body.data;

    const savedDevice = await Device.findById(device._id);

    expect(device.name).to.be.eq(dto.name);
    expect(device.type).to.be.eq(dto.type);
    expect(device.site.toString()).to.be.eq(site._id.toString());
    expect(device.maintenanceWindow).to.be.eq(dto.maintenanceWindow);

    expect(savedDevice!.name).to.be.eq(dto.name);
    expect(savedDevice!.type).to.be.eq(dto.type);
    expect(savedDevice!.site.toString()).to.be.eq(site._id.toString());
    expect(savedDevice!.maintenanceWindow).to.be.eq(dto.maintenanceWindow);
  });
});
