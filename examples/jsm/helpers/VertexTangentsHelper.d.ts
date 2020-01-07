import {
	Object3D,
	LineSegments
} from '../../../src/Three';

export class VertexTangentsHelper extends LineSegments {

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
