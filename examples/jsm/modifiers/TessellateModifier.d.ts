import {
	BufferGeometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength?: number, maxIterations?: number );
	maxEdgeLength: number;
	maxIterations: number;

	modify( geometry: BufferGeometry ): BufferGeometry;

}
