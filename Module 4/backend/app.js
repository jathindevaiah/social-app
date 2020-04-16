const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');
const app  = express();

mongoose.connect('mongodb+srv://<user>:<password>@devaiah-cluster-fez7l.mongodb.net/node-angular?retryWrites=true&w=majority')
.then(() => {
  console.log("connected to Mongo");
})
.catch(() => {
  console.log("error connecting to Mongo");
})

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });

  post.save()
  .then(createdPost => {
    res.status(201).json({
      message: 'Post Added !!',
      postId: createdPost._id
    });
  });

});

app.get('/api/posts', (req, res, next) => {
  Post.find()
  .then(documents => {
    res.status(200).json({
      message: 'post sent successfully',
      posts: documents
    });
  });
});

app.delete('/api/posts/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
  .then(() => {
    res.status(200).json({
      message: "Post Deleted!!"
    });
  });
});

module.exports = app;
