// Connect to db
// Connect to queue

// Run saves through oni-save-parser
// Aggregate results and save to db

// Log: 
// Biomes (x, y, w, h)
// Geysers (x, y)
// Resources (x, y, type)
// Buildings (x, y, type)
// Critters (x, y, type)
// World traits (name, value)
// IF DLC is enabled, spacedout, frostyplanet etc.

// TODO: Consider flattening the data structure to make it easier to query, not sure entirely which way is best. For now we will build relationships. 
// i.e. geyser_steam_x, geyser_steam_y, geyser_natural_gas_x, geyser_natural_gas_y, etc.

require('dotenv').config();
require('../../lib/database');

const amqplib = require('amqplib');

(async () => {
  const queue = 'tasks';
  const conn = await amqplib.connect('amqp://localhost');

  const ch1 = await conn.createChannel();
  await ch1.assertQueue(queue);

  // Listener
  ch1.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Received:', msg.content.toString());
      ch1.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });

  // Sender
  const ch2 = await conn.createChannel();

  setInterval(() => {
    ch2.sendToQueue(queue, Buffer.from('something to do'));
  }, 1000);
})();