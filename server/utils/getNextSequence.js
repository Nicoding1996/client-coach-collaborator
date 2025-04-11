import Counter from '../models/Counter.js';

/**
 * Atomically increments a counter sequence in the database and returns the new value.
 * @param {string} sequenceName The name of the sequence (e.g., 'invoiceNumber').
 * @returns {Promise<number>} The next sequence value.
 */
async function getNextSequenceValue(sequenceName) {
  try {
    const sequenceDocument = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true } // Ensure default is set on upsert
    );
    if (!sequenceDocument) {
        // This should ideally not happen with upsert: true, but handle defensively
        throw new Error(`Could not find or create sequence document for ${sequenceName}`);
    }
    return sequenceDocument.seq;
  } catch (error) {
      console.error(`Error getting next sequence value for ${sequenceName}:`, error);
      // Depending on requirements, you might want to re-throw or handle differently
      throw new Error(`Failed to generate sequence number for ${sequenceName}`);
  }
}

export default getNextSequenceValue;