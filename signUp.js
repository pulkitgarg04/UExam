const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db('uexam');
    const movies = database.collection('user');

    console.log(movie);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
const personName = document.getElementById('name')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')


const handleSignUp = () => {
    if(!personName && !username && !email && !password) return;

}