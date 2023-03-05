import 'reflect-metadata';

import { ICompany, IDevice, IManager, ISite } from '../../../src/models';
import app, { container } from '../../../src/app';
import chai, { expect } from 'chai';
import { database, generateToken } from '../../helpers';
import { newCreateSiteDTO, newManagerDTO } from '../../helpers/manager';

import { ISessionService } from '../../../src/services';
import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../../../src/di';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

const URL = '/api/v1/manager/new-site';
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

  it('should create site sucessfully', async () => {
    const manager = await Manager.create(newManagerDTO());
    const dto = newCreateSiteDTO();

    const token = await generateToken({ userType: 'Manager', id: manager._id.toString() }, sessionService);
    const response = await chai.request(app).post(URL).send(dto).set('Authorization', token);

    expect(response.status).to.be.eq(StatusCodes.CREATED);

    const site: ISite = response.body.data;

    const savedSite = await Site.findById(site._id);

    expect(site.name).to.be.eq(dto.name);
    expect(site.description).to.be.eq(dto.description);
    expect(site.location).to.be.eq(dto.location);
    expect(site.manager).to.be.eq(manager._id.toString());

    expect(savedSite!.name).to.be.eq(dto.name);
    expect(savedSite!.description).to.be.eq(dto.description);
    expect(savedSite!.location).to.be.eq(dto.location);
    expect(savedSite!.manager.toString()).to.be.eq(manager._id.toString());
  });
});
