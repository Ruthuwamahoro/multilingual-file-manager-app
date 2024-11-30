const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
chai.use(chaiHttp);
const { expect } = chai;

// Dynamically generate a random file name for each test run
const generateRandomFileName = (originalName) => {
    const extension = path.extname(originalName); // Get the file extension
    const baseName = path.basename(originalName, extension); // Get the base name
    const timestamp = Date.now(); // Use timestamp as a unique identifier
    return `${baseName}_${timestamp}${extension}`;
};

const filePath = path.join(__dirname, '../uploads/image4.jpg');
const randomFileName = generateRandomFileName('image4.jpg');
const randomFilePath = path.join(__dirname, '../uploads', randomFileName);

chai.use(chaiHttp);

let token = '';

describe('File Upload API', function () {
    before(done => {
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

    before(() => {
        // Copy the original file to create a new one with the random name
        fs.copyFileSync(filePath, randomFilePath);
    });

    after(() => {
        // Clean up the generated file after tests
        if (fs.existsSync(randomFilePath)) {
            fs.unlinkSync(randomFilePath);
        }
    });

    it('should upload a file successfully', function (done) {
        request(app)
            .post('/api/files')
            .set('Authorization', `Bearer ${token}`)
            .field('directory', '67446fcce9c8023e1dd07d73')
            .attach('file', fs.readFileSync(randomFilePath), randomFileName)
            .end(function (err, response) {
                console.log("++++++++++++++++++", response.body);
                expect(response.status).to.equal(201);
                done();
            });
    }).timeout(10000);

    it('should return a 400 error when no file is attached', function (done) {
        request(app)
            .post('/api/files')
            .set('Authorization', `Bearer ${token}`)
            .field('directory', '67446fcce9c8023e1dd07d73')
            .end(function (err, response) {
                console.log("++++++++++++++++++", response.body);
                expect(response.status).to.equal(400);
                done();
            });
    }).timeout(10000);

    it('should return a 500 error for a duplicate file', function (done) {
        request(app)
            .post('/api/files')
            .set('Authorization', `Bearer ${token}`)
            .field('directory', '67446fcce9c8023e1dd07d73')
            .attach('file', fs.readFileSync(filePath), 'image4.jpg') 
            .end(function (err, response) {
                // console.log("++++++++++++++++++", response.body);
                expect(response.status).to.equal(500);
                done();
            });
    }).timeout(10000);
});