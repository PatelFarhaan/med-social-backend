const { default: AdminBro } = require('admin-bro')
const { flat, Filter } = require('admin-bro')

const PER_PAGE_LIMIT = 500

const options = {
  listProperties: ['username', 'tweet', 'updatedAt'],
  actions: {
    edit: {
      isVisible: false
    },
    show: {
      isVisible: false
    },
    new: {
      isVisible: false
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
      component: AdminBro.bundle('./viewPostsComponent.jsx')
    }
  }
}
module.exports = options
