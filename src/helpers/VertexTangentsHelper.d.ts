import { Object3D } from './../core/Object3D';
import { LineSegments } from './../objects/LineSegments';

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
