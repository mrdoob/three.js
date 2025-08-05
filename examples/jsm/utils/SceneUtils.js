import {
	BufferAttribute,
	BufferGeometry,
	Color,
	Group,
	Matrix4,
	Mesh,
	Vector3
} from 'three';

import { mergeGroups, deepCloneAttribute } from './BufferGeometryUtils.js';

/**
 * @module SceneUtils
 * @three_import import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
 */

const _color = /*@__PURE__*/new Color();
const _matrix = /*@__PURE__*/new Matrix4();

/**
 * This function creates a mesh for each instance of the given instanced mesh and
 * adds it to a group. Each mesh will honor the current 3D transformation of its
 * corresponding instance.
 *
 * @param {InstancedMesh} instancedMesh - The instanced mesh.
 * @return {Group} A group of meshes.
 */
function createMeshesFromInstancedMesh( instancedMesh ) {

	const group = new Group();

	const count = instancedMesh.count;
	const geometry = instancedMesh.geometry;
	const material = instancedMesh.material;

	for ( let i = 0; i < count; i ++ ) {

		const mesh = new Mesh( geometry, material );

		instancedMesh.getMatrixAt( i, mesh.matrix );
		mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

		group.add( mesh );

	}

	group.copy( instancedMesh );
	group.updateMatrixWorld(); // ensure correct world matrices of meshes

	return group;

}

/**
 * This function creates a mesh for each geometry-group of the given multi-material mesh and
 * adds it to a group.
 *
 * @param {Mesh} mesh - The multi-material mesh.
 * @return {Group} A group of meshes.
 */
function createMeshesFromMultiMaterialMesh( mesh ) {

	if ( Array.isArray( mesh.material ) === false ) {

		console.warn( 'THREE.SceneUtils.createMeshesFromMultiMaterialMesh(): The given mesh has no multiple materials.' );
		return mesh;

	}

	const object = new Group();
	object.copy( mesh );

	// merge groups (which automatically sorts them)

	const geometry = mergeGroups( mesh.geometry );

	const index = geometry.index;
	const groups = geometry.groups;
	const attributeNames = Object.keys( geometry.attributes );

	// create a mesh for each group by extracting the buffer data into a new geometry

	for ( let i = 0; i < groups.length; i ++ ) {

		const group = groups[ i ];

		const start = group.start;
		const end = start + group.count;

		const newGeometry = new BufferGeometry();
		const newMaterial = mesh.material[ group.materialIndex ];

		// process all buffer attributes

		for ( let j = 0; j < attributeNames.length; j ++ ) {

			const name = attributeNames[ j ];
			const attribute = geometry.attributes[ name ];
			const itemSize = attribute.itemSize;

			const newLength = group.count * itemSize;
			const type = attribute.array.constructor;

			const newArray = new type( newLength );
			const newAttribute = new BufferAttribute( newArray, itemSize );

			for ( let k = start, n = 0; k < end; k ++, n ++ ) {

				const ind = index.getX( k );

				if ( itemSize >= 1 ) newAttribute.setX( n, attribute.getX( ind ) );
				if ( itemSize >= 2 ) newAttribute.setY( n, attribute.getY( ind ) );
				if ( itemSize >= 3 ) newAttribute.setZ( n, attribute.getZ( ind ) );
				if ( itemSize >= 4 ) newAttribute.setW( n, attribute.getW( ind ) );

			}


			newGeometry.setAttribute( name, newAttribute );

		}

		const newMesh = new Mesh( newGeometry, newMaterial );
		object.add( newMesh );

	}

	return object;

}

/**
 * This function represents an alternative way to create 3D objects with multiple materials.
 * Normally, {@link BufferGeometry#groups} are used which might introduce issues e.g. when
 * exporting the object to a 3D format. This function accepts a geometry and an array of
 * materials and creates for each material a mesh that is added to a group.
 *
 * @param {BufferGeometry} geometry - The geometry.
 * @param {Array<Material>} materials - An array of materials.
 * @return {Group} A group representing a multi-material object.
 */
function createMultiMaterialObject( geometry, materials ) {

	const group = new Group();

	for ( let i = 0, l = materials.length; i < l; i ++ ) {

		group.add( new Mesh( geometry, materials[ i ] ) );

	}

	return group;

}


/**
 * Executes a reducer function for each vertex of the given 3D object.
 * `reduceVertices()` returns a single value: the function's accumulated result.
 *
 * @param {Object3D} object - The 3D object that should be processed. It must have a
 * geometry with a `position` attribute.
 * @param {function(number,Vector3):number} func - The reducer function. First argument
 * is the current value, second argument the current vertex.
 * @param {any} initialValue - The initial value.
 * @return {any} The result.
 */
function reduceVertices( object, func, initialValue ) {

	let value = initialValue;
	const vertex = new Vector3();

	object.updateWorldMatrix( true, true );

	object.traverseVisible( ( child ) => {

		const { geometry } = child;

		if ( geometry !== undefined ) {

			const { position } = geometry.attributes;

			if ( position !== undefined ) {

				for ( let i = 0, l = position.count; i < l; i ++ ) {

					if ( child.isMesh ) {

						child.getVertexPosition( i, vertex );

					} else {

						vertex.fromBufferAttribute( position, i );

					}

					if ( ! child.isSkinnedMesh ) {

						vertex.applyMatrix4( child.matrixWorld );

					}

					value = func( value, vertex );

				}

			}

		}

	} );

	return value;

}

/**
 * Sorts the instances of the given instanced mesh.
 *
 * @param {InstancedMesh} mesh - The instanced mesh to sort.
 * @param {function(number, number):number} compareFn - A custom compare function for the sort.
 */
function sortInstancedMesh( mesh, compareFn ) {

	// store copy of instanced attributes for lookups

	const instanceMatrixRef = deepCloneAttribute( mesh.instanceMatrix );
	const instanceColorRef = mesh.instanceColor ? deepCloneAttribute( mesh.instanceColor ) : null;

	const attributeRefs = new Map();

	for ( const name in mesh.geometry.attributes ) {

		const attribute = mesh.geometry.attributes[ name ];

		if ( attribute.isInstancedBufferAttribute ) {

			attributeRefs.set( attribute, deepCloneAttribute( attribute ) );

		}

	}


	// compute sort order

	const tokens = [];

	for ( let i = 0; i < mesh.count; i ++ ) tokens.push( i );

	tokens.sort( compareFn );


	// apply sort order

	for ( let i = 0; i < tokens.length; i ++ ) {

		const refIndex = tokens[ i ];

		_matrix.fromArray( instanceMatrixRef.array, refIndex * mesh.instanceMatrix.itemSize );
		_matrix.toArray( mesh.instanceMatrix.array, i * mesh.instanceMatrix.itemSize );

		if ( mesh.instanceColor ) {

			_color.fromArray( instanceColorRef.array, refIndex * mesh.instanceColor.itemSize );
			_color.toArray( mesh.instanceColor.array, i * mesh.instanceColor.itemSize );

		}

		for ( const name in mesh.geometry.attributes ) {

			const attribute = mesh.geometry.attributes[ name ];

			if ( attribute.isInstancedBufferAttribute ) {

				const attributeRef = attributeRefs.get( attribute );

				attribute.setX( i, attributeRef.getX( refIndex ) );
				if ( attribute.itemSize > 1 ) attribute.setY( i, attributeRef.getY( refIndex ) );
				if ( attribute.itemSize > 2 ) attribute.setZ( i, attributeRef.getZ( refIndex ) );
				if ( attribute.itemSize > 3 ) attribute.setW( i, attributeRef.getW( refIndex ) );

			}

		}

	}

}

/**
 * Generator based alternative to {@link Object3D#traverse}.
 *
 * @param {Object3D} object - Object to traverse.
 * @yields {Object3D} Objects that passed the filter condition.
 */
function* traverseGenerator( object ) {

	yield object;

	const children = object.children;

	for ( let i = 0, l = children.length; i < l; i ++ ) {

		yield* traverseGenerator( children[ i ] );

	}

}

/**
 * Generator based alternative to {@link Object3D#traverseVisible}.
 *
 * @param {Object3D} object Object to traverse.
 * @yields {Object3D} Objects that passed the filter condition.
 */
function* traverseVisibleGenerator( object ) {

	if ( object.visible === false ) return;

	yield object;

	const children = object.children;

	for ( let i = 0, l = children.length; i < l; i ++ ) {

		yield* traverseVisibleGenerator( children[ i ] );

	}

}

/**
 * Generator based alternative to {@link Object3D#traverseAncestors}.
 *
 * @param {Object3D} object Object to traverse.
 * @yields {Object3D} Objects that passed the filter condition.
 */
function* traverseAncestorsGenerator( object ) {

	const parent = object.parent;

	if ( parent !== null ) {

		yield parent;

		yield* traverseAncestorsGenerator( parent );

	}

}

export {
	createMeshesFromInstancedMesh,
	createMeshesFromMultiMaterialMesh,
	createMultiMaterialObject,
	reduceVertices,
	sortInstancedMesh,
	traverseGenerator,
	traverseVisibleGenerator,
	traverseAncestorsGenerator
};
