const { default: AdminBro } = require('admin-bro')
const { flat, Filter } = require('admin-bro')
const fs = require('fs')
const fileType = require('file-type')
const { pseudoUserService } = require('../../lib/services')
const { pUserUpload } = require('../../lib/services/upload.service')

const PER_PAGE_LIMIT = 500

const options = {
  editProperties: ['url'],
  listProperties: ['name', 'active', 'posts', 'columns', 'expertises'],
  actions: {
    new: {
      isVisible: true,
      custom: {
        baseUrl: process.env.BASE_URL
      },
      component: AdminBro.bundle('./components/ImportUser/AddUserForm.jsx'),
      handler: async (request, _, context) => {
        const { url } = request.fields
        const { h, resource } = context
        const { file } = request.files
        const _handle = url.substr(url.lastIndexOf('/') + 1, url.length)
        await pseudoUserService.addPseudoUser(_handle)
        const notice = {}
        notice.message = 'Successfully Imported'
        notice.type = 'success'
        if (file) {
          const { path } = file
          const buffer = fs.readFileSync(path)
          const type = await fileType.fromBuffer(buffer)
          const filename = `pseudouser-permissions/${_handle}.${type.ext}`
          const awsResponse = await pUserUpload(filename, file, buffer, 'PUSER')
          if (!awsResponse.success) {
            notice.message = 'Error during import'
            notice.type = 'failure'
          } else {
            await pseudoUserService.updatePermissionFileUrl(_handle, awsResponse.location)
          }
        }
        return {
          record: request.fields.url,
          redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          notice
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
          redirectUrl: `/admin/resources/PseudoPost?filters.username=${params.username}`,
          records: [],
          record: context.record.toJSON(context.currentAdmin)
        }
      },
      component: false
    },
    viewProfile: {
      actionType: 'record',
      isVisible: true,
      custom: {
        baseUrl: process.env.BASE_URL
      },
      handler: async (_, __, context) => ({
        records: [],
        record: context.record.toJSON(context.currentAdmin)
      }),
      component: AdminBro.bundle('./components/Profile/Profile.jsx')
    },
    approve: {
      actionType: 'record',
      isVisible: true,
      handler: async (_, __, context) => {
        const {
          h,
          resource,
          record: { params }
        } = context
        if (!params.active) {
          return {
            redirectUrl: `/admin/resources/PseudoPost?filters.username=${params.username}&approve=true`,
            records: [],
            record: context.record.toJSON(context.currentAdmin)
          }
        }
        return {
          redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          records: [],
          record: context.record.toJSON(context.currentAdmin),
          notice: {
            message: 'Already approved',
            type: 'success'
          }
        }
      },
      component: false
    },
    approveUser: {
      actionType: 'record',
      isVisible: false,
      handler: async (_req, _res, context) => {
        const {
          record: { params },
          h,
          resource,
          currentAdmin
        } = context
        params.expertises = _req.headers.expertises.split(',').map(x => +x)
        params.firstName = params.name.substr(0, params.name.indexOf(' '))
        params.lastName = params.name.substr(params.name.indexOf(' ') + 1)
        if (!params.firstName) {
          params.firstName = params.name
          params.lastName = null
        }
        params.fullName = params.name
        params.profilePicture = params.profileImageUrl.replace('_normal', '')
        params.profileDescription = params.bio
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
      isVisible: false,
      actionType: 'record',
      handler: async (_, __, context) => ({
        record: context.record.toJSON(context.currentAdmin),
        notice: {
          message: 'Successfully Posted',
          type: 'success'
        }
      }),
      component: false
    },
    edit: {
      isVisible: false
    },
    show: {
      isVisible: false,
      actionType: 'record',
      handler: async (_, __, context) => ({
        record: context.record.toJSON(context.currentAdmin),
        notice: {
          message: 'Successfully Posted',
          type: 'success'
        }
      }),
      component: false
    },
    uploadPermissions: {
      isVisible: false,
      custom: {
        baseUrl: process.env.BASE_URL
      },
      component: false,
      handler: async (request, _, context) => {
        const { handle } = request.fields
        const { h, resource } = context
        const { file } = request.files
        const notice = {}
        notice.message = 'Successfully Imported'
        notice.type = 'success'
        if (file) {
          const { path } = file
          const buffer = fs.readFileSync(path)
          const type = await fileType.fromBuffer(buffer)
          const filename = `pseudouser-permissions/${handle}.${type.ext}`
          const awsResponse = await pUserUpload(filename, file, buffer, 'PUSER')
          if (!awsResponse.success) {
            notice.message = 'Error during import'
            notice.type = 'failure'
          } else {
            await pseudoUserService.updatePermissionFileUrl(handle, awsResponse.location)
          }
        }
        return {
          record: request.fields.url,
          redirectUrl: h.resourceUrl({ resourceId: resource._decorated ? resource._decorated.id() : resource.id() }),
          notice
        }
      }
    }
  }
}

module.exports = options
