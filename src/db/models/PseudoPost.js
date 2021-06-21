const sanitizeHtml = require('sanitize-html')

module.exports = (sequelize, DataTypes) => {
  const PseudoPost = sequelize.define(
    'PseudoPost',
    {
      id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
      conversationId: { type: DataTypes.STRING(255), field: 'conversation_id' },
      createdAt: { type: DataTypes.STRING(255), field: 'created_at' },
      date: { type: DataTypes.STRING(255) },
      time: { type: DataTypes.STRING(255) },
      timezone: { type: DataTypes.STRING(255) },
      userId: { type: DataTypes.STRING(255), field: 'user_id' },
      username: { type: DataTypes.STRING(255) },
      place: { type: DataTypes.STRING(255) },
      tweet: { type: DataTypes.TEXT, allowNull: false },
      language: { type: DataTypes.STRING(255) },
      mentions: { type: sequelize.DataTypes.JSONB },
      urls: { type: DataTypes.ARRAY(DataTypes.STRING) },
      photos: { type: DataTypes.ARRAY(DataTypes.STRING) },
      repliesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'replies_count' },
      retweetsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'retweets_count' },
      likesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'likes_count' },
      hashtags: { type: DataTypes.ARRAY(DataTypes.STRING) },
      cashtags: { type: DataTypes.ARRAY(DataTypes.STRING) },
      link: { type: DataTypes.TEXT, allowNull: false },
      retweet: { type: DataTypes.BOOLEAN, allowNull: false },
      quoteUrl: { type: DataTypes.TEXT, field: 'quote_url' },
      video: { type: DataTypes.INTEGER, allowNull: false },
      thumbnail: { type: DataTypes.TEXT },
      near: { type: DataTypes.TEXT },
      geo: { type: DataTypes.TEXT },
      source: { type: DataTypes.TEXT },
      userRtId: { type: DataTypes.STRING(255), field: 'user_rt_id' },
      userRt: { type: DataTypes.TEXT, field: 'user_rt' },
      retweetId: { type: DataTypes.STRING(255), field: 'retweet_id' },
      reply_to: { type: sequelize.DataTypes.JSONB },
      retweetDate: { type: DataTypes.TEXT, field: 'retweet_date' },
      translate: { type: DataTypes.TEXT },
      transSrc: { type: DataTypes.TEXT, field: 'trans_src' },
      transDest: { type: DataTypes.TEXT, field: 'trans_dest' }
    },
    {
      freezeTableName: true
    }
  )

  PseudoPost.addHook('beforeCreate', instance => {
    instance.tweet = sanitizeHtml(instance.tweet)
  })

  PseudoPost.addHook('beforeBulkCreate', instances => {
    for (const instance of instances) {
      instance.tweet = sanitizeHtml(instance.tweet)
    }
  })

  PseudoPost.addHook('beforeSave', instance => {
    instance.tweet = sanitizeHtml(instance.tweet)
  })

  PseudoPost.addHook('beforeUpdate', instance => {
    instance.tweet = sanitizeHtml(instance.tweet)
  })

  return PseudoPost
}
