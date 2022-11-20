import { connect } from 'mqtt';
import { env } from './config';

const client = connect(env.MQTT_URL);

client.on('connect', function () {
  client.subscribe(env.APP_ID, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

client.on('message', function (topic, payload, packet) {
  const data = JSON.parse(Buffer.from(payload).toString());
  console.log(topic, '--->', data);
});

console.log('listening on mqtt channel');
