const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

//  https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker
suite('Functional Tests', function() {
  this.timeout(8500);
  var test_id = ""
  var test_id2 = ""

  suite('POST request to /api/issues/{project}', function() {
    // #1   
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'test_title',
          issue_text: 'test_text',
          created_by: 'tester',
          assigned_to: 'test_server',
          status_text: 'test_ongoing'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.project_id, "test", 'project id diff');
          assert.equal(res.body.issue_title, "test_title", 'title diff');
          assert.equal(res.body.issue_text, "test_text", 'issue diff');
          assert.equal(res.body.created_by, "tester", 'createdby diff');
          assert.equal(res.body.assigned_to, "test_server", 'assigned diff');
          assert.equal(res.body.status_text, "test_ongoing", 'status diff');
          assert.isOk(res.body._id, '_id should be truthy');
          assert.isOk(res.body.created_on, 'created_on should be truthy');
          assert.isOk(res.body.updated_on, 'updated_on should be truthy');
          assert.equal(res.body.open, true, 'open should be true');
          test_id2 = res.body._id; //for test 13
          done();
        });
    })
    // #2
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'test_title',
          issue_text: 'test_text',
          created_by: 'tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.project_id, "test", 'project id diff');
          assert.equal(res.body.issue_title, "test_title", 'title diff');
          assert.equal(res.body.issue_text, "test_text", 'issue diff');
          assert.equal(res.body.created_by, "tester", 'createdby diff');
          assert.isOk(res.body._id, '_id should be truthy');
          assert.isOk(res.body.created_on, 'created_on should be truthy');
          assert.isOk(res.body.updated_on, 'updated_on should be truthy');
          assert.equal(res.body.open, true, 'open should be true');
          test_id = res.body._id; // for test#7
          done();
        });
    })
    // #3
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/test')
        .send({
          issue_title: 'test_title',
          // issue_text: 'test_text',  // as the missing field
          created_by: 'tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing', 'should return error of Text Missing');
          done();
        });
    })

  })
  suite('GET request to /api/issues/{project}', function() {
    // #4
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    })
    // #5
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    })
    // #6
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/test?open=true&assigned_to=Joe')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    })

  })
  suite('PUT  request to /api/issues/{project}', function() {
    // #7
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: test_id,  //get from #2
          open: false,
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated', 'successful PUT should return "successfully updated"');
          done();
        });
    })
    // #8
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      // console.log(test_id);
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: test_id,  //get from #2
          issue_title: 'updated_title',
          issue_text: 'updated_text',
          created_by: 'updated_tester',
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated', 'successful PUT should return "successfully updated"');
          done();
        });
    })
    // #9
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          issue_title: 'updated_title_error',
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id', 'missing _id to PUT should return error');
          done();
        });
    })
    // #10
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: test_id,  //get from #2
          // no field to update
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent', 'no fields to update to PUT should return error');
          done();
        });
    })
    // #11
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/test')
        .send({
          _id: test_id + "abc",  //get from #2
          issue_title: 'updated_title_error',
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update', 'invalid _id to PUT should return error');
          done();
        });
    })

  })
  suite('DELETE request to /api/issues/{project}', function() {
    // #12
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .send({
          _id: test_id,  //get from #2
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body._id, test_id, 'could not find issue _id and delete');
          done();
        });
    })
    // #13
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      console.log(`test_id2 = ${test_id2}`)
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .send({
          _id: test_id2+"abc",  //get from #1
        })
        .end(function(err, res) {
          if (err) return console.log(err)
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete", 'invalid _id to DELETE should return error');
          done();
        });
    })
    // #14
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/test')
        .send({
        }) 
        .end(function (err, res){
          if (err) return console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id", 'could not find issue _id and delete');
          done();
        });
    })


    
  })
});
