const chai = require('chai'); 
const sinon = require('sinon');
const expect = chai.expect;
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const app = require('../app');

describe('Authentication Routes', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('POST /api/auth/signup', function() {
    it('should successfully create a new user with valid input', function(done) {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        gender: 'other',
        telephone: '+250123456789',
        password: 'strongpassword123'
      };

      sandbox.stub(User, 'findOne').resolves(null);
      const hashStub = sandbox.stub(bcrypt, 'hash').resolves('hashedpassword');
      sandbox.stub(User.prototype, 'save').resolves(userData);

      request(app)
        .post('/api/auth/signup')
        .send(userData)
        .end(function(err, response) {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.include('success');
          sinon.assert.calledWith(hashStub, userData.password, 10);
          done();
        });
    });

    it('should return 400 if username already exists', function(done) {
      const userData = {
        username: 'existinguser',
        email: 'test@example.com',
        gender: 'other',
        telephone: '+250123456789',
        password: 'strongpassword123'
      };

      sandbox.stub(User, 'findOne').resolves({ username: 'existinguser' });

      request(app)
        .post('/api/auth/signup')
        .send(userData)
        .end(function(err, response) {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Username is already in use');
          done();
        });
    });
  });

  describe('POST /auth/login', function() {
    it('should successfully login with correct credentials', function(done) {
      const userData = {
        email: 'test@example.com',
        password: 'correctpassword'
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email,
        password: 'hashedpassword'
      };

      sandbox.stub(User, 'findOne').resolves(mockUser);
      sandbox.stub(bcrypt, 'compare').resolves(true);
      sandbox.stub(jwt, 'sign').returns('mocktoken');

      request(app)
        .post('/api/auth/login')
        .send(userData)
        .end(function(err, response) {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal('Successfully logged in');
          done();
        });
    });
  });
});
