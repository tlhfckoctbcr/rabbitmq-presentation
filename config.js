module.exports = {
  name: 'rmq-test',
  rmq: {
    connection: {
      uri: 'amqp://localhost',
      name: 'rmq-test',
      timeout: 5000,
    },
    queues: [{
      name: 'rmq-test-queue',
      subscribe: true,
      limit: 1
    }]
  }
};