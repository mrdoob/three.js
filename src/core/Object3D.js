import { Quaternion } from '../math/Quaternion';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { EventDispatcher } from './EventDispatcher';
import { Euler } from '../math/Euler';
import { Layers } from './Layers';
import { Matrix3 } from '../math/Matrix3';
import { _Math } from '../math/Math';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author elephantatwork / www.elephantatwork.ch
 */

function Object3D() {

	Object.defineProperty( this, 'id', { value: Object3DIdCount() } );

	this.uuid = _Math.generateUUID();

	this.name = '';
	this.type = 'Object3D';

	this.parent = null;
	this.children = [];
	// searchOrder: WARNING! using 'id' here is BAD as it's problematic with index referencing.
	this.searchOrder = [ 'object', 'index', 'name', 'uuid' ];

	this.up = Object3D.DefaultUp.clone();

	var position = new Vector3();
	var rotation = new Euler();
	var quaternion = new Quaternion();
	var scale = new Vector3( 1, 1, 1 );

	function onRotationChange () {

		quaternion.setFromEuler( rotation, false );

	}

	function onQuaternionChange () {

		rotation.setFromQuaternion( quaternion, undefined, false );

	}

	rotation.onChange( onRotationChange );
	quaternion.onChange( onQuaternionChange );

	Object.defineProperties( this, {
		position: {
			enumerable: true,
			value: position
		},
		rotation: {
			enumerable: true,
			value: rotation
		},
		quaternion: {
			enumerable: true,
			value: quaternion
		},
		scale: {
			enumerable: true,
			value: scale
		},
		modelViewMatrix: {
			value: new Matrix4()
		},
		normalMatrix: {
			value: new Matrix3()
		}
	} );

	this.matrix = new Matrix4();
	this.matrixWorld = new Matrix4();

	this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
	this.matrixWorldNeedsUpdate = false;

	this.layers = new Layers();
	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;
	this.renderOrder = 0;

	this.userData = {};

	this.onBeforeRender = function(){}; 
	this.onAfterRender = function(){};

}

Object3D.DefaultUp = new Vector3( 0, 1, 0 );
Object3D.DefaultMatrixAutoUpdate = true;

Object.assign( Object3D.prototype, EventDispatcher.prototype, {

	isObject3D: true,

	applyMatrix: function ( matrix ) {

		this.matrix.multiplyMatrices( matrix, this.matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	},

	setRotationFromAxisAngle: function ( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	},

	setRotationFromEuler: function ( euler ) {

		this.quaternion.setFromEuler( euler, true );

	},

	setRotationFromMatrix: function ( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	},

	setRotationFromQuaternion: function ( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	},

	rotateOnAxis: function () {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		var q1 = new Quaternion();

		return function rotateOnAxis( axis, angle ) {

			q1.setFromAxisAngle( axis, angle );

			this.quaternion.multiply( q1 );

			return this;

		};

	}(),

	rotateX: function () {

		var v1 = new Vector3( 1, 0, 0 );

		return function rotateX( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateY: function () {

		var v1 = new Vector3( 0, 1, 0 );

		return function rotateY( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateZ: function () {

		var v1 = new Vector3( 0, 0, 1 );

		return function rotateZ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	translateOnAxis: function () {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		var v1 = new Vector3();

		return function translateOnAxis( axis, distance ) {

			v1.copy( axis ).applyQuaternion( this.quaternion );

			this.position.add( v1.multiplyScalar( distance ) );

			return this;

		};

	}(),

	translateX: function () {

		var v1 = new Vector3( 1, 0, 0 );

		return function translateX( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateY: function () {

		var v1 = new Vector3( 0, 1, 0 );

		return function translateY( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateZ: function () {

		var v1 = new Vector3( 0, 0, 1 );

		return function translateZ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	localToWorld: function ( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	},

	worldToLocal: function () {

		var m1 = new Matrix4();

		return function worldToLocal( vector ) {

			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );

		};

	}(),

	lookAt: function () {

		// This routine does not support objects with rotated and/or translated parent(s)

		var m1 = new Matrix4();

		return function lookAt( vector ) {

			m1.lookAt( vector, this.position, this.up );

			this.quaternion.setFromRotationMatrix( m1 );

		};

	}(),

	add: function () {

		var i = 0, l = arguments.length;

		for ( ; i < l; i ++ ) {

			this.addAt( undefined, arguments[ i ], false );
		}

		return this;

	},

	addAt: function ( entity, object, move, shift ) {

		var children = this.children;

		entity = this.findObject(entity, true);

		if( entity === -1 ) entity = children.length;

		if ( (object && object.isObject3D) ) {

			if ( object === this ) {

				console.error( "THREE.Object3D.add/At: object can't be added as a child of itself.", object );

				return;

			}

			var search = children.indexOf( object );

			if ( search === -1 || move !== false ) {

				if( entity > children.length || entity < 0) entity = children.length;

				var type;

				if ( object.parent !== this ) {

					if ( object.parent != undefined ) {

						object.parent.replace( object );

					}

					object.parent = this;

				}

				if ( search !== -1 && move !== false ) {

					children.splice( search, 1 );

					type = 'moved';

					if( shift !== false && search < entity - 1 ) entity = entity - 1;

				} else {

					type = 'added';

				}

				children.splice( entity, 0, object );

				object.dispatchEvent( { type: type, index: entity } );

				return object;


			} else {

				return object;

			}

		} else {

			console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );

		}

	},

	remove: function () {

		var i, list = [];

		for ( i = 0; i < arguments.length; i ++ ) list.push( this.findObject( arguments[ i ] ) );

		for ( i = 0; i < list.length; i ++ ) this.replace( list[ i ] );

		return this;

	},

	removeAll: function () {

		return this.remove.apply(this, Object.keys(this.children));

	},

	replace: function ( entity, newChild ) {

		/* entity can be either an index or an object */

		var children = this.children, index = -1, object, result;

		index = children.indexOf( newChild );

		if ( index === -1 ) {

			index = this.findObject( entity, true );

			if ( index !== - 1 ) {

				object = children[ index ];

				if ( object != undefined ) {

					if ( object.parent != undefined && object.parent !== this ) {

						object.parent.remove( object );

					}

					object.parent = null;

					if ( newChild !== undefined ) {

						if ( newChild instanceof THREE.Object3D ) {

							if ( newChild === this ) {

								console.error( "THREE.Object3D.replace: Aborted, newChild can't be added as a child of itself.", newChild );

								return;

							}

							result = children.splice( index, 1, newChild );

							object.dispatchEvent( { type: 'replaced', index: index } );

						}

					}

					else {

						result = children.splice( index, 1 );

						object.dispatchEvent( { type: 'removed', index: index } );

					}

					if ( Array.isArray( result ) === true && result.length === 1 ) {

						return result[ 0 ];

					}

				}
			}
		}

		return result;
	},

	findObject: function ( entity, returnIndex, searchOrder ) {

		if( entity === undefined ) {

			if( returnIndex === true ) return -1;

			return;
		}

		if( searchOrder === undefined ) searchOrder = this.searchOrder;

		else {

			if(Array.isArray( searchOrder ) === false) searchOrder = [ searchOrder ];

		}

		var children = this.children;
		var result, searchType, i, l = searchOrder.length;

		for ( i = 0 ; i < l; i ++ ) {

			searchType = searchOrder[ i ];

			if( searchType === 'object' ) result = children.indexOf( entity );

			else if ( searchType === 'index' ) result = children[ entity ];

			else result = this.getObjectByProperty( searchType, entity );

			if ( result !== undefined && result !== -1) break;

		}

		if( returnIndex === true ) {

			if ( typeof(result) !== 'number' ) return children.indexOf( result );

		} else {

			if ( typeof(result) === 'number' ) return children[ result ];

		}

		return result;
	},

	getObjectById: function ( id ) {

		return this.getObjectByProperty( 'id', id );

	},

	getObjectByName: function ( name ) {

		return this.getObjectByProperty( 'name', name );

	},

	getObjectByProperty: function ( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			var object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	},

	getWorldPosition: function ( optionalTarget ) {

		var result = optionalTarget || new Vector3();

		this.updateMatrixWorld( true );

		return result.setFromMatrixPosition( this.matrixWorld );

	},

	getWorldQuaternion: function () {

		var position = new Vector3();
		var scale = new Vector3();

		return function getWorldQuaternion( optionalTarget ) {

			var result = optionalTarget || new Quaternion();

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, result, scale );

			return result;

		};

	}(),

	getWorldRotation: function () {

		var quaternion = new Quaternion();

		return function getWorldRotation( optionalTarget ) {

			var result = optionalTarget || new Euler();

			this.getWorldQuaternion( quaternion );

			return result.setFromQuaternion( quaternion, this.rotation.order, false );

		};

	}(),

	getWorldScale: function () {

		var position = new Vector3();
		var quaternion = new Quaternion();

		return function getWorldScale( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.updateMatrixWorld( true );

			this.matrixWorld.decompose( position, quaternion, result );

			return result;

		};

	}(),

	getWorldDirection: function () {

		var quaternion = new Quaternion();

		return function getWorldDirection( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.getWorldQuaternion( quaternion );

			return result.set( 0, 0, 1 ).applyQuaternion( quaternion );

		};

	}(),

	raycast: function () {},

	traverse: function ( callback ) {

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	},

	traverseVisible: function ( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	},

	traverseAncestors: function ( callback ) {

		var parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	},

	updateMatrix: function () {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	},

	updateMatrixWorld: function ( force ) {

		if ( this.matrixAutoUpdate === true ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate === true || force === true ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		var children = this.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( force );

		}

	},

	toJSON: function ( meta ) {

		// meta is '' when called from JSON.stringify
		var isRootObject = ( meta === undefined || meta === '' );

		var output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {}
			};

			output.metadata = {
				version: 4.4,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		var object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;

		object.matrix = this.matrix.toArray();

		//

		if ( this.geometry !== undefined ) {

			if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

				meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON( meta );

			}

			object.geometry = this.geometry.uuid;

		}

		if ( this.material !== undefined ) {

			if ( meta.materials[ this.material.uuid ] === undefined ) {

				meta.materials[ this.material.uuid ] = this.material.toJSON( meta );

			}

			object.material = this.material.uuid;

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( var i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		if ( isRootObject ) {

			var geometries = extractFromCache( meta.geometries );
			var materials = extractFromCache( meta.materials );
			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			var data, key, values = [];
			for ( key in cache ) {

				data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	},

	clone: function ( recursive ) {

		return new this.constructor().copy( this, recursive );

	},

	copy: function ( source, recursive ) {

		if ( recursive === undefined ) recursive = true;

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < source.children.length; i ++ ) {

				var child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

} );

var count = 0;
function Object3DIdCount() { return count++; };


export { Object3DIdCount, Object3D };
