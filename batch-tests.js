var batch = require ('azure-batch');

var accountName = process.env.AZURE_BATCH_ACCOUNT_NAME
var accountKey = process.env.AZURE_BATCH_ACCOUNT_KEY
var accountUrl = process.env.AZURE_BATCH_ACCOUNT_URL


module.exports = new class {
  get client () {
    const credentials = new batch.SharedKeyCredentials (accountName,accountKey)
    return new batch.ServiceClient(credentials,accountUrl)
  }
  get pool () {
    const poolid = 'first-pool'
    const client = this.client
    return new Promise ((resolve, reject) => {
      client.pool.get(poolid,function(error,result,request,response) {
        if (error) {
          reject (error)
        }
        else {
          resolve (result)
        }
      })
    })
  }
}