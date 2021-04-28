const sanitizeHtml = require('sanitize-html')
const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      id: types.get('id'),
      content: { type: DataTypes.TEXT, allowNull: false },
      isStacked: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_stacked', defaultValue: false },
      isQuoted: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_quoted', defaultValue: false },
      isComment: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_comment', defaultValue: false },
      isParent: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_parent', defaultValue: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      comments: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true,
      hierarchy: true
    }
  )

  Post.associate = models => {
    Post.belongsToMany(models.Post, {
      through: models.StackedPost,
      as: 'stackedChildren',
      otherKey: 'stackedChildrenId',
      foreignKey: 'PostId'
    })

    Post.belongsToMany(models.Post, {
      through: models.StackedPost,
      as: 'posts',
      otherKey: 'PostId',
      foreignKey: 'stackedChildrenId'
    })

    Post.belongsToMany(models.User, {
      through: models.PostBookmark,
      as: 'userBookmarks',
      foreignKey: 'postId',
      onDelete: 'RESTRICT',
      hooks: true
    })

    Post.belongsTo(models.Post, {
      as: 'quotedPost',
      foreignKey: 'quoted_post'
    })

    Post.belongsTo(models.Column)

    Post.belongsTo(models.User, {
      as: 'author',
      foreignKey: 'author_id'
    })

    Post.belongsToMany(models.User, {
      through: models.Vote,
      as: 'userVotes',
      foreignKey: 'PostId',
      onDelete: 'RESTRICT',
      hooks: true
    })

    Post.hasMany(models.File, { as: 'files' })
  }

  Post.addHook('beforeCreate', instance => {
    instance.content = sanitizeHtml(instance.content)
  })

  Post.addHook('beforeBulkCreate', instances => {
    for (const instance of instances) {
      instance.content = sanitizeHtml(instance.content)
    }
  })

  Post.addHook('beforeSave', instance => {
    instance.content = sanitizeHtml(instance.content)
  })

  Post.addHook('beforeUpdate', instance => {
    instance.content = sanitizeHtml(instance.content)
  })

  // eslint-disable-next-line func-names
  Post.search = function(query) {
    if (sequelize.options.dialect !== 'postgres') {
      throw new Error({ status: 500, message: 'Search is only implemented on POSTGRES database' })
    }

    query = sequelize.getQueryInterface().escape(query)
    console.log(query)

    return sequelize.query(`SELECT * FROM "POST" WHERE "PostText" @@ plainto_tsquery('english', ${query})`, Post)
  }

  return Post
}
