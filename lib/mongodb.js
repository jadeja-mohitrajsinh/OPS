import mongoose from 'mongoose';

const SOURCE_MONGODB_URI = process.env.MONGODB_URI;

if (!SOURCE_MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Atlas SRV DNS is refused on this Windows network. Keep the secret in the normal
// MONGODB_URI variable, but use the cluster's direct replica hosts at runtime.
function toDirectAtlasUri(uri) {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@[^/]+(\/[^?]*)?(?:\?.*)?$/);
  if (!match) return uri;

  const credentials = match[1];
  const databasePath = match[2] || '/';
  const hosts = [
    'ac-zl7maal-shard-00-00.nwvcndr.mongodb.net:27017',
    'ac-zl7maal-shard-00-01.nwvcndr.mongodb.net:27017',
    'ac-zl7maal-shard-00-02.nwvcndr.mongodb.net:27017',
  ].join(',');

  return `mongodb://${credentials}@${hosts}${databasePath}?tls=true&authSource=admin&replicaSet=atlas-4n95ms-shard-0&retryWrites=true&w=majority`;
}

const MONGODB_URI = toDirectAtlasUri(SOURCE_MONGODB_URI);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
