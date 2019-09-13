const storage = require('azure-storage')

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY

module.exports = new class {
  get blob () {
    const blobService = storage.createBlobService(accountName, accountKey)
    return new class {
      container (name) {
        return new Promise ((resolve, reject) => {
          blobService.createContainerIfNotExists(name, {
            publicAccessLevel: 'blob'
          }, function(error, result, response) {
            if (error) {
              reject (error)
            }
            else {
              resolve (response)
            }
          })
        })
      }
    }
  }
}