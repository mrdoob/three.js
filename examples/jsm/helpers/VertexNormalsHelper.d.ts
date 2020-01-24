import {
	Object3D,
	LineSegments
} from '../../../src/Three';

export class VertexNormalsHelper extends LineSegments {

	constructor(
		object: Object3D,
		size?: number,
		hex?: number,
		linewidth?: number
	);

	object: Object3D;
	size: number;

	update(): void;

}
