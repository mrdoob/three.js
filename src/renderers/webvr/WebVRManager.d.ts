import { Object3D } from '../../core/Object3D';
import { PerspectiveCamera } from '../../cameras/PerspectiveCamera';
import { ArrayCamera } from '../../cameras/ArrayCamera';
import { Matrix4 } from '../../math/Matrix4';

export interface WebVRManager {
	enabled: boolean;
	getDevice(): VRDisplay | null;
	setDevice( device: VRDisplay | null ): void;
	setPoseTarget( object: Object3D | null ): void;
	getCamera( camera: PerspectiveCamera ): PerspectiveCamera | ArrayCamera;
	submitFrame(): void;
	dispose(): void;
	getStandingMatrix(): Matrix4;
}
