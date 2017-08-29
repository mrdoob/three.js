/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Vector3 } from '../../math/Vector3';

function painterSortStable( a, b ) {

	if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.program && b.program && a.program !== b.program ) {

		return a.program.id - b.program.id;

	} else if ( a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a, b ) {

	if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}

var _vector = new Vector3();
var _objectForward = new Vector3();

function WebGLRenderList() {

	var renderItems = [];
	var renderItemsIndex = 0;

	var opaque = [];
	var portal = [];
	var transparent = [];

	function init() {

		renderItemsIndex = 0;

		opaque.length = 0;
		portal.length = 0;
		transparent.length = 0;

	}

	function push( object, geometry, material, z, group, camera ) {

		var renderItem = renderItems[ renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				program: material.program,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			renderItems[ renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.program = material.program;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		if ( object.portal ) {

			if ( camera ) {

				if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();

				var box = object.geometry.boundingBox;

				_objectForward.setFromMatrixColumn( object.matrixWorld, 2 ).normalize();

				//calculate the back z face of the portal to the camera position
				_vector.setFromMatrixPosition( camera.matrixWorld );
				_vector.x -= object.matrixWorld.elements[12] + object.matrixWorld.elements[ 8] * box.min.z;
				_vector.y -= object.matrixWorld.elements[13] + object.matrixWorld.elements[ 9] * box.min.z;
				_vector.z -= object.matrixWorld.elements[14] + object.matrixWorld.elements[10] * box.min.z;

				//ensure the camera is on the +z side of the backmost face
				if ( _objectForward.dot( _vector ) > 0 ) {

					portal.push( renderItem );

				}

			} else {

				portal.push( renderItem );

			}

			if ( material.transparent ) transparent.push( renderItem );

		} else {

			if ( material.transparent ) transparent.push( renderItem );
			else opaque.push( renderItem );
			
		}

		renderItemsIndex ++;

	}

	function sort() {

		if ( opaque.length > 1 ) opaque.sort( painterSortStable );
		if ( portal.length > 1 ) portal.sort( painterSortStable );
		if ( transparent.length > 1 ) transparent.sort( reversePainterSortStable );

	}

	return {
		opaque: opaque,
		portal: portal,
		transparent: transparent,

		init: init,
		push: push,

		sort: sort
	};

}

function WebGLRenderLists() {

	var lists = {};

	function get( scene, camera ) {

		var hash = scene.id + ',' + camera.id;
		var list = lists[ hash ];

		if ( list === undefined ) {

			// console.log( 'THREE.WebGLRenderLists:', hash );

			list = new WebGLRenderList();
			lists[ hash ] = list;

		}

		return list;

	}

	function dispose() {

		lists = {};

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderLists };
