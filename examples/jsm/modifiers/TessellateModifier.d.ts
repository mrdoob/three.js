import {
	Geometry
} from '../../../src/Three';

export class SubdivisionModifier {

	constructor( maxEdgeLength: number );
	maxEdgeLength: number;

	modify( geometry: Geometry ): void;

}
