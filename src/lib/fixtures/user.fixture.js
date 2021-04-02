const db = require('../../db/models')

const createDefaultUser = async () => {
  const [standardRole] = await db.Role.findOrCreate({ where: { type: 'standard' } })
  return db.User.findOrCreate({
    where: {
      email: 'testEmail@gmail.com',
      firstName: 'Sam',
      lastName: 'Dev',
      roleId: standardRole.id,
      username: 'sam'
    }
  })
}

const createDefaultUser2 = async () => {
  const [standardRole] = await db.Role.findOrCreate({ where: { type: 'standard' } })
  return db.User.findOrCreate({
    where: {
      email: 'testEmail2@gmail.com',
      firstName: 'Sam2',
      lastName: 'Dev2',
      roleId: standardRole.id,
      username: 'sam2'
    }
  })
}

const deleteDefaultUser = async () => db.User.destroy({ where: { email: ['testEmail@gmail.com', 'testEmail2@gmail.com'] } })

module.exports = {
  createDefaultUser,
  createDefaultUser2,
  deleteDefaultUser
}
