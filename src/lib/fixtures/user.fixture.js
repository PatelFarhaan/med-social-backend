const db = require('../../db/models')

const createDefaultUser = async () => {
  const [standardRole] = await db.Role.findOrCreate({ where: { type: 'standard' } })
  return db.User.findOrCreate({
    where: {
      email: 'testEmail@gmail.com',
      firstName: 'Sam',
      lastName: 'Dev',
      roleId: standardRole.id
    }
  })
}

const deleteDefaultUser = async () => db.User.destroy({ email: 'testEmail@gmail.com ' })

module.exports = {
  createDefaultUser,
  deleteDefaultUser
}
