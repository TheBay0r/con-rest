// con-rest
// Version: 0.0.1
//
// Author: Andy Tang
// Fork me on Github: https://github.com/EnoF/con-rest
(function serverScope(sinon, nock, _, expect, undefined) {
  'use strict';

  var mockgoose = require('mockgoose');
  var mongoose = require('mongoose');

  mockgoose(mongoose);


  var queue = require('q');
  var path = require('path');
  var mapper = require('../../../server/mapper');


  describe('con-rest mapper', function conRestServerScope() {

    beforeEach(function resetMongo(done) {
      mockgoose.reset();
      require(path.join(__dirname, 'mocks'))(done);
    });

    describe('retrieval of Mappers', function retrievalScope() {
      it('should return all the registered mappers', function getRegisteredWorkflows(done) {
        var req;
        var res;
        queue().
        then(function given() {
          req = {};
          res = {};
          res.send = sinon.spy();
        }).
        then(function when() {
          return mapper.getMappers(req, res);
        }).
        then(function then(mappers) {
          mappers.length.should.be.above(0);
          res.send.args[0][0].length.should.be.above(0);
        }).
        then(done).
        catch(done);
      });

      it('should return a mapper based on id', function getRegisteredWorkflowById(done) {
        var req;
        var res;
        queue().
        then(function given() {
          req = {
            params: {
              id: '5464b1e2f8243a3c321a0001'
            }
          };
          res = {};
          res.send = sinon.spy();
        }).
        then(function when() {
          return mapper.getMapperById(req, res);
        }).
        then(function then() {
          var call = res.send.args[0][0];
          call.name.should.be.exactly('extractor for banana and userid');
          call.maps.length.should.be.exactly(2);
          call.maps[1].source.should.equal('user.name');
          call.maps[1].destination.should.equal('userName');
        }).
        then(done).
        catch(done);
      });
    });

    describe('saving', function registrationScope() {
      it('should register an new mapper', function registerMapper(done) {
        var req;
        var res;
        queue().
        then(function given() {
          req = {
            body: {
              name: 'fake mapper',
              maps: [{
                place: 'data',
                source: 'test.data',
                destination: 'testData'
              }]
            }
          };
          res = {};
          res.send = sinon.spy();
        }).
        then(function when() {
          return mapper.createMapper(req, res);
        }).
        then(function then() {
          res.send.calledOnce.should.be.true;
          res.send.args[0][0].should.be.a.String;
        }).
        then(done).
        catch(done);
      });

      it('should overwrite an existing mapper', function saveExistingWorkflow(done) {
        var req;
        var res;
        queue().
        then(function given() {
          req = {
            body: {
              name: 'overwritten',
              maps: [{
                source: 'overwrittenSource',
                destination: 'overwrittenDestination'
              }]
            },
            params: {
              id: '5464b1e2f8243a3c321a0001'
            }
          };
          res = {};
          res.send = sinon.spy();
        }).
        then(function when() {
          return mapper.saveMapper(req, res);
        }).
        then(function then() {
          res.send.calledOnce.should.be.true;
          res.send.args[0][0].should.be.a.String;
        }).
        then(function when() {
          return mapper.getMapperById(req, {
            send: sinon.stub()
          });
        }).
        then(function then(mapper) {
          mapper.name.should.be.exactly('overwritten');
          mapper.maps.length.should.be.exactly(1);
          mapper.maps[0].source.should.equal('overwrittenSource');
          mapper.maps[0].destination.should.equal('overwrittenDestination');
        }).
        then(done).
        catch(done);
      });
    });

    describe('deletion', function detionScope() {
      it('should delete an existing mapper', function saveExistingMapper(done) {
        var req;
        var res;
        queue().
        then(function given() {
          req = {
            params: {
              id: '5464b1e2f8243a3c321a0001'
            }
          };
          res = {};
          res.send = sinon.spy();
        }).
        then(function when() {
          return mapper.deleteMapper(req, res);
        }).
        then(function then() {
          res.send.calledOnce.should.be.true;
          res.send.args[0][0].should.be.a.String;
        }).
        then(function when() {
          return mapper.getMapperById(req, {
            send: sinon.stub()
          });
        }).
        then(function then(mapper) {
          (mapper === null).should.be.true;
        }).
        then(done).
        catch(done);
      });
    });

    describe('map', function mapScope() {
      it('should execute some maps', function testMap(done) {
        var testObject = {
          ba: {
            na: {
              na: 1337
            }
          },
          users: [{
            id: 1,
            name: 'Max',
            groups: [{
              name: 'admin'
            }]
          }, ],
          testArray: [
            'banan',
            'apple', {
              test: 'orange'
            }
          ],
          arr: [
            [
              null, [
                'baz',
                1338
              ]
            ]
          ],
          foobar: 123
        };

        var testMaps = [{
          place: 'url',
          source: 'foobar',
          destination: 'rootValue'
        }, {
          place: 'url',
          source: 'ba.na',
          destination: 'bananaObj'
        }, {
          place: 'url',
          source: 'ba.na.na',
          destination: 'bananaValue'
        }, {
          place: 'url',
          source: 'testArray[1]',
          destination: 'arrayValue'
        }, {
          place: 'url',
          source: 'testArray[2].test',
          destination: 'arrayObj'
        }, {
          place: 'url',
          source: 'users[0].groups[0].name',
          destination: 'complexString'
        }, {
          place: 'url',
          source: 'users[0].groups',
          destination: 'complexArray'
        }, {
          place: 'url',
          source: 'arr[0][1][0]',
          destination: 'arrayArray'
        }, {
          place: 'url',
          source: 'users[0].email',
          destination: 'noValue'
        }];

        var testOutput = [{
          place: 'url',
          source: 'foobar',
          destination: 'rootValue',
          value: 123
        }, {
          destination: 'bananaObj',
          place: 'url',
          source: 'ba.na',
          value: {
            'na': 1337,
          }
        }, {
          destination: 'bananaValue',
          place: 'url',
          source: 'ba.na.na',
          value: 1337
        }, {
          destination: 'arrayValue',
          place: 'url',
          source: 'testArray[1]',
          value: 'apple',
        }, {
          destination: 'arrayObj',
          place: 'url',
          source: 'testArray[2].test',
          value: 'orange',
        }, {
          destination: 'complexString',
          place: 'url',
          source: 'users[0].groups[0].name',
          value: 'admin',
        }, {
          destination: 'complexArray',
          place: 'url',
          source: 'users[0].groups',
          value: [{
            'name': 'admin',
          }]
        }, {
          destination: 'arrayArray',
          place: 'url',
          source: 'arr[0][1][0]',
          value: 'baz',
        }, {
          destination: 'noValue',
          place: 'url',
          source: 'users[0].email',
          value: undefined,
        }];

        var result = mapper.map(testObject, {
          maps: testMaps
        });
        expect(result).to.deep.equal(testOutput);

        done();
      });
    });


    describe('createObjectFromMap', function mapScope() {
      it('should create a valid object', function testMap(done) {

        var result = mapper.createObjectFromMap('a.b.c', 'd');
        expect(result).to.deep.equal({
          a: {
            b: {
              c: 'd'
            }
          }
        });
        done();
      });

      it('should create a valid object with array', function testMap(done) {

        var result = mapper.createObjectFromMap('a.b[0]', 'c');
        expect(result).to.deep.equal({
          a: {
            b: [
              'c'
            ]
          }
        });


        done();
      });

      it('should create a valid object with nested array', function testMap(done) {

        var result = mapper.createObjectFromMap('a[0][0][1].b', 1337);
        expect(result).to.deep.equal({
          a: [
            [
              [, {
                b: 1337
              }]
            ]
          ]
        });

        done();
      });
    });

  });
}(
  require('sinon'),
  require('nock'),
  require('underscore'),
  require('chai').expect
));
