// Resolvers: A map of functions which return data for the schema.
const { invitationService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const logger = require('../../../lib/utils/logger')
// const { can } = require('./../auth')

module.exports = {
  Query: {
    getInvitation: async (_parent, { token }, { EXPECTED_OPTIONS_KEY, context }) => {
      const invitation = await invitationService.getInvitation({ token }, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(invitation)
    },
    getInvitations: async (_parent, args, { EXPECTED_OPTIONS_KEY, context }) => {
      const rawInvitations = await invitationService.getInvitations(args, { [EXPECTED_OPTIONS_KEY]: context })
      const invitations = rawInvitations.rows.map(invitation => exportSafeModel(invitation))
      return {
        list: invitations,
        count: invitations.length
      }
    }
  },
  Mutation: {
    requestInvitation: async (_parent, body) => {
      logger.info(body.type)
      const invitation = await invitationService.createInvitation(body)
      return exportSafeModel(invitation)
    },
    approveInvitation: async (_parent, { email }, { _req }) => {
      const invitation = await invitationService.approveInvitation(email)
      return exportSafeModel(invitation)
    },
    payForApproval: async (_parent, body) => {
      const invitation = await invitationService.payForApproval(body)
      return invitation
    }
  },
  Invitation: {
    expertises: (invitation, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const inv = db.Invitation.build(exportSafeModel(invitation))
      return inv.getExpertises({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
