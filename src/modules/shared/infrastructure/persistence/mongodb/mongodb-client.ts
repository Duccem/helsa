import { MongoClient } from 'mongodb';

export const mongodbClient = new MongoClient(process.env.MONGO_URI);
