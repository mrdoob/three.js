import { Camera } from './../../cameras/Camera';

export class WebGLClipping {

	uniform: { value: any; needsUpdate: boolean };
	numPlanes: number;

	init( planes: any[], enableLocalClipping: boolean, camera: Camera ): boolean;
	beginShadows(): void;
	endShadows(): void;
	setState(
		planes: any[],
		clipShadows: boolean,
		camera: Camera,
		cache: boolean,
		fromCache: boolean
	): void;

}
