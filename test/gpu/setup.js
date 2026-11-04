import { afterAll } from 'vitest';
import { disposeSharedRenderers } from '../unit/src/nodes/tsl/gpu-test-utils.js';

// Setup files run for every file, even when module imports are cached.
afterAll( disposeSharedRenderers );
