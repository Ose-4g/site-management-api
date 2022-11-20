import { connect } from 'mqtt';
import { env } from './config';
import { container } from './app';
import { TYPES } from './di';
import { IHearbeatService } from './services';

const client = connect(env.MQTT_URL);
const heartBeatService = container.get<IHearbeatService>(TYPES.HeartBeatService);
client.on('connect', function () {
  client.subscribe(env.APP_ID, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

client.on(env.APP_ID, async function (topic: any, payload: any, packet: any) {
  const data = JSON.parse(Buffer.from(payload).toString());
  console.log(topic, '--->', data);
  await heartBeatService.createRecord(data);
});

console.log('listening on mqtt channel');
