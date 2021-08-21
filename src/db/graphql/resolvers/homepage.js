const { homepageService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('../auth')

module.exports = {
  Query: {
    getHomepage: async () => {
      const homepage = await homepageService.getHomepage()
      return exportSafeModel(homepage)
    }
  },

  Mutation: {
    updateHomepage: can(['admin', 'superadmin']).createResolver(
      async (
        _,
        {
          taglineMain,
          headlineMain,
          tag1,
          tag2,
          tag3,
          tag4,
          tag5,
          tag6,
          headline1,
          content1,
          headline2,
          content2,
          headline3,
          content3,
          headline4,
          content4,
          headline5,
          taglineUnderAsset
        }
      ) =>
        homepageService.updateHomepage(
          taglineMain,
          headlineMain,
          tag1,
          tag2,
          tag3,
          tag4,
          tag5,
          tag6,
          headline1,
          content1,
          headline2,
          content2,
          headline3,
          content3,
          headline4,
          content4,
          headline5,
          taglineUnderAsset
        )
    )
  }
}
