/**
 * @author Kai Salmen / www.kaisalmen.de
 */

import { OBJLoader2Parser } from "../OBJLoader2Parser.js";
import {
	WorkerRunner,
	DefaultWorkerPayloadHandler
} from "../WorkerRunner.js";

new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );
