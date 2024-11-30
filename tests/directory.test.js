const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Directory = require('../src/models/directory.model');
const { expect } = chai;

chai.use(chaiHttp);

let token = '';
let testDirectoryId = '';
const randomDirectoryName = `TestDir_${Date.now()}`; // Generate a unique name for each test run

describe('Directory API', function () {


  before((done) => {
    const currentuser = {
      email: 'test@gmail.com',
      password: 'Airene@123',
    };

    chai
      .request(app)
      .post('/api/auth/login')
      .send(currentuser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        token = res.body.data;
        done();
      });
  });

  after(async function () {
    if (testDirectoryId) {
      await Directory.findByIdAndDelete(testDirectoryId);
    }

  });

  it('should create a new directory successfully', (done) => {
    chai
      .request(app)
      .post('/api/directories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: randomDirectoryName })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Successfully created directory');
        testDirectoryId = res.body.data._id;
        done();
      });
  }).timeout(15000)

  it('should not create a duplicate directory', (done) => {
    chai
    .request(app)
    .post('/api/directories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: randomDirectoryName })
    .end((err, res) => {
    //   console.log('Response Body:', res.body); 
    //   console.log('Response Status:', res.status); 
      expect(res).to.have.status(400); 
      done();
    });
  
  }).timeout(15000);

  it('should retrieve all directories for the user', (done) => {
    chai
      .request(app)
      .get('/api/directories')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Directories and files successfully retrieved');
        expect(res.body.data).to.be.an('array');
        done();
      });
  }).timeout(15000)

  it('should retrieve a single directory by ID', (done) => {
    chai
      .request(app)
      .get(`/api/directories/${testDirectoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Directory and files successfully retrieved');
        expect(res.body.data._id).to.equal(testDirectoryId);
        done();
      });
  }).timeout(15000);
});