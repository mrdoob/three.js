import {
	Object3D,
	Mesh,
	Texture
} from '../../../src/Three';

export class MD2Character {

	constructor();
	scale: number;
	animationFPS: number;
	root: Object3D;
	meshBody: Mesh | null;
	meshWeapon: Mesh | null;
	skinsBody: Texture[];
	skinsWeapon: Texture[];

	setPlaybackRate( rate: number ): void;
	setWireframe( wireframeEnabled: boolean ): void;
	setSkin( index: number ): void;
	setWeapon( index: number ): void;
	setAnimation( clipName: string ): void;
	syncWeaponAnimation(): void;
	update( delta: number ): void;

}
