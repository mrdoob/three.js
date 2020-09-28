import {
	Geometry,
	BufferGeometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength: number = 0.1, maxIterations: number = 6, maxFaces: number = 100000 );
	maxEdgeLength: number;
	maxIterations: number;
	maxFaces: number;

	modify( geometry: Geometry | BufferGeometry ): Geometry | BufferGeometry;

}
