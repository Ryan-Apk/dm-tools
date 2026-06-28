/// This file handles operational specific variable storing inside the db
import mongoose from 'mongoose';

// Direct native collection access that retains Mongoose's operation buffering
const variablesConfig = mongoose.connection.collection('operating_variables');

export async function fetchRuntimeVarFromDB(key) {
  const doc = await variablesConfig.findOne({ name: key });
  return doc ? doc.value : null;
}

export async function saveRuntimeVarToDB(key, val) {
  await variablesConfig.updateOne(
    { name: key },
    { $set: { value: val, updatedAt: new Date() } },
    { upsert: true },
  );
}
