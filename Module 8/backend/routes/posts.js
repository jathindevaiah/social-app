const express = require('express');
const multer = require('multer');
const Post = require('../models/post');
const checkAuth  = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVaid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid Mime Type');
    if(isVaid) {
      error = null;
    }
    cb(error, "backend/images");
  },

  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });

  post.save()
  .then(createdPost => {
    res.status(201).json({
      message: 'Post Added !!',
      post: {
        ...createdPost,
        id: createdPost._id,
      }
    });
  });
});

router.put('/:id', checkAuth, multer({storage: storage}).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if(req.file){
      const url = req.protocol + '://' + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    });

    Post.updateOne({_id: req.params.id}, post)
    .then(updatedPost => {
      res.status(201).json({
        message: 'Post Added !!',
        postId: updatedPost._id
      });
    });
  });

router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const curentPage = +req.query.page;
  const postQuery = Post.find();

  let fetchedPost;

  if(pageSize && curentPage){
    postQuery
      .skip(pageSize * (curentPage - 1))
      .limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPost = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'post sent successfully',
        posts: fetchedPost,
        maxPosts: count
      });
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
  .then(post => {
    if(post){
      res.status(200).json(post);
    }
    else{
      res.status(404).json({
        message: 'post not found'
      });
    }

  });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
  .then(() => {
    res.status(200).json({
      message: "Post Deleted!!"
    });
  });
});

module.exports = router;
