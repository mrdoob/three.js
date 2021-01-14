import {
	BufferGeometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength?: number, maxIterations?: number );
	maxEdgeLength: number = 0.1;
	maxIterations: number = 6;

	modify( geometry: BufferGeometry ): BufferGeometry;

}
