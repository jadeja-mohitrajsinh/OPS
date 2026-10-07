const LEGACY_TASK_INDEX = 'userId_1_googleTaskId_1';

let retirementPromise;

// The old Google Tasks unique index also indexed null values, blocking local tasks.
// Retire it once per server runtime; a missing collection/index is already clean.
export default function retireLegacyTaskIndex(Task) {
  if (!retirementPromise) {
    retirementPromise = Task.collection.dropIndex(LEGACY_TASK_INDEX)
      .catch((error) => {
        if (error?.code !== 26 && error?.code !== 27 && error?.codeName !== 'IndexNotFound') throw error;
      });
  }
  return retirementPromise;
}
