const { teardownDb } = require('../../../lib/testHelpers/testUtils')
const db = require('../')

const defaultUser = { email: 'info@me.com', username: 'info' }

beforeAll(async () => {
  const defaultUserRole = await db.Role.findOne({ where: { type: 'standard' } })
  defaultUser.roleId = defaultUserRole.id
})

afterAll(async () => {
  await teardownDb()
})

describe('User', () => {
  test('It should be able to CRUD a user', async () => {
    await db.User.create(defaultUser)
    const user = await db.User.findOne({ where: { email: 'info@me.com' } })
    expect(user.email).toBe('info@me.com')
    expect(user.createdAt > 1)
    await user.destroy()
  })

  test('It should be able to update an existing user', async () => {
    const user = await db.User.create(defaultUser)
    const [affectedRows] = await db.User.update(
      {
        email: 'notnew'
      },
      {
        where: { id: user.id }
      }
    )
    const retrievedUser = await db.User.findOne({ where: { email: 'info@me.com' } })
    const updatedUser = await db.User.findOne({ where: { email: 'notnew' } })
    expect(affectedRows).toBe(1)
    expect(retrievedUser).toBe(null)
    expect(!!updatedUser.email).toBe(true)
    await updatedUser.destroy()
  })

  test('It should be able to delete an existing user', async () => {
    const user = await db.User.create(defaultUser)
    await user.destroy()
    expect(await db.User.count({ where: { email: 'info@me.com' } })).toBe(0)
  })

  test('It should be able to search users by username', async () => {
    const user = await db.User.create({ email: 'new@me.com', username: 'new', roleId: 3 })
    const queryByUsername = await db.User.search('new')
    expect(queryByUsername[0][0].username).toBe(user.username)
    await user.destroy()
  })
})
