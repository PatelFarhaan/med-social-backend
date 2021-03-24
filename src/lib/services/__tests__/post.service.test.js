const db = require('../../../db/models/')
const { destroyDefaults } = require('../../../lib/testHelpers/testUtils')
const { createDefaultUser } = require('../../fixtures/user.fixture')
const { createDefaultInterest } = require('../../fixtures/interest.fixture')
const { createDefaultExpertise } = require('../../fixtures/expertise.fixture')
const { createDefaultColumn } = require('../../fixtures/column.fixture')

const { postService } = require('../index')

const defaultPostValue = {
  content: 'Test 2',
  isQuoted: false,
  isStacked: false,
  columnSlug: 'test-column'
  // stackedPosts: [{ content: 'test 11' }, { content: 'test 12' }, { content: 'test 13' }]
}

describe('Post Service', () => {
  let user
  let expertise
  let interest
  let column
  afterAll(async () => {
    await destroyDefaults()
  })

  beforeAll(async () => {
    ;[user] = await createDefaultUser()
    ;[expertise] = await createDefaultExpertise()
    ;[interest] = await createDefaultInterest()
    await interest.addExpertise(expertise)
    ;[column] = await createDefaultColumn()
    await column.setExpertise(expertise)
    await column.setAuthor(user)
    column.addInterest(interest)
  })

  describe('Post', () => {
    afterEach(async () => {
      await db.Post.destroy({ where: {} })
    })
    test('It should create a post when valid parameters are passed', async () => {
      const post = await postService.createPost({ body: defaultPostValue }, user)
      const author = await post.getAuthor()
      expect(author.id).toBe(user.id)
      const stackedChilrenCount = await post.countStackedChildren()
      expect(stackedChilrenCount).toBe(0)
    })
  })

  describe('Post Vote', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create(defaultPostValue)
    })

    afterEach(async () => {
      await db.Post.destroy({ where: { content: 'Test 2' } })
      await db.Vote.destroy({ where: {} })
    })

    test('It should create a vote for a post wh2en valid parameters are passed', async () => {
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'UP' } }, user)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(1)
      expect(post.votes).toBe(1)
      expect(postVotes[0].Vote.type).toBe('UP')
    })

    test('It should delete the vote for a post if it already exists', async () => {
      await db.Vote.create({ postId: defaultPost.id, userId: user.id, type: 'UP' })
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'UP' } }, user)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(0)
      expect(post.votes).toBe(0)
    })

    test('It should update the original vote for the post if it has a different vote type and create a new one', async () => {
      await db.Vote.create({ postId: defaultPost.id, userId: user.id, type: 'UP' })
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'DOWN' } }, user)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(1)
      expect(postVotes[0].Vote.type).toBe('DOWN')
      expect(post.votes).toBe(-1)
    })
  })

  describe('Post Bookmark', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create(defaultPostValue)
    })

    afterEach(async () => {
      await db.Post.destroy({ where: { content: 'Test 2' } })
      await db.PostBookmark.destroy({ where: {} })
    })

    afterEach(async () => {
      await db.Post.destroy({ where: { content: 'Test 2' } })
    })

    test('It should create a bookmark for a post when valid parameters are passed', async () => {
      const post = await postService.bookmarkPost({ body: { id: defaultPost.id } }, user)
      const postBookmarks = await post.getUserBookmarks()
      expect(postBookmarks.length).toBe(1)
    })

    test('It should delete the bookmark for a post if it already exists', async () => {
      const post = await postService.bookmarkPost({ body: { id: defaultPost.id } }, user)
      const postBookmarks = await post.getUserBookmarks()
      expect(postBookmarks.length).toBe(1)
    })
  })
})
