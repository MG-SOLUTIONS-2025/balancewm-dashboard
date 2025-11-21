import mongoose from 'mongoose';

// Get the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Declare a global type for TypeScript to recognize our cache object
// This prevents TypeScript errors when accessing global.mongooseCache
declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;        // Stores the actual connection 
        promise: Promise<typeof mongoose> | null;  // Stores the connection promise
    }
}

// Reference the global cache object
// In Next.js, this persists across hot reloads in development
let cached = global.mongooseCache;

// Initialize the cache if it doesn't exist yet
// This runs once when the module is first imported
if(!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    // Validate that the MongoDB URI exists in environment variables
    // Throw an error early if it's missing to prevent silent failures
    if(!MONGODB_URI) throw new Error('MONGODB_URI must be set within .env');

    // If we already have an active connection, return it immediately
    // This prevents creating duplicate connections on subsequent calls
    if(cached.conn) return cached.conn;

    // If no connection promise exists, create one
    // mongoose.connect() returns a Promise that resolves to the mongoose instance
    if(!cached.promise) {
        // bufferCommands: false tells Mongoose to fail fast if not connected
        // rather than buffering operations and waiting for connection
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
    }

    // Try to establish the connection by awaiting the promise
    try {
        // Await the promise and store the resolved connection
        // This only happens once - subsequent calls use the cached connection
        cached.conn = await cached.promise;
    } catch (err) {
        // If connection fails, reset the promise so we can retry
        // Without this, a failed connection would prevent future retry attempts
        cached.promise = null;
        throw err;  // Re-throw the error for the caller to handle
    }

    // Log successful connection for debugging
    console.log(`Connected to database ${process.env.NODE_ENV} - ${MONGODB_URI}`)

    return cached.conn;
}
