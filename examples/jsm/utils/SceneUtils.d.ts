import { Geometry, Group, InstancedMesh, Material, Object3D, Scene } from '../../../src/Three';

export namespace SceneUtils {
	export function createMeshesFromInstancedMesh( instancedMesh: InstancedMesh ): Group;
	export function createMultiMaterialObject( geometry: Geometry, materials: Material[] ): Group;
	/**
	 * @deprecated Use scene.attach( child ) instead.
	 */
	export function detach( child: Object3D, parent: Object3D, scene: Scene ): void;
	/**
	 * @deprecated Use parent.attach( child ) instead.
	 */
	export function attach( child: Object3D, scene: Scene, parent: Object3D ): void;
}
