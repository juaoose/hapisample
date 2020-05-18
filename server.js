'use strict';

const Hapi = require('@hapi/hapi');
const mongojs = require('mongojs');

const init = async () => {

  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    debug: { request: ['error', 'test'] }
  });

  //Database connection
  server.app.db = mongojs('hapi-rest-mongo', ['books']);

  //Routes
  await server.register({
    plugin: require('./routes/books'),
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();