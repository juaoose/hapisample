'use strict';

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const uuid = require('node-uuid')

module.exports = {
  name: 'myPlugin',
  version: '1.0.0',
  register: async function (server, options, next) {

    const db = server.app.db;

    server.route({
      method: 'GET',
      path: '/books',
      handler: function (request, h) {

        db.books.find((err, docs) => {

          if (err) {
            return Boom.wrap(err, 'Internal MongoDB error');
          }

          return docs;
        });

        return Boom.teapot();

      }
    });

    server.route({
      method: 'GET',
      path: '/books/{id}',
      handler: function (request, h) {

        db.books.findOne({
          _id: request.params.id
        }, (err, doc) => {

          if (err) {
            return Boom.wrap(err, 'Internal MongoDB error');
          }

          if (!doc) {
            return Boom.notFound();
          }

          return doc;
        });

        return Boom.serverUnavailable();

      }
    });

    server.route({
      method: 'POST',
      path: '/books',
      handler: function (request, h) {

        const book = request.payload;

        //Create an id
        book._id = uuid.v1();

        db.books.save(book, (err, result) => {

          if (err) {
            return Boom.wrap(err, 'Internal MongoDB error');
          }

          return book;
        });
        return book;
      },
      config: {
        validate: {
          payload: Joi.object({
            title: Joi.string().min(10).max(50).required(),
            author: Joi.string().min(10).max(50).required(),
            isbn: Joi.number()
          })
        }
      }
    });

    server.route({
      method: 'PATCH',
      path: '/books/{id}',
      handler: function (request, h) {

        db.books.update({
          _id: request.params.id
        }, {
          $set: request.payload
        }, function (err, result) {

          if (err) {
            return Boom.wrap(err, 'Internal MongoDB error');
          }

          if (result.n === 0) {
            return Boom.notFound();
          }

          return new Boom('No content', { statusCode: 204 })
        });

        return Boom.serverUnavailable();

      },
      config: {
        validate: {
          payload: Joi.object({
            title: Joi.string().min(10).max(50).optional(),
            author: Joi.string().min(10).max(50).optional(),
            isbn: Joi.number().optional()
          }).required().min(1)
        }
      }
    });

    server.route({
      method: 'DELETE',
      path: '/books/{id}',
      handler: function (request, h) {

        db.books.remove({
          _id: request.params.id
        }, function (err, result) {

          if (err) {
            return Boom.wrap(err, 'Internal MongoDB error');
          }

          if (result.n === 0) {
            return Boom.notFound();
          }

          return '204'
        });
      }
    });

  }
};