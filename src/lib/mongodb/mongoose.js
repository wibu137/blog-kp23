// import mongoose from 'mongoose';

// let initialized = false;

// export const connect = async () => {
//   mongoose.set('strictQuery', true);
//   if (initialized) {
//     console.log('Already connected to MongoDB');
//     return;
//   }
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       dbName: 'next-blog',
      
//     });
//     console.log('Connected to MongoDB');
//     initialized = true;
//   } catch (error) {
//     console.log('Error connecting to MongoDB:', error);
//   }
// };
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'next-blog',
      bufferCommands: false, // 🔥 QUAN TRỌNG
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};