import { Camera } from './../cameras/Camera';
import { LineSegments } from './../objects/LineSegments';

export class CameraHelper extends LineSegments {

	constructor( camera: Camera );

	camera: Camera;
	pointMap: { [id: string]: number[] };

	update(): void;

}
