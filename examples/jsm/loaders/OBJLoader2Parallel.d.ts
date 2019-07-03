import {
  LoadingManager
} from '../../../src/Three';
import { OBJLoader2 } from './OBJLoader2.js';

export class OBJLoader2Parallel extends OBJLoader2 {
  constructor(manager?: LoadingManager);
  preferJsmWorker: boolean;
	executeParallel: boolean;
	workerExecutionSupport: object;

  setPreferJsmWorker(preferJsmWorker: boolean): this;
  setCallbackOnParseComplete(onParseComplete: Function): this;
  setExecuteParallel(executeParallel: boolean): this;
  getWorkerExecutionSupport(): object;
  buildWorkerCode(): object;
}
