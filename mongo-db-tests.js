const MongoClient = require("mongodb").MongoClient

class MongoDB {
    get connection () {
        return MongoClient.connect(process.env.MONGO_DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true})
    }
    test () {
        return this.connection.then (client => {
            console.log (`Client opened`)
            //return (`Client opened`)
            return client.db ("mydb").createCollection("customers")
                .then (coll => {
                    console.log (`Collection created`)
                    return coll.insertOne({ name: "Company Inc", address: "Highway 37" })
                        .then (() => {
                            console.log("1 document inserted");
                            return coll.find().toArray ()
                        }).then (result => {
                            let idx = 0
                            result.forEach (record=>record.idx = idx++)
                            console.log(`records: ${JSON.stringify (result, null, 2)}`);
                            return result
                        })
                })
        })
    }
    toJSON () {
        return {}
    }
}

module.exports = new MongoDB ()