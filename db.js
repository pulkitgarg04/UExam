// Database connection
// const dbURL = "";

// main()
//   .then(() => {
//     console.log("mongodb connection sucessfull");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(dbURL);
// }
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
async function connectToDB() {
  try {
    const database = client.db('uexam');
    const movies = database.collection('user');
  } finally {
    await client.close();
  }
}
run().catch(console.dir);