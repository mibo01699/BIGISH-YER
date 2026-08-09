// tests/mining.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const miningRouter = require('../server/routes/mining');

const { expect } = chai;
chai.use(chaiHttp);

const app = express();
app.use(express.json());
app.use('/', miningRouter);

describe('⛏️ BIGISH-YER: In-App Mining Security Protocols', () => {
    it('Should block mining requests if no Pi identity is passed', (done) => {
        chai.request(app)
            .post('/api/yer/mining/start')
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.success).to.equal(false);
                done();
            });
    });
});
