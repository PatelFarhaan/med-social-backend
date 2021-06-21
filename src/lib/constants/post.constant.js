const postPublicFields = [
  'id',
  'content',
  'isStacked',
  'isComment',
  'isQuoted',
  'isParent',
  'order',
  'votes',
  'comments',
  'createdAt',
  'updatedAt',
  'author_id',
  'ColumnSlug',
  'quoted_post',
  'parentId',
  'hierarchyLevel',
  'order',
  'stackParentId'
]

const maxVotePoints = 50

module.exports = {
  postPublicFields,
  maxVotePoints
}
