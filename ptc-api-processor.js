const QUERY_OBJECT = Symbol();
const QUERY_FIELD = Symbol();
const QUERY_PATH = Symbol();
const SELECTOR_APLIED = Symbol();
const FIELD_OBJECT = Symbol();
const RESPONSE_OBJECT = Symbol();

class QueryObject {
  constructor (obj) {
    this [QUERY_OBJECT] = obj
  }
  get name () {return this [QUERY_FIELD]}
  processQuery (query, index) {
    if (index < query.length) {
      const command = query [index++]
      const object = this [QUERY_OBJECT]
      if (object) {
        if (Array.isArray (command)) { // function call
          if (typeof object === 'function') {
            this [QUERY_OBJECT] = object.apply (null, command)
            return processQuery (result, query, index)
          }
          else {
            return applyFilterAndSelector (result, command, query, index) 
          }
        }
        else { // property
          let idx = Number.parseInt (command)
          if (!Number.isNaN (idx) && Array.isArray (object)) {
            result [QUERY_OBJECT] = object [idx]
            return processQuery (result, query, index)
          }
          if (Array.isArray (object)) {
            result [command] = object.map (item => processProperty (item, command, query, index))
          }
          else {
            result [command] = processProperty (object, command, query, index)
          }
        }
      }
    }
    return this
  }

  toJSON () {
    const obj = this [QUERY_OBJECT]
    if (obj && (typeof obj === 'object')) {
      if (!Array.isArray (obj)) {
        return (!this [SELECTOR_APLIED] && ('toJSON' in obj)) ?
          Object.assign ({}, this, obj.toJSON ()) :
          (Object.getPrototypeOf(obj) === Object.prototype) ? obj : this
      }
    }
    return obj
  }
}

function createQueryObject (obj) {
  return new QueryObject (obj)
}

function applyFilterAndSelector (result, args, query, index) {
  console.log (`applyFilterAndSelector: ${JSON.stringify (args)}`)
  const {filter, selector} = args.reduce ((acc, arg) => {
    if (typeof arg === 'object')
      acc.filter.push (arg)
    else
      acc.selector.push (arg)
    return acc
  }, {filter: [], selector: []})

  function applyFilter (obj) {
    return filter.length === 0 || filter.find (arg => !Object.keys (arg).find (name => obj [name] != arg [name]))
  }
  function applySelector (obj) {
    const object = obj [QUERY_OBJECT]
    selector.forEach (name => {
      obj [name] = object [name]
      obj [SELECTOR_APLIED] = true
    })
  }
  let object = result [QUERY_OBJECT]
  if (selector.length > 0) {
    console.log (`applying selector: ${selector}`)
    if (Array.isArray (object)) {
      object.forEach (applySelector)
    }
    else {
      applySelector (result)
    }
  }
  if (filter.length > 0) {
    if (Array.isArray (object)) {
      result [QUERY_OBJECT] = object.filter (applyFilter)
    }
    else {
      result [QUERY_OBJECT] = applyFilter (object) ? [object] : []
    }
  }
  object = result [QUERY_OBJECT]
  return processQuery (result, args, query, index)
}

function processProperty (object, property, query, index) {
  return Promise.resolve (object [property]).then (property => {
    let value = property
    if (typeof value === 'function') {
      const funcValue = value
      value = function () {return funcValue.apply (object, Array.from (arguments))}
    }
    return processQuery (createQueryObject (value), query, index)
  })
}

function processQuery (result, query, index) {
  if (index < query.length) {
    const command = query [index++]
    const object = result [QUERY_OBJECT]
    if (object) {
      if (Array.isArray (command)) { // function call
        if (typeof object === 'function') {
          return Promise.resolve (object.apply (null, command)).then (res => {
            result [QUERY_OBJECT] = res
            return processQuery (result, query, index)
          })
        }
        else {
          return applyFilterAndSelector (result, command, query, index) 
        }
      }
      else { // property
        if (!Number.isNaN (Number.parseInt (command)) && Array.isArray (object)) {
          result [QUERY_OBJECT] = object [command]
          return processQuery (result, query, index)
        }
        if (Array.isArray (object)) {
          console.log (`array`)
          return Promise.all (object.map (item => processProperty (item, command, query, index))).then (arr => {
            result [command] = arr
            return result
          })
        }
        else {
          return Promise.resolve (processProperty (object, command, query, index)).then (res => {
            result [command] = res
            return result
          })
        }
      }
    }
    else {
      throw 'property does not exist'
    }
  }
  return result
}

const Query = (function () {
  function createQuery (root) {
      const query = [root]
      const proxy = new Proxy (new Function (), {
          get: function (target, prop) {
              if (prop === 'toJSON') {
                  return function () {return query}
              }
              query.push (prop)
              return proxy
          },
          apply: function(target, thisArg, args) {
              query.push (args)
              return proxy
          }
      })
      return proxy
  }
  return new Proxy ({}, {get: (target, prop) => createQuery (prop)})
}) ()

class QueryProcessor {
  constructor (root) {
    this.__root__ = root
  }
  execute (query) {
    return processQuery (createQueryObject (this.__root__), query, 0)
  }
  debug (queryString) {
    return this.execute (eval (`Query.${queryString}`).toJSON())
}
}

module.exports = function (root) {return new QueryProcessor (root)}