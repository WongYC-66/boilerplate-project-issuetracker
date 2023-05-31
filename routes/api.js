'use strict';
const mongoose = require('mongoose');

module.exports = async function main(app) {
  mongoose.connect(process.env.MONGO_URI);  // https://mongoosejs.com/docs/ 
  // Create a Model / SCHEMA

  const issueSchema = new mongoose.Schema({
    project_id: {
      type: String,
      required: true,
    },
    issue_title: {
      type: String,
      required: true,
    },
    issue_text: {
      type: String,
      required: true,
    },
    created_on: { type: Date },
    updated_on: { type: Date },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String,
      default: ""
    },
    open: {
      type: Boolean,
      default: false
    },
    status_text: {
      type: String,
      default: ""
    },
  });
  const Issues = mongoose.model('Issues', issueSchema);

  app.route('/api/issues/:project')
    // *********************************
    .get(async function(req, res) {
      console.log(`GET`)
      // get query property
      // console.log(req.query)
      // console.log(req.params)
      
      let project_id = req.params.project;

      const _id = req.query._id;
      const titleFilter = req.query.issue_title
      const textFilter = req.query.issue_text
      const createdByFilter = req.query.created_by
      const assignedToFilter = req.query.assigned_to
      const statusTextFilter = req.query.status_text
      const openFilter = req.query.open
    
      // find and apply filter
      let query = Issues.find({ project_id: project_id });
      if (titleFilter) query.find({ issue_title: titleFilter });
      if (textFilter) query.find({ issue_text: textFilter });
      if (createdByFilter) query.find({ created_by: createdByFilter });
      if (assignedToFilter) query.find({ assigned_to: assignedToFilter });
      if (statusTextFilter) query.find({ status_text: statusTextFilter });
      if (openFilter) query.find({ open: openFilter });
      if (_id) query.find({ _id: _id });

      query.getFilter();
      const response = await query.exec();

      // console.log(response)
      return res.json(response);

    })
    // *********************************
    .post(async function(req, res) {
      // let project_id = req.params.project;
      // console.log(`POST : ${req.body}`);
      console.log(`POST`);
      // console.log(req.body);
      // error handling if required field is empty;
      if (!req.body.issue_title) return res.json({ error: "required field(s) missing" });
      if (!req.body.issue_text) return res.json({ error: "required field(s) missing" });
      if (!req.body.created_by) return res.json({ error: "required field(s) missing" });

      const newIssue = new Issues({  // create new issue instance
        project_id: req.params.project,  // from url
        issue_title: req.body.issue_title, // from form
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: true,
        created_on: Date.now(),
        updated_on: Date.now(),
      });
      // console.log(newIssue);
      let response = await newIssue.save();
      // console.log(response)
      return res.json(response);
    })
    // *********************************
    .put(async function(req, res) {
      // update field
      console.log(`PUT :`);
      // console.log(req.body);
      let _id = req.body._id;

      let b = req.body;
      // error handling
      if (!_id) {
        // console.log("error: 'missing _id'")
        return res.json({ error: 'missing _id' });
      }
      if (!b.issue_title && !b.issue_text && !b.created_by && !b.assigned_to && !b.status_text && !b.hasOwnProperty('open')) {
        // console.log('error : no update field(s) sent')
        return res.json({ error: 'no update field(s) sent', _id: _id });
      }
      if (!mongoose.Types.ObjectId.isValid(_id)) return res.json({ error: 'could not update', '_id': _id });

      let updateObj = {}
      if (b.issue_title) updateObj.issue_title = b.issue_title;
      if (b.issue_text) updateObj.issue_text = b.issue_text;
      if (b.created_by) updateObj.created_by = b.created_by;
      if (b.assigned_to) updateObj.assigned_to = b.assigned_to;
      if (b.status_text) updateObj.status_text = b.status_text;
      updateObj.open = true;
      if (b.hasOwnProperty('open')) updateObj.open = b.open;
      updateObj.updated_on = Date.now();
      // console.log(req.body);
      let response = await Issues
        .findOneAndUpdate({ _id: _id }, updateObj);
      // if no issue found with _id
      if (!response) {
        // console.log(`error: 'could not update', '_id': ${_id}`);
        return res.json({ error: 'could not update', '_id': _id });
      } else {
        // console.log(`result: 'successfully updated', '_id': ${_id}`)
        return res.json({ result: 'successfully updated', _id: _id });
      }
    })
    // *********************************
    .delete(async function(req, res) {
      let _id = req.body._id;
      console.log(`DELETE`);
      // console.log(${_id});

      // error handling
      if (!_id) return res.json({ error: 'missing _id' });
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      let response = await Issues.where().findOneAndDelete({ _id: _id });
      // console.log(`response : ${response}`);   
      // if no issue found with _id
      if (!response) return res.json({ error: 'could not delete', '_id': _id });
      return res.json({ result: 'successfully deleted', '_id': _id });
    })
}
