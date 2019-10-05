import {
	Object3D,
	Mesh,
	Texture,
	AnimationMixer
} from '../../../src/Three';

export interface MD2PartsConfig {
	baseUrl: string,
	body: string,
	skins: string[],
	weapons: [string, string][],
}

export class MD2Character {

	constructor();
	scale: number;
	animationFPS: number;
	root: Object3D;
	meshBody: Mesh | null;
	meshWeapon: Mesh | null;
	skinsBody: Texture[];
	skinsWeapon: Texture[];
	weapons: Mesh[];
	activeAnimation: string | null;
	mixer: AnimationMixer | null;
	loadCounter: number;

	onLoadComplete(): void;
	loadParts( config: MD2PartsConfig ): void;
	setPlaybackRate( rate: number ): void;
	setWireframe( wireframeEnabled: boolean ): void;
	setSkin( index: number ): void;
	setWeapon( index: number ): void;
	setAnimation( clipName: string ): void;
	syncWeaponAnimation(): void;
	update( delta: number ): void;

}
