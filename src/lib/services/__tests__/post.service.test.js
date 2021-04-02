const db = require('../../../db/models/')
const { destroyDefaults } = require('../../../lib/testHelpers/testUtils')
const { createDefaultUser, createDefaultUser2 } = require('../../fixtures/user.fixture')
const { createDefaultInterest } = require('../../fixtures/interest.fixture')
const { createDefaultExpertise } = require('../../fixtures/expertise.fixture')
const { createDefaultColumn } = require('../../fixtures/column.fixture')
const { reputationSources } = require('../../constants/reputation.constant')

const { postService } = require('../index')

const defaultPostValue = {
  content: 'Test 2 @sam',
  isQuoted: false,
  isStacked: false,
  columnSlug: 'test-column',
  column: 'test-column'
}

describe('Post Service', () => {
  let user
  let user2
  let expertise
  let interest
  let column
  afterAll(async () => {
    await destroyDefaults()
  })

  beforeAll(async () => {
    ;[user] = await createDefaultUser()
    ;[user2] = await createDefaultUser2()
    ;[expertise] = await createDefaultExpertise()
    ;[interest] = await createDefaultInterest()
    await interest.addExpertise(expertise)
    ;[column] = await createDefaultColumn()
    await column.setExpertise(expertise)
    await column.setAuthor(user)
    await column.addInterest(interest)
  })

  describe('Post', () => {
    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.Notification.destroy({ where: {} })
    })
    test('It should create a post when valid parameters are passed', async () => {
      const post = await postService.createPost({ body: defaultPostValue }, user)
      const author = await post.getAuthor()
      expect(author.id).toBe(user.id)
      const stackedChilrenCount = await post.countStackedChildren()
      expect(stackedChilrenCount).toBe(0)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(1)
      const notificationReceipients = await notifications[0].getReceipients()
      expect(notificationReceipients.length).toBe(1)
    })

    test('It should create a quoted post when valid parameters are passed', async () => {
      const defaultPost = await db.Post.create({ ...defaultPostValue, author_id: user.id })
      const post = await postService.createPost({ body: { ...defaultPostValue, isQuoted: true, quoted_post: defaultPost.id } }, user2)
      const quotedPost = await post.getQuotedPost()
      expect(quotedPost.content).toBe(defaultPost.content)
      expect(quotedPost.id).toBe(defaultPost.id)
      const author = await post.getAuthor()
      expect(author.id).toBe(user2.id)
      const stackedChilrenCount = await post.countStackedChildren()
      expect(stackedChilrenCount).toBe(0)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(2)
      const [notificationQuotedPost] = notifications.filter(x => x.type === 'QUOTED_POST')
      expect(notificationQuotedPost).not.toBe(null)
      const [notificationMentionedPost] = notifications.filter(x => x.type === 'MENTIONED')
      expect(notificationMentionedPost).not.toBe(null)
    })

    test('It should create a stacked post when valid parameters are passed', async () => {
      const post = await postService.createPost(
        {
          body: {
            ...defaultPostValue,
            isStacked: true,
            stackedPosts: [{ content: `test 11 @${user2.username}` }, { content: 'test 12' }, { content: 'test 13' }]
          }
        },
        user
      )
      const author = await post.getAuthor()
      expect(author.id).toBe(user.id)
      const stackedChilrenCount = await post.countStackedChildren()
      expect(stackedChilrenCount).toBe(3)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(1)
      const notificationReceipients = await notifications[0].getReceipients()
      expect(notificationReceipients.length).toBe(2)
    })
  })

  describe('Post Vote', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create({ ...defaultPostValue, author_id: user.id })
    })

    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.Vote.destroy({ where: {} })
      await db.Reputation.destroy({ where: {} })
      await db.Notification.destroy({ where: {} })
    })

    test('It should create a vote for a post when valid parameters are passed', async () => {
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'UP' } }, user2)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(1)
      expect(post.votes).toBe(1)
      expect(postVotes[0].Vote.type).toBe('UP')
      const reputationCount = await db.Reputation.count({ PostId: post.id, source: reputationSources.VOTED })
      expect(reputationCount).toBe(1)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(1)
      const notificationReceipients = await notifications[0].getReceipients()
      expect(notificationReceipients.length).toBe(1)
    })

    test('It should delete the vote for a post if it already exists', async () => {
      await db.Vote.create({ postId: defaultPost.id, userId: user.id, type: 'UP' })
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'UP' } }, user)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(0)
      expect(post.votes).toBe(0)
      const reputationCount = await db.Reputation.count({ PostId: post.id, source: reputationSources.VOTED })
      expect(reputationCount).toBe(0)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(0)
    })

    test('It should update the original vote for the post if it has a different vote type and create a new one', async () => {
      await db.Vote.create({ postId: defaultPost.id, userId: user.id, type: 'UP' })
      const post = await postService.votePost({ body: { id: defaultPost.id, type: 'DOWN' } }, user)
      const postVotes = await post.getUserVotes()
      expect(postVotes.length).toBe(1)
      expect(postVotes[0].Vote.type).toBe('DOWN')
      expect(post.votes).toBe(-1)
      const reputationCount = await db.Reputation.count({ PostId: post.id, source: reputationSources.VOTED })
      expect(reputationCount).toBe(1)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(0)
    })
  })

  describe('Post Bookmark', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create({ ...defaultPostValue, author_id: user.id })
    })

    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.PostBookmark.destroy({ where: {} })
      await db.Reputation.destroy({ where: {} })
      await db.Notification.destroy({ where: {} })
    })

    test('It should create a bookmark for a post when valid parameters are passed', async () => {
      const post = await postService.bookmarkPost({ body: { id: defaultPost.id } }, user2)
      const postBookmarks = await post.getUserBookmarks()
      expect(postBookmarks.length).toBe(1)
      const reputationCount = await db.Reputation.count({ PostId: post.id, authorId: user2.id, source: reputationSources.BOOKMARKED })
      expect(reputationCount).toBe(1)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(1)
      const notificationReceipients = await notifications[0].getReceipients()
      expect(notificationReceipients.length).toBe(1)
    })

    test('It should delete the bookmark for a post if it already exists', async () => {
      await db.PostBookmark.create({ userId: user.id, postId: defaultPost.id })
      const post = await postService.bookmarkPost({ body: { id: defaultPost.id } }, user)
      const postBookmarks = await post.getUserBookmarks()
      expect(postBookmarks.length).toBe(0)
      const reputationCount = await db.Reputation.count({ PostId: post.id, authorId: user.id, source: reputationSources.BOOKMARKED })
      expect(reputationCount).toBe(0)
      const notifications = await db.Notification.findAll({})
      expect(notifications.length).toBe(0)
    })
  })

  describe('Delete Post', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create({ ...defaultPostValue, author_id: user.id })
    })

    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.PostBookmark.destroy({ where: {} })
    })

    test('It should delete the post when valid parameters are passed', async () => {
      const response = await postService.deletePost({ body: { id: defaultPost.id } }, user)
      expect(response.status).toBe(204)
      expect(response.message).toBe('Post deleted successfully')
      const dbPostCount = await db.Post.count()
      expect(dbPostCount).toBe(0)
    })
  })

  describe('Edit Post', () => {
    let defaultPost
    beforeEach(async () => {
      defaultPost = await db.Post.create({ ...defaultPostValue, author_id: user.id })
    })

    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.PostBookmark.destroy({ where: {} })
    })

    test('It should edit the post when valid parameters are passed', async () => {
      const newContent = 'New Content'
      const editedPost = await postService.editPost({ body: { id: defaultPost.id, content: newContent } }, user)
      expect(editedPost.content).toBe(newContent)
    })

    test('It should throw and error if the post does not exist', async () => {
      const newContent = 'New Content'
      await postService.editPost({ body: { id: 9999, content: newContent } }, user).catch(e => {
        const parsedError = JSON.parse(e.message)
        expect(parsedError.message).toBe('Post not found')
        expect(parsedError.status).toBe(404)
      })
    })

    test('It should throw an error if the user is not the author of the post', async () => {
      const newContent = 'New Content'
      await postService.editPost({ body: { id: defaultPost.id, content: newContent } }, { id: 'sdasd' }).catch(e => {
        const parsedError = JSON.parse(e.message)
        expect(parsedError.status).toBe(400)
        expect(parsedError.message).toBe('Post can only be edited by the author')
      })
    })
  })
})
