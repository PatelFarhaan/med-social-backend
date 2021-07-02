const { default: AdminBro } = require('admin-bro')
const { flat, Filter } = require('admin-bro')
const { pseudoUserService } = require('../../lib/services')

const PER_PAGE_LIMIT = 500

const options = {
  editProperties: ['url'],
  listProperties: ['name', 'active', 'posts', 'columns', 'expertises'],
  actions: {
    new: {
      isVisible: true,
      handler: async (request, _, context) => {
        const { url } = request.fields
        const { h, resource } = context
        await pseudoUserService.addPseudoUser(url)
        return {
          record: request.fields.url,
          redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          notice: {
            message: 'Successfully Imported',
            type: 'success'
          }
        }
      }
    },
    list: {
      isVisible: true,
      handler: async (request, _, context) => {
        const { query } = request
        const { filters = {} } = flat.unflatten(query || {})
        const { resource } = context
        let { page, perPage } = flat.unflatten(query || {})

        if (perPage) {
          perPage = +perPage > PER_PAGE_LIMIT ? PER_PAGE_LIMIT : +perPage
        } else {
          perPage = 10 // default
        }
        page = Number(page) || 1
        const sort = { direction: 'asc', sortBy: 'id' }
        const filter = await new Filter(filters, resource).populate()
        const records = await resource.find(filter, {
          limit: perPage,
          offset: (page - 1) * perPage,
          sort
        })

        const _recordsPromises = records.map(record => pseudoUserService.fetchPostCountByUserName(record, record.params.username))

        await Promise.all(_recordsPromises)

        context.records = records

        const total = await resource.count(filter)
        return {
          meta: {
            total,
            perPage,
            page,
            direction: sort.direction,
            sortBy: sort.sortBy
          },
          records: records.map(r => r.toJSON(context.currentAdmin))
        }
      },
      component: AdminBro.bundle('./listPuserComponent.jsx')
    },
    viewPosts: {
      actionType: 'record',
      isVisible: true,
      handler: async (_, __, context) => {
        const {
          record: { params }
        } = context

        return {
          redirectUrl: `PseudoPost?filters.username=${params.username}`,
          records: [],
          record: context.record.toJSON(context.currentAdmin)
        }
      },
      component: false
    },
    show: {
      actionType: 'record',
      isVisible: true,
      handler: async (_, __, context) => ({
        records: [],
        record: context.record.toJSON(context.currentAdmin)
      }),
      component: AdminBro.bundle('./listPpostComponent.jsx')
    },
    approveUser: {
      actionType: 'record',
      handler: async (_req, _res, context) => {
        const {
          record: { params },
          h,
          resource,
          currentAdmin
        } = context

        // Need to delete this as it violates insert query for User table.
        // This should be fixed at service level inside approveUser
        delete params.id
        await pseudoUserService.approveUser(params.username, params)
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
    },
    getUser: {
      isVisible: true,
      actionType: 'record',
      handler: async (_, __, context) => ({
        record: context.record.toJSON(context.currentAdmin),
        notice: {
          message: 'Successfully Posted',
          type: 'success'
        }
      }),
      component: false
    }
  }
}

module.exports = options
