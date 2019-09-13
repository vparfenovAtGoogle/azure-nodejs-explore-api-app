const os = require ('os')

const queryProcessor = require ('./ptc-api-processor')
const mongodbTests = require ('./mongo-db-tests')
const batchTests = require ('./batch-tests')
const storageTests = require ('./storage-tests')

module.exports = new class {
    constructor () {
        this.processor = queryProcessor (this)
    }
    get mongo () {
        return mongodbTests
    }
    get batch () {
        return batchTests
    }
    get storage () {
        return storageTests
    }
    executeQueryString (queryString) {
        return this.processor.debug (queryString [0])
    }
    executeQuery (query) {
        return this.processor.execute (query)
    }
    get env () {return Object.assign ({}, process.env)}
    get os () {
        return {
          hostname: os.hostname(),
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime(),
          loadavg: os.loadavg(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          cpus: os.cpus(),
          networkInterfaces: os.networkInterfaces()
        }
    }
    toJSON () {
        return {}
    }
} ()