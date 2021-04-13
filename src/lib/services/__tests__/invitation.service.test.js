const db = require('../../../db/models/')
const { destroyDefaults } = require('../../testHelpers/testUtils')
const { invitationService } = require('../index')

let InvitationData = {
  firstName: 'Moughees',
  lastName: 'Ahmed',
  email: 'test@test.com',
  expertise: 'LOL',
  type: 'FELLOW'
}

describe('Invitation Service', () => {
  beforeAll(async () => {
    await db.Invitation.destroy({ where: { email: InvitationData.email } })
  })
  afterAll(async () => {
    await db.Invitation.destroy({ where: { email: InvitationData.email } })
    await destroyDefaults()
  })
  beforeEach(async () => {
    await db.Invitation.destroy({ where: { email: 'test@test.com' } })
    await db.Invitation.destroy({ where: { email: 'test2@test.com' } })
    InvitationData = {
      firstName: 'Moughees',
      lastName: 'Ahmed',
      email: 'test@test.com',
      expertise: 'LOL',
      type: 'FELLOW'
    }
  })

  test('Create an invitation', async () => {
    const invite = await invitationService.createInvitation(InvitationData)
    expect(invite.email).toMatch(InvitationData.email)
    await db.Invitation.destroy({ where: { email: InvitationData.email } })
  })

  test('Invitation already exists!', async () => {
    InvitationData.email = 'test2@test.com'
    await invitationService.createInvitation(InvitationData)
    await invitationService.createInvitation(InvitationData).catch(e => {
      expect(e.message).toMatch('Invitation already exists')
    })
  })

  test('Invitation without email', async () => {
    delete InvitationData.email
    await invitationService.createInvitation(InvitationData).catch(e => {
      expect(e.Error).not.toBeNull()
    })
  })
  test('No Expertise', async () => {
    delete InvitationData.expertise
    await invitationService.createInvitation(InvitationData).catch(e => {
      expect(e).toBeNull()
      // needs to change
    })
  })
})
