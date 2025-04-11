import { MongoClient } from "mongodb"

// Check if MongoDB URI is available
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/musicapp"

// Global variable to store the MongoDB client
let client: MongoClient
let clientPromise: Promise<MongoClient>

// Options for MongoDB client
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

try {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
} catch (error) {
  console.error("MongoDB connection setup error:", error)
  // Create a fake promise that rejects with the error
  clientPromise = Promise.reject(error)
}

export default clientPromise
