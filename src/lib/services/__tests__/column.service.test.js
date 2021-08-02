const db = require('../../../db/models/')
const { columnStatuses, columnTypes } = require('../../constants/column.constant')
const { subscriptionTypes } = require('../../constants/subscription.constant')
const { destroyDefaults } = require('../../../lib/testHelpers/testUtils')
const { createDefaultUser } = require('../../fixtures/user.fixture')
const { createDefaultInterest } = require('../../fixtures/interest.fixture')
const { createDefaultExpertise } = require('../../fixtures/expertise.fixture')
// const { createDefaultColumn } = require('../../fixtures/column.fixture')

const { columnService } = require('../index')

const defaultValue = {
  name: 'Algebra',
  description: 'This is a column about algebra',
  state: columnStatuses.APPROVED,
  type: columnTypes.FREE
}

describe('Column Service', () => {
  let user
  let expertise
  let interest
  let interestTwo
  // let column
  afterAll(async () => {
    await destroyDefaults()
    await db.Interest.destroy({ where: { name: 'InterestTwo ' } })
  })

  beforeAll(async () => {
    ;[user] = await createDefaultUser()
    ;[expertise] = await createDefaultExpertise()
    ;[interest] = await createDefaultInterest()
    ;[interestTwo] = await db.Interest.findOrCreate({ where: { name: 'InterestTwo' } })
    await interest.addExpertise(expertise)
    await interestTwo.addExpertise(expertise)
  })

  describe('Column Unsubscribe', () => {
    let column
    beforeEach(async () => {
      column = await db.Column.create(defaultValue)
      await column.setExpertise(expertise)
      await column.setAuthor(user)
      await column.addInterest(interest)
    })

    afterEach(async () => {
      await db.Column.destroy({ where: { slug: 'algebra' } })
    })

    test('It should unsubscribe to a free column when valid parameters are passed', async () => {
      await db.Subscription.create({
        type: subscriptionTypes.COLUMN,
        email: user.email,
        UserId: user.id,
        ColumnSlug: column.slug
      })
      const response = await columnService.unsubscribeToColumn({ body: { column } }, user)
      expect(response.status).toBe(204)
      expect(response.message).toBe('Subscription successfully deleted')
      const dbSubscriptionsCount = await db.Subscription.count()
      expect(dbSubscriptionsCount).toBe(0)
    })
  })

  describe('Column Multiple Unsubscribe', () => {
    let column
    let column2
    beforeEach(async () => {
      column = await db.Column.create(defaultValue)
      column2 = await db.Column.create({
        name: 'Calculys',
        description: 'This is a column about calculus',
        state: columnStatuses.APPROVED,
        type: columnTypes.FREE
      })
      await column.setExpertise(expertise)
      await column.setAuthor(user)
      await column.addInterest(interest)
      await column2.setExpertise(expertise)
      await column2.setAuthor(user)
      await column2.addInterest(interest)
    })

    afterEach(async () => {
      await db.Column.destroy({ where: { slug: ['algebra', 'calculus'] } })
    })

    test('It should unsubscribe to multiple columns when valid parameters are passed', async () => {
      // First subscription
      await db.Subscription.create({
        type: subscriptionTypes.COLUMN,
        email: user.email,
        UserId: user.id,
        ColumnSlug: column.slug
      })

      // Second subscription
      await db.Subscription.create({
        type: subscriptionTypes.COLUMN,
        email: user.email,
        UserId: user.id,
        ColumnSlug: column2.slug
      })

      const response = await columnService.multiColumnUnsubscribe({ columns: [column, column2] }, user)
      expect(response.status).toBe(204)
      expect(response.message).toBe('Subscription successfully deleted')
      const dbSubscriptionsCount = await db.Subscription.count()
      expect(dbSubscriptionsCount).toBe(0)
    })
  })

  describe('List Columns', () => {
    beforeAll(async () => {
      await db.Subscription.destroy({ where: {} })
      await db.Column.destroy({ where: {} })
    })
    beforeEach(async () => {
      await Promise.all(
        ['calculus', 'physics', 'trigonometry'].map(async (item, index) => {
          const column = await db.Column.create({
            name: item,
            description: item,
            state: columnStatuses.APPROVED,
            type: columnTypes.FREE,
            ExpertiseId: expertise.id
          })
          await column.addInterest(index === 0 ? interest : interestTwo)
          return column
        })
      )
    })
    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.Subscription.destroy({ where: {} })
      await db.Column.destroy({
        where: {
          slug: ['calculus', 'physics', 'trigonometry']
        }
      })
    })

    test('it should only return filtered columns interestTwo if interests is empty', async () => {
      const filteredColumns = await columnService.listColumns({ interests: [interestTwo.id] }, user)
      expect(filteredColumns.count).toBe(2)
      const filteredColumnSlugs = filteredColumns.rows.map(item => item.slug)
      expect(filteredColumnSlugs.includes('physics')).toBe(true)
      expect(filteredColumnSlugs.includes('trigonometry')).toBe(true)
    })

    test('it should return all columns within page = 1 and limit = 10 if no parameters were passed', async () => {
      const filteredColumns = await columnService.listColumns({}, user)
      expect(filteredColumns.count).toBe(3)
      const filteredColumnSlugs = filteredColumns.rows.map(item => item.slug)
      expect(filteredColumnSlugs.includes('calculus')).toBe(true)
      expect(filteredColumnSlugs.includes('physics')).toBe(true)
      expect(filteredColumnSlugs.includes('trigonometry')).toBe(true)
    })
  })

  describe('Get Popular Columns', () => {
    let columns
    beforeAll(async () => {
      await db.Subscription.destroy({ where: {} })
      await db.Column.destroy({ where: {} })
    })
    beforeEach(async () => {
      columns = await Promise.all(
        ['calculus', 'physics', 'trigonometry'].map(async item => {
          const column = await db.Column.create({
            name: item,
            description: item,
            state: columnStatuses.APPROVED,
            type: columnTypes.FREE,
            ExpertiseId: expertise.id
          })
          await column.addInterest(interest)
          return column
        })
      )
    })
    afterEach(async () => {
      await db.Post.destroy({ where: {} })
      await db.Subscription.destroy({ where: {} })
      await db.Column.destroy({
        where: {
          slug: ['calculus', 'physics', 'trigonometry']
        }
      })
    })

    test('it should return in descending order with regards to the number of posts within the columns', async () => {
      await Promise.all([
        await db.Post.create({
          content: 'this is about calculus',
          isQuoted: false,
          isStacked: false,
          ColumnSlug: 'calculus'
        }),
        await db.Post.create({
          content: 'this is about calculus 2',
          isQuoted: false,
          isStacked: false,
          ColumnSlug: 'calculus'
        }),
        await db.Post.create({
          content: 'this is about physics',
          isQuoted: false,
          isStacked: false,
          ColumnSlug: 'physics'
        })
      ])

      const popularColumns = await columnService.getPopularColumns({}, user)
      expect(popularColumns.count).toBe(3)
      expect(popularColumns.rows[0].slug).toBe('calculus')
      expect(popularColumns.rows[1].slug).toBe('physics')
    })

    test('it should not return a column that the user is already subscribed to', async () => {
      await columnService.subscribeToColumn({ body: { column: columns[0] } }, user)
      const popularColumns = await columnService.getPopularColumns({}, user)
      expect(popularColumns.count).toBe(2)
      expect(popularColumns.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'trigonometry'
          })
        ])
      )
      expect(popularColumns.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: 'physics'
          })
        ])
      )
    })
  })
})
