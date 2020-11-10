import {
	Geometry,
	BufferGeometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength?: number, maxIterations?: number, maxFaces?: number );
	maxEdgeLength: number = 0.1;
	maxIterations: number = 6;
	maxFaces: number = Infinity;

	modify( geometry: Geometry | BufferGeometry ): Geometry | BufferGeometry;

}
