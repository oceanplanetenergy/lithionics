const _ = require('lodash/fp')
const { divideBy, replaceField, setWith } = require('cape-lodash')
const yaml = require('js-yaml')
const fs   = require('fs').promises

const map = _.map.convert({ cap: false })
// Get document, or throw exception on error
const docPath = 'pgn.yaml'

const getFile = () => fs.readFile(docPath, { encoding: 'utf8' })
  .then(yaml.safeLoad)

const pgnDefault = {
  complete: false,
  length: 8, // bytes
  repeatingFields: 0,
}
const fieldDefaults = {
  bitLength: 8,
  signed: false
}
const makeId = _.flow(_.get('name'), _.camelCase)
const fixField = (field, index) => _.flow(
  _.set('order', index + 1),
  _.defaults(fieldDefaults),
  ensureField('id', makeId),
)(field)
const fixFields = map(fixField)
const countBits = _.flow(
  _.map('bitLength'),
  _.sum
)
const fixPgn = _.flow(
  _.defaults(pgnDefault),
  replaceField('fields', fixFields),
  setWith('bits', 'fields', countBits),
  setWith('bytes', 'bits', divideBy(8)),
)
const fixPgns = _.map(fixPgn)
getFile()
  .then(fixPgns)
  .then(res => console.log(res))
