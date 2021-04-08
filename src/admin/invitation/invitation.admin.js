// const AdminBro = require('admin-bro')
const { invitationService } = require('../../lib/services')

const options = {
  properties: {
    fellow: {
      type: 'mixed'
    },
    'fellow.title': {
      type: 'string'
    },
    'fellow.organization': {
      type: 'string'
    },
    'fellow.bio': {
      type: 'string'
    },
    'fellow.applyForColumn': {
      type: 'boolean'
    },
    'fellow.socialLinks': {
      type: 'mixed'
    },
    'fellow.socialLinks.twitter': {
      type: 'string'
    },
    'fellow.socialLinks.linkedin': {
      type: 'string'
    },
    'fellow.socialLinks.website': {
      type: 'string'
    },
    'fellow.socialLinks.additionalLink': {
      type: 'string'
    },
    'fellow.samplePosts': {
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
        await invitationService.approveInvitation(params.email, context.currentAdmin)
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
          await invitationService.approveInvitation(params.email, currentAdmin)
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
