const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const books = require('./bookStore');
const { isWebUri } = require('valid-url')
const BookmarkService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const bookmarkList = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
})

bookmarksRouter.get('/', (req, res, next) => {
  const db = req.app.get('db');
  BookmarkService.getAllBookmarks(db)
    .then(bookmark => {
      res.status(200).json(bookmark.map(bookmarkList))
    })
    .catch(next)
})

bookmarksRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const db = req.app.get('db');
  BookmarkService.getBookmarkById(db, id)
    .then(book => {
      if(!book) {
        logger.error(`Book with id ${id} not found.`)
        return res
          .status(404)
          .send('Bookmark not found')
      }
      res.status(200).json(bookmarkList(book))
    })
    .catch(next)
})

bookmarksRouter.post('/', bodyParser, (req, res, next) => {
  const { title, url, description, rating } = req.body;

  if(!title) {
    logger.error('Title not found')
    return res
      .status(400)
      .send('Please enter title')
  }

  if(!url) {
    logger.error('No URL supplied')
    return res
      .status(400)
      .send('Please enter a URL')
  }
  
  if(!isWebUri(url)) {
    logger.error(`Invalid URL format`)
    return res
      .status(400)
      .send('Please enter a valid URL format')
  }

  if(!description) {
    logger.error('No description found')
    return res
      .status(400)
      .send('Please enter a description')
  }

  if(!rating) {
    logger.error('No rating found')
    return res
      .status(400)
      .send('Please enter a rating')
  }

  if((rating < 1 || rating > 5)) {
    logger.error('Invalid rating number')
    return res
      .status(400)
      .send('Please enter number between 1 to 5')
  }

  if((typeof rating !== 'number')) {
    logger.error('Invalid rating number')
    return res
      .status(400)
      .send('Please enter a number')
  }

  const id = uuid();

  const bookObject = {
    id,
    title,
    url,
    description,
    rating
  }
  
  books.push(bookObject)

  logger.info(`Book with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json({id})
});

bookmarksRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  const bookmarkIndex = books.findIndex(list => list.id == id)

  if (bookmarkIndex === -1) {
    logger.error(`Book with id ${id} not found`);
    return res
      .status(404)
      .send('Id not found');
  }

  books.splice(bookmarkIndex, 1);

  logger.info(`Card with id ${id} deleted.`)

  res
    .status(204)
    .end()
})

module.exports = bookmarksRouter;