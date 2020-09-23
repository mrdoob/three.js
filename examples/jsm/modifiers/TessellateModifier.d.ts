import {
	Geometry
} from '../../../src/Three';

export class TessellateModifier {

	constructor( maxEdgeLength: number );
	maxEdgeLength: number;

	modify( geometry: Geometry ): void;

}
