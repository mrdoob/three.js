import { Geometry, Material, Object3D, Scene } from '../../../src/Three';

export namespace SceneUtils {
	export function createMultiMaterialObject( geometry: Geometry, materials: Material[] ): Object3D;
	export function detach( child: Object3D, parent: Object3D, scene: Scene ): void;
	export function attach( child: Object3D, scene: Scene, parent: Object3D ): void;
}
