import { BufferGeometry, Group, InstancedMesh, Material, Object3D, Scene } from '../../../src/Three';

export function createMeshesFromInstancedMesh(instancedMesh: InstancedMesh): Group;
export function createMultiMaterialObject(geometry: BufferGeometry, materials: Material[]): Group;
/**
 * @deprecated Use scene.attach( child ) instead.
 */
export function detach(child: Object3D, parent: Object3D, scene: Scene): void;
/**
 * @deprecated Use parent.attach( child ) instead.
 */
export function attach(child: Object3D, scene: Scene, parent: Object3D): void;
