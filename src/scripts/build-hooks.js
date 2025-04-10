import { submitToIndexNow } from './submit-to-indexnow.js';

export async function onBuildComplete() {
  console.log('Build completed, submitting URLs to IndexNow...');
  try {
    await submitToIndexNow();
    console.log('Successfully submitted URLs to IndexNow');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Failed to submit URLs to IndexNow:', error.message);
  }
}