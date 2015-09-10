/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = BufferGeometry;

var BufferAttribute = require( "./BufferAttribute" ),
	DirectGeometry = require( "./DirectGeometry" ),
	EventDispatcher = require( "./EventDispatcher" ),
	InterleavedBufferAttribute = require( "./InterleavedBufferAttribute" ),
	Geometry = require( "./Geometry" ),
	Object3D = require( "./Object3D" ),

	Box3 = require( "../math/Box3" ),
	_Math = require( "../math/Math" ),
	Matrix3 = require( "../math/Matrix3" ),
	Matrix4 = require( "../math/Matrix4" ),
	Sphere = require( "../math/Sphere" ),
	Vector3 = require( "../math/Vector3" ),

	Mesh = require( "../objects/Mesh" ),
	Line = require( "../objects/Line" ),
	PointCloud = require( "../objects/PointCloud" );

function BufferGeometry() {

	Object.defineProperty( this, "id", { value: Geometry.IdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = "";
	this.type = "BufferGeometry";

	this.index = null;
	this.attributes = {};

	this.morphAttributes = {};

	this.groups = [];

	this.boundingBox = null;
	this.boundingSphere = null;

}

BufferGeometry.prototype = {

	constructor: BufferGeometry,

	addIndex: function ( attribute ) {

		this.index = attribute;

	},

	addAttribute: function ( name, attribute ) {

		if ( attribute instanceof BufferAttribute === false && attribute instanceof InterleavedBufferAttribute === false ) {

			console.warn( "BufferGeometry: .addAttribute() now expects ( name, attribute )." );

			this.addAttribute( name, new BufferAttribute( arguments[ 1 ], arguments[ 2 ] ) );

			return;

		}

		if ( name === "index" ) {

			console.warn( "BufferGeometry.addAttribute: Use .addIndex() for index attribute." );
			this.addIndex( attribute );

		}

		this.attributes[ name ] = attribute;

	},

	getAttribute: function ( name ) {

		return this.attributes[ name ];

	},

	removeAttribute: function ( name ) {

		delete this.attributes[ name ];

	},

	get drawcalls() {

		console.error( "BufferGeometry: .drawcalls has been renamed to .groups." );
		return this.groups;

	},

	get offsets() {

		console.warn( "BufferGeometry: .offsets has been renamed to .groups." );
		return this.groups;

	},

	addDrawCall: function ( start, count, indexOffset ) {

		if ( indexOffset !== undefined ) {

			console.warn( "BufferGeometry: .addDrawCall() no longer supports indexOffset." );

		}

		console.warn( "BufferGeometry: .addDrawCall() is now .addGroup()." );
		this.addGroup( start, count );

	},

	clearDrawCalls: function () {

		console.warn( "BufferGeometry: .clearDrawCalls() is now .clearGroups()." );
		this.clearGroups();

	},

	addGroup: function ( start, count, materialIndex ) {

		this.groups.push( {

			start: start,
			count: count,
			materialIndex: materialIndex !== undefined ? materialIndex : 0

		} );

	},

	clearGroups: function () {

		this.groups = [];

	},

	applyMatrix: function ( matrix ) {

		var position = this.attributes.position;

		if ( position !== undefined ) {

			matrix.applyToVector3Array( position.array );
			position.needsUpdate = true;

		}

		var normal = this.attributes.normal;

		if ( normal !== undefined ) {

			var normalMatrix = new Matrix3().getNormalMatrix( matrix );

			normalMatrix.applyToVector3Array( normal.array );
			normal.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

	},

	rotateX: ( function () {

		// rotate geometry around world x-axis

		var m1;

		return function rotateX( angle ) {

			if ( m1 === undefined ) { m1 = new Matrix4(); }

			m1.makeRotationX( angle );

			this.applyMatrix( m1 );

			return this;

		};

	}() ),

	rotateY: ( function () {

		// rotate geometry around world y-axis

		var m1;

		return function rotateY( angle ) {

			if ( m1 === undefined ) { m1 = new Matrix4(); }

			m1.makeRotationY( angle );

			this.applyMatrix( m1 );

			return this;

		};

	}() ),

	rotateZ: ( function () {

		// rotate geometry around world z-axis

		var m1;

		return function rotateZ( angle ) {

			if ( m1 === undefined ) { m1 = new Matrix4(); }

			m1.makeRotationZ( angle );

			this.applyMatrix( m1 );

			return this;

		};

	}() ),

	translate: ( function () {

		// translate geometry

		var m1;

		return function translate( x, y, z ) {

			if ( m1 === undefined ) { m1 = new Matrix4(); }

			m1.makeTranslation( x, y, z );

			this.applyMatrix( m1 );

			return this;

		};

	}() ),

	scale: ( function () {

		// scale geometry

		var m1;

		return function scale( x, y, z ) {

			if ( m1 === undefined ) { m1 = new Matrix4(); }

			m1.makeScale( x, y, z );

			this.applyMatrix( m1 );

			return this;

		};

	}() ),

	lookAt: ( function () {

		var obj;

		return function lookAt( vector ) {

			if ( obj === undefined ) { obj = new Object3D(); }

			obj.lookAt( vector );

			obj.updateMatrix();

			this.applyMatrix( obj.matrix );

		};

	}() ),

	center: function () {

		this.computeBoundingBox();

		var offset = this.boundingBox.center().negate();

		this.translate( offset.x, offset.y, offset.z );

		return offset;

	},

	setFromObject: function ( object ) {

		// console.log( "BufferGeometry.setFromObject(). Converting", object, this );

		var geometry = object.geometry;

		if ( object instanceof PointCloud || object instanceof Line ) {

			var positions = new BufferAttribute.Float32Attribute( geometry.vertices.length * 3, 3 );
			var colors = new BufferAttribute.Float32Attribute( geometry.colors.length * 3, 3 );

			this.addAttribute( "position", positions.copyVector3sArray( geometry.vertices ) );
			this.addAttribute( "color", colors.copyColorsArray( geometry.colors ) );

			if ( geometry.lineDistances && geometry.lineDistances.length === geometry.vertices.length ) {

				var lineDistances = new BufferAttribute.Float32Attribute( geometry.lineDistances.length, 1 );

				this.addAttribute( "lineDistance",  lineDistances.copyArray( geometry.lineDistances ) );

			}

			if ( geometry.boundingSphere !== null ) {

				this.boundingSphere = geometry.boundingSphere.clone();

			}

			if ( geometry.boundingBox !== null ) {

				this.boundingBox = geometry.boundingBox.clone();

			}

		} else if ( object instanceof Mesh ) {

			if ( geometry instanceof Geometry ) {

				this.fromGeometry( geometry );

			}

		}

		return this;

	},

	updateFromObject: function ( object ) {

		var geometry = object.geometry,
			direct, attribute;

		if ( object instanceof Mesh ) {

			direct = geometry.__directGeometry;

			if ( direct === undefined ) {

				return this.fromGeometry( geometry );

			}

			direct.verticesNeedUpdate = geometry.verticesNeedUpdate;
			direct.normalsNeedUpdate = geometry.normalsNeedUpdate;
			direct.colorsNeedUpdate = geometry.colorsNeedUpdate;
			direct.uvsNeedUpdate = geometry.uvsNeedUpdate;
			direct.groupsNeedUpdate = geometry.groupsNeedUpdate;

			geometry.verticesNeedUpdate = false;
			geometry.normalsNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.uvsNeedUpdate = false;
			geometry.groupsNeedUpdate = false;

			geometry = direct;

		}

		if ( geometry.verticesNeedUpdate === true ) {

			attribute = this.attributes.position;

			if ( attribute !== undefined ) {

				attribute.copyVector3sArray( geometry.vertices );
				attribute.needsUpdate = true;

			}

			geometry.verticesNeedUpdate = false;

		}

		if ( geometry.normalsNeedUpdate === true ) {

			attribute = this.attributes.normal;

			if ( attribute !== undefined ) {

				attribute.copyVector3sArray( geometry.normals );
				attribute.needsUpdate = true;

			}

			geometry.normalsNeedUpdate = false;

		}

		if ( geometry.colorsNeedUpdate === true ) {

			attribute = this.attributes.color;

			if ( attribute !== undefined ) {

				attribute.copyColorsArray( geometry.colors );
				attribute.needsUpdate = true;

			}

			geometry.colorsNeedUpdate = false;

		}

		if ( geometry.lineDistancesNeedUpdate ) {

			attribute = this.attributes.lineDistance;

			if ( attribute !== undefined ) {

				attribute.copyArray( geometry.lineDistances );
				attribute.needsUpdate = true;

			}

			geometry.lineDistancesNeedUpdate = false;

		}

		if ( geometry.groupsNeedUpdate ) {

			geometry.computeGroups( object.geometry );
			this.groups = geometry.groups;

			geometry.groupsNeedUpdate = false;

		}

		return this;

	},

	fromGeometry: function ( geometry ) {

		geometry.__directGeometry = new DirectGeometry().fromGeometry( geometry );

		return this.fromDirectGeometry( geometry.__directGeometry );

	},

	fromDirectGeometry: function ( geometry ) {

		var positions = new Float32Array( geometry.vertices.length * 3 );
		this.addAttribute( "position", new BufferAttribute( positions, 3 ).copyVector3sArray( geometry.vertices ) );

		if ( geometry.normals.length > 0 ) {

			var normals = new Float32Array( geometry.normals.length * 3 );
			this.addAttribute( "normal", new BufferAttribute( normals, 3 ).copyVector3sArray( geometry.normals ) );

		}

		if ( geometry.colors.length > 0 ) {

			var colors = new Float32Array( geometry.colors.length * 3 );
			this.addAttribute( "color", new BufferAttribute( colors, 3 ).copyColorsArray( geometry.colors ) );

		}

		if ( geometry.uvs.length > 0 ) {

			var uvs = new Float32Array( geometry.uvs.length * 2 );
			this.addAttribute( "uv", new BufferAttribute( uvs, 2 ).copyVector2sArray( geometry.uvs ) );

		}

		if ( geometry.uvs2.length > 0 ) {

			var uvs2 = new Float32Array( geometry.uvs2.length * 2 );
			this.addAttribute( "uv2", new BufferAttribute( uvs2, 2 ).copyVector2sArray( geometry.uvs2 ) );

		}

		if ( geometry.indices.length > 0 ) {

			var TypeArray = geometry.vertices.length > BufferGeometry.MaxIndex ? Uint32Array : Uint16Array;
			var indices = new TypeArray( geometry.indices.length * 3 );
			this.addIndex( new BufferAttribute( indices, 1 ).copyIndicesArray( geometry.indices ) );

		}

		// groups

		this.groups = geometry.groups;

		// morphs

		for ( var name in geometry.morphTargets ) {

			var array = [];
			var morphTargets = geometry.morphTargets[ name ];

			for ( var i = 0, l = morphTargets.length; i < l; i ++ ) {

				var morphTarget = morphTargets[ i ];

				var attribute = new BufferAttribute.Float32Attribute( morphTarget.length * 3, 3 );

				array.push( attribute.copyVector3sArray( morphTarget ) );

			}

			this.morphAttributes[ name ] = array;

		}

		// skinning

		if ( geometry.skinIndices.length > 0 ) {

			var skinIndices = new BufferAttribute.Float32Attribute( geometry.skinIndices.length * 4, 4 );
			this.addAttribute( "skinIndex", skinIndices.copyVector4sArray( geometry.skinIndices ) );

		}

		if ( geometry.skinWeights.length > 0 ) {

			var skinWeights = new BufferAttribute.Float32Attribute( geometry.skinWeights.length * 4, 4 );
			this.addAttribute( "skinWeight", skinWeights.copyVector4sArray( geometry.skinWeights ) );

		}

		//

		if ( geometry.boundingSphere !== null ) {

			this.boundingSphere = geometry.boundingSphere.clone();

		}

		if ( geometry.boundingBox !== null ) {

			this.boundingBox = geometry.boundingBox.clone();

		}

		return this;

	},

	computeBoundingBox: ( function () {

		var vector;

		return function () {

			if ( vector === undefined ) { vector = new Vector3(); }

			if ( this.boundingBox === null ) {

				this.boundingBox = new Box3();

			}

			var positions = this.attributes.position.array;

			if ( positions ) {

				var bb = this.boundingBox;
				bb.makeEmpty();

				for ( var i = 0, il = positions.length; i < il; i += 3 ) {

					vector.fromArray( positions, i );
					bb.expandByPoint( vector );

				}

			}

			if ( positions === undefined || positions.length === 0 ) {

				this.boundingBox.min.set( 0, 0, 0 );
				this.boundingBox.max.set( 0, 0, 0 );

			}

			if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

				console.error( "BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The \"position\" attribute is likely to have NaN values.", this );

			}

		};

	}() ),

	computeBoundingSphere: ( function () {

		var box = new Box3();
		var vector = new Vector3();

		return function () {

			if ( this.boundingSphere === null ) {

				this.boundingSphere = new Sphere();

			}

			var positions = this.attributes.position.array;

			var i, il, center;

			if ( positions ) {

				box.makeEmpty();

				center = this.boundingSphere.center;

				for ( i = 0, il = positions.length; i < il; i += 3 ) {

					vector.fromArray( positions, i );
					box.expandByPoint( vector );

				}

				box.center( center );

				// hoping to find a boundingSphere with a radius smaller than the
				// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

				var maxRadiusSq = 0;

				for ( i = 0, il = positions.length; i < il; i += 3 ) {

					vector.fromArray( positions, i );
					maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

				}

				this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

				if ( isNaN( this.boundingSphere.radius ) ) {

					console.error( "BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The \"position\" attribute is likely to have NaN values.", this );

				}

			}

		};

	}() ),

	computeFaceNormals: function () {

		// backwards compatibility

	},

	computeVertexNormals: function () {

		var index = this.index;
		var attributes = this.attributes;
		var groups = this.groups;

		var i, j, il, jl,
			positions, normals;

		if ( attributes.position ) {

			positions = attributes.position.array;

			if ( attributes.normal === undefined ) {

				this.addAttribute( "normal", new BufferAttribute( new Float32Array( positions.length ), 3 ) );

			} else {

				// reset existing normals to zero

				normals = attributes.normal.array;

				for ( i = 0, il = normals.length; i < il; i ++ ) {

					normals[ i ] = 0;

				}

			}

			normals = attributes.normal.array;

			var vA, vB, vC,

				pA = new Vector3(),
				pB = new Vector3(),
				pC = new Vector3(),

				cb = new Vector3(),
				ab = new Vector3(),

				indices, group,
				start, count;

			// indexed elements

			if ( index ) {

				indices = index.array;

				if ( groups.length === 0 ) {

					this.addGroup( 0, indices.length );

				}

				for ( j = 0, jl = groups.length; j < jl; ++ j ) {

					group = groups[ j ];

					start = group.start;
					count = group.count;

					for ( i = start, il = start + count; i < il; i += 3 ) {

						vA = indices[ i + 0 ] * 3;
						vB = indices[ i + 1 ] * 3;
						vC = indices[ i + 2 ] * 3;

						pA.fromArray( positions, vA );
						pB.fromArray( positions, vB );
						pC.fromArray( positions, vC );

						cb.subVectors( pC, pB );
						ab.subVectors( pA, pB );
						cb.cross( ab );

						normals[ vA ] += cb.x;
						normals[ vA + 1 ] += cb.y;
						normals[ vA + 2 ] += cb.z;

						normals[ vB ] += cb.x;
						normals[ vB + 1 ] += cb.y;
						normals[ vB + 2 ] += cb.z;

						normals[ vC ] += cb.x;
						normals[ vC + 1 ] += cb.y;
						normals[ vC + 2 ] += cb.z;

					}

				}

			} else {

				// non-indexed elements (unconnected triangle soup)

				for ( i = 0, il = positions.length; i < il; i += 9 ) {

					pA.fromArray( positions, i );
					pB.fromArray( positions, i + 3 );
					pC.fromArray( positions, i + 6 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normals[ i ] = cb.x;
					normals[ i + 1 ] = cb.y;
					normals[ i + 2 ] = cb.z;

					normals[ i + 3 ] = cb.x;
					normals[ i + 4 ] = cb.y;
					normals[ i + 5 ] = cb.z;

					normals[ i + 6 ] = cb.x;
					normals[ i + 7 ] = cb.y;
					normals[ i + 8 ] = cb.z;

				}

			}

			this.normalizeNormals();

			attributes.normal.needsUpdate = true;

		}

	},

	computeTangents: function () {

		console.warn( "BufferGeometry: .computeTangents() has been removed." );

	},

	computeOffsets: function () {

		console.warn( "BufferGeometry: .computeOffsets() has been removed.");

	},

	merge: function ( geometry, offset ) {

		if ( geometry instanceof BufferGeometry === false ) {

			console.error( "BufferGeometry.merge(): geometry not an instance of BufferGeometry.", geometry );
			return;

		}

		if ( offset === undefined ) { offset = 0; }

		var attributes = this.attributes;

		for ( var key in attributes ) {

			if ( geometry.attributes[ key ] === undefined ) { continue; }

			var attribute1 = attributes[ key ];
			var attributeArray1 = attribute1.array;

			var attribute2 = geometry.attributes[ key ];
			var attributeArray2 = attribute2.array;

			var attributeSize = attribute2.itemSize;

			for ( var i = 0, j = attributeSize * offset; i < attributeArray2.length; i ++, j ++ ) {

				attributeArray1[ j ] = attributeArray2[ i ];

			}

		}

		return this;

	},

	normalizeNormals: function () {

		var normals = this.attributes.normal.array;

		var x, y, z, n;

		for ( var i = 0, il = normals.length; i < il; i += 3 ) {

			x = normals[ i ];
			y = normals[ i + 1 ];
			z = normals[ i + 2 ];

			n = 1.0 / Math.sqrt( x * x + y * y + z * z );

			normals[ i ] *= n;
			normals[ i + 1 ] *= n;
			normals[ i + 2 ] *= n;

		}

	},

	toJSON: function () {

		var data = {
			metadata: {
				version: 4.4,
				type: "BufferGeometry",
				generator: "BufferGeometry.toJSON"
			}
		};

		var key, parameters;

		// standard BufferGeometry serialization

		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== "" ) { data.name = this.name; }

		if ( this.parameters !== undefined ) {

			parameters = this.parameters;

			for ( key in parameters ) {

				if ( parameters[ key ] !== undefined ) { data[ key ] = parameters[ key ]; }

			}

			return data;

		}

		data.data = { attributes: {} };

		var array, index = this.index;

		if ( index !== null ) {

			array = Array.prototype.slice.call( index.array );

			data.data.index = {
				type: index.array.constructor.name,
				array: array
			};

		}

		var attribute, attributes = this.attributes;

		for ( key in attributes ) {

			attribute = attributes[ key ];

			array = Array.prototype.slice.call( attribute.array );

			data.data.attributes[ key ] = {
				itemSize: attribute.itemSize,
				type: attribute.array.constructor.name,
				array: array
			};

		}

		var groups = this.groups;

		if ( groups.length > 0 ) {

			data.data.groups = JSON.parse( JSON.stringify( groups ) );

		}

		var boundingSphere = this.boundingSphere;

		if ( boundingSphere !== null ) {

			data.data.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			};

		}

		return data;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		var index = source.index;

		if ( index !== null ) {

			this.addIndex( index.clone() );

		}

		var attributes = source.attributes;

		for ( var name in attributes ) {

			var attribute = attributes[ name ];
			this.addAttribute( name, attribute.clone() );

		}

		var groups = source.groups;

		for ( var i = 0, l = groups.length; i < l; i ++ ) {

			var group = groups[ i ];
			this.addGroup( group.start, group.count );

		}

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: "dispose" } );

	}

};

EventDispatcher.prototype.apply( BufferGeometry.prototype );

BufferGeometry.MaxIndex = 65535;
