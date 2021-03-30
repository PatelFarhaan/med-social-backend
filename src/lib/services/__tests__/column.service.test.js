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
  // let column
  afterAll(async () => {
    await destroyDefaults()
  })

  beforeAll(async () => {
    ;[user] = await createDefaultUser()
    ;[expertise] = await createDefaultExpertise()
    ;[interest] = await createDefaultInterest()
    await interest.addExpertise(expertise)
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
        userId: user.id,
        ColumnSlug: column.slug
      })
      const response = await columnService.unsubscribeToColumn({ body: { column } }, user)
      expect(response.status).toBe(204)
      expect(response.message).toBe('Subscription successfully deleted')
      const dbSubscriptionsCount = await db.Subscription.count()
      expect(dbSubscriptionsCount).toBe(0)
    })
  })
})
