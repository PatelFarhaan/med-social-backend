// const { Op, QueryTypes } = require('sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')

const getHomepage = async () => db.Homepage.findOne({ where: { id: 1 } })

const updateHomepage = async (
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
) => {
  let homepage = await db.Homepage.findOne({ where: { id: 1 } })
  try {
    if (homepage) {
      // update
      if (taglineMain) {
        homepage.taglineMain = taglineMain
      }
      if (headlineMain) {
        homepage.headlineMain = headlineMain
      }
      if (tag1) {
        homepage.tag1 = tag1
      }
      if (tag2) {
        homepage.tag2 = tag2
      }
      if (tag3) {
        homepage.tag3 = tag3
      }
      if (tag4) {
        homepage.tag4 = tag4
      }
      if (tag5) {
        homepage.tag5 = tag5
      }
      if (tag6) {
        homepage.tag6 = tag6
      }
      if (headline1) {
        homepage.headline1 = headline1
      }
      if (content1) {
        homepage.content1 = content1
      }
      if (headline2) {
        homepage.headline2 = headline2
      }
      if (content2) {
        homepage.content2 = content2
      }
      if (headline3) {
        homepage.headline3 = headline3
      }
      if (content3) {
        homepage.content3 = content3
      }
      if (headline4) {
        homepage.headline4 = headline4
      }
      if (content4) {
        homepage.content4 = content4
      }
      if (headline5) {
        homepage.headline5 = headline5
      }
      if (taglineUnderAsset) {
        homepage.taglineUnderAsset = taglineUnderAsset
      }

      await homepage.save()
    } else {
      homepage = await db.Homepage.create({
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
      })
    }
  } catch (e) {
    logger.warn(`updateHomepage: ${e}`)
  }
  return homepage
}

module.exports = {
  getHomepage,
  updateHomepage
}
