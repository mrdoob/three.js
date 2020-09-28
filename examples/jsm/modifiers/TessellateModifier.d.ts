import {
	Geometry,
	BufferGeometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength: number );
	maxEdgeLength: number;

	modify( geometry: Geometry | BufferGeometry ): Geometry | BufferGeometry;

}
