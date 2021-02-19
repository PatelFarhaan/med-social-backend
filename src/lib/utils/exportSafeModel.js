const exportSafeModel = model => {
  if (!model) return model
  const object = model.toJSON ? model.toJSON() : model
  delete object.hash
  return object
}

module.exports = {
  exportSafeModel
}
