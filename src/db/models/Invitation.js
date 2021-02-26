const { v4: uuidv4 } = require('uuid')
const base64url = require('base64url')

const types = require('../types')

const { states, subscriptionModels, invitationTypes } = require('../../lib/constants/invitation.constant')

module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define(
    'Invitation',
    {
      id: types.get('id'),
      token: { type: DataTypes.STRING, allowNull: true, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, validate: { min: 3 } },
      firstName: { type: DataTypes.STRING(50), field: 'first_name' },
      lastName: { type: DataTypes.STRING(50), field: 'last_name' },
      isPrivate: { type: DataTypes.BOOLEAN, field: 'is_private', defaultValue: false },
      expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
      special: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      state: { type: DataTypes.ENUM(Object.values(states)), defaultValue: states.PENDING },
      subscriptionModel: {
        type: DataTypes.ENUM(Object.values(subscriptionModels)),
        field: 'subscription_model',
        defaultValue: subscriptionModels.FREE
      },
      type: { type: DataTypes.ENUM(Object.values(invitationTypes)), defaultValue: invitationTypes.REGULAR },
      reason: { type: DataTypes.STRING(50), allowNull: true },
      note: { type: DataTypes.STRING(134), allowNull: true },
      samplePosts: { type: DataTypes.JSONB, field: 'sample_posts', allowNull: true },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  // eslint-disable-next-line func-names
  Invitation.prototype.approve = async function(_approvedBy, newExpiresAt) {
    if (newExpiresAt) {
      this.expiresAt = newExpiresAt
    }
    if (this.state === states.PENDING) {
      this.state = states.APPROVED
      this.token = base64url(uuidv4())
      // TODO: Add approved by when you add the authentication
      // Model.approvedBy = approvedBy
      this.save()
      // TODO: Send invitation
    }
    return this
  }

  Invitation.associate = models => {
    // TODO: Add this when column is available
    // Invitation.belongsTo(models.Column, {
    //   as: 'column'
    // })

    Invitation.belongsTo(models.User, {
      as: 'createdBy',
      foreignKey: 'created_by'
    })

    Invitation.belongsTo(models.User, {
      as: 'approvedBy',
      foreignKey: 'approved_by'
    })

    Invitation.belongsToMany(models.Expertise, {
      through: 'InvitationExpertises',
      as: 'expertises'
    })
  }

  return Invitation
}
