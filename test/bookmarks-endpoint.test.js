const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { testBooksArray } = require('./testBookmarks.fixtures')

describe('Bookmarks Endpoint', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  before('clean the table', () => db('bookmark_table').truncate());
  afterEach('cleanup after each test', () => db('bookmark_table').truncate())
  after('disconnect from db', ()=> db.destroy());

  describe(`GET /bookmarks`, () => {
    context(`Given no articles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, [])
      })
    })
    context('Given there are bookmarks in the DB', () => {
      const testbooks = testBooksArray();
  
      beforeEach('insert Bookmarks', () => {
        return db
          .into('bookmark_table')
          .insert(testbooks)
      })
  
      it('GET /bookmarks responds with 200 and all of bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, testbooks)
      })
    })
  })

  describe(`GET /bookmarks/:id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const bookId = 123;
        return supertest(app)
          .get(`/bookmarks/${bookId}`)
          .expect(404, 'Bookmark not found')
      })
    })

    context('Given there are bookmarks in the DB', () => {
      const testbooks = testBooksArray();

      beforeEach('insert Bookmarks', () => {
        return db
          .into('bookmark_table')
          .insert(testbooks)
      })
  
      it('GET /bookmarks/:id', () => {
        const bookId = 2;
        const expectedBook = testbooks[bookId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookId}`)
          .expect(200, expectedBook)
      })
    })
  })
})