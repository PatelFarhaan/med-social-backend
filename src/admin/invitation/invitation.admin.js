// const AdminBro = require('admin-bro')
const { invitationService } = require('../../lib/services')

const options = {
  properties: {
    samplePosts: {
      // type: 'mixed',
      isArray: true
    }
  },
  actions: {
    approveInvitation: {
      actionType: 'record',
      handler: async (_req, _res, context) => {
        const {
          record: { params },
          h,
          resource,
          currentAdmin
        } = context
        await invitationService.approveInvitation(params.email)
        return {
          record: context.record.toJSON(currentAdmin),
          redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          notice: {
            message: 'Successfully approved',
            type: 'success'
          }
        }
      },
      component: false
      // component: AdminBro.bundle('./invitation.component.jsx')
    },
    bulkApproveInvitation: {
      actionType: 'bulk',
      handler: async (_req, _res, context) => {
        const { currentAdmin } = context
        context.records.forEach(async record => {
          const { params } = record
          await invitationService.approveInvitation(params.email)
        })
        return {
          records: context.records.map(x => x.toJSON(currentAdmin)),
          // redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          notice: {
            message: 'Successfully approved',
            type: 'success'
          }
        }
      },
      component: false
    }
  }
}

module.exports = options
