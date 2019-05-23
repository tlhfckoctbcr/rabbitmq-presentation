let config = require('./config');
const pino = require('pino');
const rabbit = require('rabbot');

const log = pino({
  name: config.rmq.connection.name,
  prettyPrint: true
});
config.log = log;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const worker = async message => {
  log.info(" [~] Running asynchronous code...");
  await sleep(5000);
  log.info(" [~] Work complete!");
  return message;
};

const shutdown = async () => {
  log.info(" [~] Attempting a graceful shutdown. Please wait.");
  await rabbit.shutdown();
  log.info(" [~] Exiting. Goodbye!");
};

const processMessage = async msg => {
  const msgContent = msg.content.toString();
  log.info(" [~] Received '%s'", msgContent);

  try {
    await worker(JSON.parse(msgContent));
    msg.ack();
  } catch (e) {
    log.error(`${e}`);
    // Reject any msg that is not capable of being processed
    // We should discuss the addition of a dead letter queue
    msg.reject();
  }
};

const main = async () => {
  try {
    rabbit.handle({
      handler: async msg => {
        await processMessage(msg);
      }
    });

    await rabbit.configure(config.rmq);
    log.info(" [~] Connection established. Subscribed and waiting for messages.");

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    log.error(" [!] Error establishing a connection: ", err);
  }
};

main();
