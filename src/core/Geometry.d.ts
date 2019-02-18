import { Vector3 } from './../math/Vector3';
import { Color } from './../math/Color';
import { Face3, Event } from './Face3';
import { Vector2 } from './../math/Vector2';
import { Vector4 } from './../math/Vector4';
import { Box3 } from './../math/Box3';
import { Sphere } from './../math/Sphere';
import { Matrix4 } from './../math/Matrix4';
import { BufferGeometry } from './BufferGeometry';
import { Matrix } from './../math/Matrix3';
import { Mesh } from './../objects/Mesh';
import { Bone } from './../objects/Bone';
import { AnimationClip } from './../animation/AnimationClip';
import { EventDispatcher } from './EventDispatcher';

/**
 * @deprecated Use {@link Face3} instead.
 */

export interface MorphTarget {
  name: string;
  vertices: Vector3[];
}

export interface MorphColor {
  name: string;
  colors: Color[];
}

export interface MorphNormals {
  name: string;
  normals: Vector3[];
}

export let GeometryIdCount: number;

/**
 * Base class for geometries
 *
 * # Example
 *     var geometry = new THREE.Geometry();
 *     geometry.vertices.push( new THREE.Vector3( -10, 10, 0 ) );
 *     geometry.vertices.push( new THREE.Vector3( -10, -10, 0 ) );
 *     geometry.vertices.push( new THREE.Vector3( 10, -10, 0 ) );
 *     geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
 *     geometry.computeBoundingSphere();
 *
 * @see https://github.com/mrdoob/three.js/blob/master/src/core/Geometry.js
 */
export class Geometry extends EventDispatcher {
  constructor();

  /**
   * Unique number of this geometry instance
   */
  id: number;

  uuid: string;

  /**
   * Name for this geometry. Default is an empty string.
   */
  name: string;

  type: string;

  /**
   * The array of vertices hold every position of points of the model.
   * To signal an update in this array, Geometry.verticesNeedUpdate needs to be set to true.
   */
  vertices: Vector3[];

  /**
   * Array of vertex colors, matching number and order of vertices.
   * Used in ParticleSystem, Line and Ribbon.
   * Meshes use per-face-use-of-vertex colors embedded directly in faces.
   * To signal an update in this array, Geometry.colorsNeedUpdate needs to be set to true.
   */
  colors: Color[];

  /**
   * Array of triangles or/and quads.
   * The array of faces describe how each vertex in the model is connected with each other.
   * To signal an update in this array, Geometry.elementsNeedUpdate needs to be set to true.
   */
  faces: Face3[];

  /**
   * Array of face UV layers.
   * Each UV layer is an array of UV matching order and number of vertices in faces.
   * To signal an update in this array, Geometry.uvsNeedUpdate needs to be set to true.
   */
  faceVertexUvs: Vector2[][][];

  /**
   * Array of morph targets. Each morph target is a Javascript object:
   *
   *     { name: "targetName", vertices: [ new THREE.Vector3(), ... ] }
   *
   * Morph vertices match number and order of primary vertices.
   */
  morphTargets: MorphTarget[];

  /**
   * Array of morph normals. Morph normals have similar structure as morph targets, each normal set is a Javascript object:
   *
   *     morphNormal = { name: "NormalName", normals: [ new THREE.Vector3(), ... ] }
   */
  morphNormals: MorphNormals[];

  /**
   * Array of skinning weights, matching number and order of vertices.
   */
  skinWeights: Vector4[];

  /**
   * Array of skinning indices, matching number and order of vertices.
   */
  skinIndices: Vector4[];

  /**
   *
   */
  lineDistances: number[];

  /**
   * Bounding box.
   */
  boundingBox: Box3;

  /**
   * Bounding sphere.
   */
  boundingSphere: Sphere;

  /**
   * Set to true if the vertices array has been updated.
   */
  verticesNeedUpdate: boolean;

  /**
   * Set to true if the faces array has been updated.
   */
  elementsNeedUpdate: boolean;

  /**
   * Set to true if the uvs array has been updated.
   */
  uvsNeedUpdate: boolean;

  /**
   * Set to true if the normals array has been updated.
   */
  normalsNeedUpdate: boolean;

  /**
   * Set to true if the colors array has been updated.
   */
  colorsNeedUpdate: boolean;

  /**
   * Set to true if the linedistances array has been updated.
   */
  lineDistancesNeedUpdate: boolean;

  /**
   *
   */
  groupsNeedUpdate: boolean;

  /**
   * Bakes matrix transform directly into vertex coordinates.
   */
  applyMatrix(matrix: Matrix4): Geometry;

  rotateX(angle: number): Geometry;
  rotateY(angle: number): Geometry;
  rotateZ(angle: number): Geometry;

  translate(x: number, y: number, z: number): Geometry;
  scale(x: number, y: number, z: number): Geometry;
  lookAt(vector: Vector3): void;

  fromBufferGeometry(geometry: BufferGeometry): Geometry;

  center(): Geometry;

  normalize(): Geometry;

  /**
   * Computes face normals.
   */
  computeFaceNormals(): void;

  /**
   * Computes vertex normals by averaging face normals.
   * Face normals must be existing / computed beforehand.
   */
  computeVertexNormals(areaWeighted?: boolean): void;

  /**
   * Compute vertex normals, but duplicating face normals.
   */
  computeFlatVertexNormals(): void;

  /**
   * Computes morph normals.
   */
  computeMorphNormals(): void;

  /**
   * Computes bounding box of the geometry, updating {@link Geometry.boundingBox} attribute.
   */
  computeBoundingBox(): void;

  /**
   * Computes bounding sphere of the geometry, updating Geometry.boundingSphere attribute.
   * Neither bounding boxes or bounding spheres are computed by default. They need to be explicitly computed, otherwise they are null.
   */
  computeBoundingSphere(): void;

  merge(
    geometry: Geometry,
    matrix?: Matrix,
    materialIndexOffset?: number
  ): void;

  mergeMesh(mesh: Mesh): void;

  /**
   * Checks for duplicate vertices using hashmap.
   * Duplicated vertices are removed and faces' vertices are updated.
   */
  mergeVertices(): number;

  setFromPoints(points: Array<Vector2> | Array<Vector3>): this;

  sortFacesByMaterialIndex(): void;

  toJSON(): any;

  /**
   * Creates a new clone of the Geometry.
   */
  clone(): this;

  copy(source: Geometry): this;

  /**
   * Removes The object from memory.
   * Don't forget to call this method when you remove an geometry because it can cuase meomory leaks.
   */
  dispose(): void;

  // These properties do not exist in a normal Geometry class, but if you use the instance that was passed by JSONLoader, it will be added.
  bones: Bone[];
  animation: AnimationClip;
  animations: AnimationClip[];

  // EventDispatcher mixins
  addEventListener(type: string, listener: (event: Event) => void): void;
  hasEventListener(type: string, listener: (event: Event) => void): boolean;
  removeEventListener(type: string, listener: (event: Event) => void): void;
  dispatchEvent(event: { type: string; [attachment: string]: any }): void;
}
