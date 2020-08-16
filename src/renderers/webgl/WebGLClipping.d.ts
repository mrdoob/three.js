import { Camera } from './../../cameras/Camera';

export class WebGLClipping {

	uniform: { value: any; needsUpdate: boolean };

	/**
	 * @default 0
	 */
	numPlanes: number;

	/**
	 * @default 0
	 */
	numIntersection: number;

	init( planes: any[], enableLocalClipping: boolean, camera: Camera ): boolean;
	beginShadows(): void;
	endShadows(): void;
	setState(
		planes: any[],
		clipIntersection: boolean,
		clipShadows: boolean,
		camera: Camera,
		cache: any,
		fromCache: boolean
	): void;

}
