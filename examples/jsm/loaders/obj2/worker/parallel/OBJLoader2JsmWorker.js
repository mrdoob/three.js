/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { OBJLoader2Parser } from '../../OBJLoader2Parser.js';

import {
	WorkerRunner,
	DefaultWorkerPayloadHandler
} from './WorkerRunner.js';

new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );
