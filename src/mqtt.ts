import { IHearbeatService } from './services';
import { TYPES } from './di';
import { connect } from 'mqtt';
import { container } from './app';
import { env } from './config';

const client = connect(env.MQTT_URL);
const heartBeatService = container.get<IHearbeatService>(TYPES.HeartBeatService);
client.on('connect', function () {
  console.log('connected');
  console.log('listening on mqtt channel');
  client.subscribe(env.APP_ID, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

client.on('message', async function (topic: any, payload: any, packet: any) {
  const data = JSON.parse(Buffer.from(payload).toString());
  console.log(topic, '--->', data);
  try {
    await heartBeatService.createRecord(data);
  } catch (error: any) {
    console.log('error', error.message);
  }
});
