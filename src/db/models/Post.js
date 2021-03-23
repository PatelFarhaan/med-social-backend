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
      votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  Post.associate = models => {
    Post.belongsToMany(models.Post, {
      through: models.StackedPost,
      as: 'stackedChildren'
    })

    Post.belongsToMany(models.Post, {
      through: models.StackedPost,
      as: 'post'
    })

    Post.belongsToMany(models.Post, {
      through: models.PostTreePath,
      as: 'ancestor'
    })

    Post.belongsToMany(models.Post, {
      through: models.PostTreePath,
      as: 'descendant'
    })

    Post.hasMany(models.PostTreePath, {
      as: 'rootPost'
    })

    Post.belongsToMany(models.User, {
      through: models.PostBookmark,
      as: 'userBookmarks',
      foreignKey: 'userId'
    })

    Post.belongsTo(models.Post, {
      as: 'quotedPost',
      foreignKey: 'quoted_post'
    })

    Post.belongsTo(models.Post, {
      as: 'parent',
      foreignKey: 'parent_id'
    })

    Post.belongsTo(models.Post, {
      as: 'root',
      foreignKey: 'root_id'
    })

    Post.belongsTo(models.Column, {
      as: 'column'
    })

    Post.belongsTo(models.User, {
      as: 'author',
      foreignKey: 'author_id'
    })

    Post.belongsToMany(models.User, {
      through: models.Vote,
      as: 'userVotes',
      foreignKey: 'userId'
    })
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
