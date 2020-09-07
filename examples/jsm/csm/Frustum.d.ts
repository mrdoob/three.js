export default class Frustum {

	constructor( data: any );
	vertices: {
		near: any[];
		far: any[];
	};
	setFromProjectionMatrix( projectionMatrix: any, maxFar: any ): {
		near: any[];
		far: any[];
	};
	split( breaks: any, target: any ): void;
	toSpace( cameraMatrix: any, target: any ): void;

}
