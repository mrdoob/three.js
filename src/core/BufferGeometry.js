import { Box3 } from '../math/Box3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute.js';
import { Sphere } from '../math/Sphere.js';
import { Object3D } from './Object3D.js';
import { generateUUID } from '../math/MathUtils.js';
import { arrayNeedsUint32, warn, error } from '../utils.js';
import {
	box3Copy,
	box3Create,
	box3ExpandByPoint,
	box3GetCenter,
	box3MakeEmpty,
	box3Set,
	box3SetFromBufferAttribute
} from '../math/Box3Functions.js';
import { mat3Create, mat3GetNormalMatrix } from '../math/Matrix3Functions.js';
import {
	mat4Create,
	mat4MakeRotationFromQuaternion,
	mat4MakeRotationX,
	mat4MakeRotationY,
	mat4MakeRotationZ,
	mat4MakeScale,
	mat4MakeTranslation
} from '../math/Matrix4Functions.js';
import { sphereCopy, sphereSet } from '../math/SphereFunctions.js';
import {
	vec2Create,
	vec2FromBufferAttribute,
	vec2Sub
} from '../math/Vector2Functions.js';
import {
	vec3Add,
	vec3AddScaledVector,
	vec3AddVectors,
	vec3Copy,
	vec3Create,
	vec3Cross,
	vec3CrossVectors,
	vec3DistanceToSquared,
	vec3Dot,
	vec3FromBufferAttribute,
	vec3MultiplyScalar,
	vec3Negate,
	vec3Normalize,
	vec3Sub,
	vec3SubVectors
} from '../math/Vector3Functions.js';

let _id = 0;

const _m1 = /*@__PURE__*/ mat4Create();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ vec3Create();
const _box = /*@__PURE__*/ box3Create();
const _boxMorphTargets = /*@__PURE__*/ box3Create();
const _vector = /*@__PURE__*/ vec3Create();
const _normalMatrix = /*@__PURE__*/ mat3Create();

/**
 * A representation of mesh, line, or point geometry. Includes vertex
 * positions, face indices, normals, colors, UVs, and custom attributes
 * within buffers, reducing the cost of passing all this data to the GPU.
 *
 * ```js
 * const geometry = new THREE.BufferGeometry();
 * // create a simple square shape. We duplicate the top left and bottom right
 * // vertices because each vertex needs to appear once per triangle.
 * const vertices = new Float32Array( [
 * 	-1.0, -1.0,  1.0, // v0
 * 	 1.0, -1.0,  1.0, // v1
 * 	 1.0,  1.0,  1.0, // v2
 *
 * 	 1.0,  1.0,  1.0, // v3
 * 	-1.0,  1.0,  1.0, // v4
 * 	-1.0, -1.0,  1.0  // v5
 * ] );
 * // itemSize = 3 because there are 3 values (components) per vertex
 * geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
 * const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
 * const mesh = new THREE.Mesh( geometry, material );
 * ```
 *
 * @augments EventDispatcher
 */
class BufferGeometry extends EventDispatcher {

	/**
	 * Constructs a new geometry.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBufferGeometry = true;

		/**
		 * The ID of the geometry.
		 *
		 * @name BufferGeometry#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The UUID of the geometry.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The name of the geometry.
		 *
		 * @type {string}
		 */
		this.name = '';
		this.type = 'BufferGeometry';

		/**
		 * Allows for vertices to be re-used across multiple triangles; this is
		 * called using "indexed triangles". Each triangle is associated with the
		 * indices of three vertices. This attribute therefore stores the index of
		 * each vertex for each triangular face. If this attribute is not set, the
		 * renderer assumes that each three contiguous positions represent a single triangle.
		 *
		 * @type {?BufferAttribute}
		 * @default null
		 */
		this.index = null;

		/**
		 * A (storage) buffer attribute which was generated with a compute shader and
		 * now defines indirect draw calls.
		 *
		 * Can only be used with {@link WebGPURenderer} and a WebGPU backend.
		 *
		 * @type {?BufferAttribute}
		 * @default null
		 */
		this.indirect = null;

		/**
		 * The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
		 *
		 * Can only be used with {@link WebGPURenderer} and a WebGPU backend.
		 *
		 * @type {number|Array<number>}
		 * @default 0
		 */
		this.indirectOffset = 0;

		/**
		 * This dictionary has as id the name of the attribute to be set and as value
		 * the buffer attribute to set it to. Rather than accessing this property directly,
		 * use `setAttribute()` and `getAttribute()` to access attributes of this geometry.
		 *
		 * @type {Object<string,(BufferAttribute|InterleavedBufferAttribute)>}
		 */
		this.attributes = {};

		/**
		 * This dictionary holds the morph targets of the geometry.
		 *
		 * Note: Once the geometry has been rendered, the morph attribute data cannot
		 * be changed. You will have to call `dispose()`, and create a new geometry instance.
		 *
		 * @type {Object}
		 */
		this.morphAttributes = {};

		/**
		 * Used to control the morph target behavior; when set to `true`, the morph
		 * target data is treated as relative offsets, rather than as absolute
		 * positions/normals.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.morphTargetsRelative = false;

		/**
		 * Split the geometry into groups, each of which will be rendered in a
		 * separate draw call. This allows an array of materials to be used with the geometry.
		 *
		 * Use `addGroup()` and `clearGroups()` to edit groups, rather than modifying this array directly.
		 *
		 * Every vertex and index must belong to exactly one group — groups must not share vertices or
		 * indices, and must not leave vertices or indices unused.
		 *
		 * @type {Array<Object>}
		 */
		this.groups = [];

		/**
		 * Bounding box for the geometry which can be calculated with `computeBoundingBox()`.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * Bounding sphere for the geometry which can be calculated with `computeBoundingSphere()`.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		/**
		 * Determines the part of the geometry to render. This should not be set directly,
		 * instead use `setDrawRange()`.
		 *
		 * @type {{start:number,count:number}}
		 */
		this.drawRange = { start: 0, count: Infinity };

		/**
		 * An object that can be used to store custom data about the geometry.
		 * It should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		/**
		 * `true` when the geometry has been transformed since construction
		 * (e.g. via {@link BufferGeometry#applyMatrix4}). Only relevant for
		 * geometry generators (subclasses that populate `parameters`): when set,
		 * {@link BufferGeometry#toJSON} omits `parameters` since they no longer
		 * describe the geometry.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._transformed = false;

	}

	/**
	 * Returns the index of this geometry.
	 *
	 * @return {?BufferAttribute} The index. Returns `null` if no index is defined.
	 */
	getIndex() {

		return this.index;

	}

	/**
	 * Sets the given index to this geometry.
	 *
	 * @param {Array<number>|BufferAttribute} index - The index to set.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	setIndex( index ) {

		if ( Array.isArray( index ) ) {

			this.index = new ( arrayNeedsUint32( index ) ? Uint32BufferAttribute : Uint16BufferAttribute )( index, 1 );

		} else {

			this.index = index;

		}

		return this;

	}

	/**
	 * Sets the given indirect attribute to this geometry.
	 *
	 * @param {BufferAttribute} indirect - The attribute holding indirect draw calls.
	 * @param {number|Array<number>} [indirectOffset=0] - The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	setIndirect( indirect, indirectOffset = 0 ) {

		this.indirect = indirect;
		this.indirectOffset = indirectOffset;

		return this;

	}

	/**
	 * Returns the indirect attribute of this geometry.
	 *
	 * @return {?BufferAttribute} The indirect attribute. Returns `null` if no indirect attribute is defined.
	 */
	getIndirect() {

		return this.indirect;

	}

	/**
	 * Returns the buffer attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @return {BufferAttribute|InterleavedBufferAttribute|undefined} The buffer attribute.
	 * Returns `undefined` if not attribute has been found.
	 */
	getAttribute( name ) {

		return this.attributes[ name ];

	}

	/**
	 * Sets the given attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @param {BufferAttribute|InterleavedBufferAttribute} attribute - The attribute to set.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}

	/**
	 * Deletes the attribute for the given name.
	 *
	 * @param {string} name - The attribute name to delete.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	deleteAttribute( name ) {

		delete this.attributes[ name ];

		return this;

	}

	/**
	 * Returns `true` if this geometry has an attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @return {boolean} Whether this geometry has an attribute for the given name or not.
	 */
	hasAttribute( name ) {

		return this.attributes[ name ] !== undefined;

	}

	/**
	 * Adds a group to this geometry.
	 *
	 * @param {number} start - The first element in this draw call. That is the first
	 * vertex for non-indexed geometry, otherwise the first triangle index.
	 * @param {number} count - Specifies how many vertices (or indices) are part of this group.
	 * @param {number} [materialIndex=0] - The material array index to use.
	 */
	addGroup( start, count, materialIndex = 0 ) {

		this.groups.push( {

			start: start,
			count: count,
			materialIndex: materialIndex

		} );

	}

	/**
	 * Clears all groups.
	 */
	clearGroups() {

		this.groups = [];

	}

	/**
	 * Sets the draw range for this geometry.
	 *
	 * @param {number} start - The first vertex for non-indexed geometry, otherwise the first triangle index.
	 * @param {number} count - For non-indexed BufferGeometry, `count` is the number of vertices to render.
	 * For indexed BufferGeometry, `count` is the number of indices to render.
	 */
	setDrawRange( start, count ) {

		this.drawRange.start = start;
		this.drawRange.count = count;

	}

	/**
	 * Applies the given 4x4 transformation matrix to the geometry.
	 *
	 * @param {Matrix4} matrix - The matrix to apply.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	applyMatrix4( matrix ) {

		const position = this.attributes.position;

		if ( position !== undefined ) {

			position.applyMatrix4( matrix );

			position.needsUpdate = true;

		}

		const normal = this.attributes.normal;

		if ( normal !== undefined ) {

			mat3GetNormalMatrix( matrix, _normalMatrix );

			normal.applyNormalMatrix( _normalMatrix );

			normal.needsUpdate = true;

		}

		const tangent = this.attributes.tangent;

		if ( tangent !== undefined ) {

			tangent.transformDirection( matrix );

			tangent.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		this._transformed = true;

		return this;

	}

	/**
	 * Applies the rotation represented by the Quaternion to the geometry.
	 *
	 * @param {Quaternion} q - The Quaternion to apply.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	applyQuaternion( q ) {

		mat4MakeRotationFromQuaternion( q, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Rotates the geometry about the X axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#rotation} for typical
	 * real-time mesh rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	rotateX( angle ) {

		// rotate geometry around world x-axis

		mat4MakeRotationX( angle, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Rotates the geometry about the Y axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#rotation} for typical
	 * real-time mesh rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	rotateY( angle ) {

		// rotate geometry around world y-axis

		mat4MakeRotationY( angle, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Rotates the geometry about the Z axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#rotation} for typical
	 * real-time mesh rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	rotateZ( angle ) {

		// rotate geometry around world z-axis

		mat4MakeRotationZ( angle, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Translates the geometry. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#position} for typical
	 * real-time mesh rotation.
	 *
	 * @param {number} x - The x offset.
	 * @param {number} y - The y offset.
	 * @param {number} z - The z offset.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	translate( x, y, z ) {

		// translate geometry

		mat4MakeTranslation( x, y, z, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Scales the geometry. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#scale} for typical
	 * real-time mesh rotation.
	 *
	 * @param {number} x - The x scale.
	 * @param {number} y - The y scale.
	 * @param {number} z - The z scale.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	scale( x, y, z ) {

		// scale geometry

		mat4MakeScale( x, y, z, _m1 );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 * Rotates the geometry to face a point in 3D space. This is typically done as a one time
	 * operation, and not during a loop. Use {@link Object3D#lookAt} for typical
	 * real-time mesh rotation.
	 *
	 * @param {Vector3} vector - The target point.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	lookAt( vector ) {

		_obj.lookAt( vector );

		_obj.updateMatrix();

		this.applyMatrix4( _obj.matrix );

		return this;

	}

	/**
	 * Center the geometry based on its bounding box.
	 *
	 * @return {BufferGeometry} A reference to this instance.
	 */
	center() {

		this.computeBoundingBox();

		box3GetCenter( this.boundingBox, _offset );
		vec3Negate( _offset, _offset );

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	}

	/**
	 * Defines a geometry by creating a `position` attribute based on the given array of points. The array
	 * can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is
	 * set to `0`.
	 *
	 * If the method is used with an existing `position` attribute, the vertex data are overwritten with the
	 * data from the array. The length of the array must match the vertex count.
	 *
	 * @param {Array<Vector2>|Array<Vector3>} points - The points.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	setFromPoints( points ) {

		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute === undefined ) {

			const position = [];

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				const point = points[ i ];
				position.push( point.x, point.y, point.z || 0 );

			}

			this.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );

		} else {

			const l = Math.min( points.length, positionAttribute.count ); // make sure data do not exceed buffer size

			for ( let i = 0; i < l; i ++ ) {

				const point = points[ i ];
				positionAttribute.setXYZ( i, point.x, point.y, point.z || 0 );

			}

			if ( points.length > positionAttribute.count ) {

				warn( 'BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.' );

			}

			positionAttribute.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Computes the bounding box of the geometry, and updates the `boundingBox` member.
	 * The bounding box is not computed by the engine; it must be computed by your app.
	 * You may need to recompute the bounding box if the geometry vertices are modified.
	 */
	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			error( 'BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.', this );

			box3Set(
				{ x: - Infinity, y: - Infinity, z: - Infinity },
				{ x: + Infinity, y: + Infinity, z: + Infinity },
				this.boundingBox
			);

			return;

		}

		if ( position !== undefined ) {

			box3SetFromBufferAttribute( position, this.boundingBox );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					box3SetFromBufferAttribute( morphAttribute, _box );

					if ( this.morphTargetsRelative ) {

						vec3AddVectors( this.boundingBox.min, _box.min, _vector );
						box3ExpandByPoint( this.boundingBox, _vector, this.boundingBox );

						vec3AddVectors( this.boundingBox.max, _box.max, _vector );
						box3ExpandByPoint( this.boundingBox, _vector, this.boundingBox );

					} else {

						box3ExpandByPoint( this.boundingBox, _box.min, this.boundingBox );
						box3ExpandByPoint( this.boundingBox, _box.max, this.boundingBox );

					}

				}

			}

		} else {

			box3MakeEmpty( this.boundingBox );

		}

		if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

			error( 'BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

		}

	}

	/**
	 * Computes the bounding sphere of the geometry, and updates the `boundingSphere` member.
	 * The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
	 * You may need to recompute the bounding sphere if the geometry vertices are modified.
	 */
	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			error( 'BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.', this );

			sphereSet( { x: 0, y: 0, z: 0 }, Infinity, this.boundingSphere );

			return;

		}

		if ( position ) {

			// first, find the center of the bounding sphere

			const center = this.boundingSphere.center;

			box3SetFromBufferAttribute( position, _box );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					box3SetFromBufferAttribute( morphAttribute, _boxMorphTargets );

					if ( this.morphTargetsRelative ) {

						vec3AddVectors( _box.min, _boxMorphTargets.min, _vector );
						box3ExpandByPoint( _box, _vector, _box );

						vec3AddVectors( _box.max, _boxMorphTargets.max, _vector );
						box3ExpandByPoint( _box, _vector, _box );

					} else {

						box3ExpandByPoint( _box, _boxMorphTargets.min, _box );
						box3ExpandByPoint( _box, _boxMorphTargets.max, _box );

					}

				}

			}

			box3GetCenter( _box, center );

			// second, try to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

			let maxRadiusSq = 0;

			for ( let i = 0, il = position.count; i < il; i ++ ) {

				vec3FromBufferAttribute( position, i, _vector );

				maxRadiusSq = Math.max( maxRadiusSq, vec3DistanceToSquared( center, _vector ) );

			}

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					const morphTargetsRelative = this.morphTargetsRelative;

					for ( let j = 0, jl = morphAttribute.count; j < jl; j ++ ) {

						vec3FromBufferAttribute( morphAttribute, j, _vector );

						if ( morphTargetsRelative ) {

							vec3FromBufferAttribute( position, j, _offset );
							vec3Add( _vector, _offset, _vector );

						}

						maxRadiusSq = Math.max( maxRadiusSq, vec3DistanceToSquared( center, _vector ) );

					}

				}

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				error( 'BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

			}

		}

	}

	/**
	 * Calculates and adds a tangent attribute to this geometry.
	 *
	 * The computation is only supported for indexed geometries and if position, normal, and uv attributes
	 * are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by
	 * {@link BufferGeometryUtils#computeMikkTSpaceTangents} instead.
	 */
	computeTangents() {

		const index = this.index;
		const attributes = this.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			error( 'BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		const positionAttribute = attributes.position;
		const normalAttribute = attributes.normal;
		const uvAttribute = attributes.uv;

		let tangentAttribute = this.getAttribute( 'tangent' );

		if ( tangentAttribute === undefined || tangentAttribute.count !== positionAttribute.count ) {

			tangentAttribute = new BufferAttribute( new Float32Array( 4 * positionAttribute.count ), 4 );
			this.setAttribute( 'tangent', tangentAttribute );

		}

		const tan1 = [], tan2 = [];

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			tan1[ i ] = vec3Create();
			tan2[ i ] = vec3Create();

		}

		const vA = vec3Create(),
			vB = vec3Create(),
			vC = vec3Create(),

			uvA = vec2Create(),
			uvB = vec2Create(),
			uvC = vec2Create(),

			sdir = vec3Create(),
			tdir = vec3Create();

		function handleTriangle( a, b, c ) {

			vec3FromBufferAttribute( positionAttribute, a, vA );
			vec3FromBufferAttribute( positionAttribute, b, vB );
			vec3FromBufferAttribute( positionAttribute, c, vC );

			vec2FromBufferAttribute( uvAttribute, a, uvA );
			vec2FromBufferAttribute( uvAttribute, b, uvB );
			vec2FromBufferAttribute( uvAttribute, c, uvC );

			vec3Sub( vB, vA, vB );
			vec3Sub( vC, vA, vC );

			vec2Sub( uvB, uvA, uvB );
			vec2Sub( uvC, uvA, uvC );

			const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if ( ! isFinite( r ) ) return;

			vec3Copy( vB, sdir );
			vec3MultiplyScalar( sdir, uvC.y, sdir );
			vec3AddScaledVector( sdir, vC, - uvB.y, sdir );
			vec3MultiplyScalar( sdir, r, sdir );

			vec3Copy( vC, tdir );
			vec3MultiplyScalar( tdir, uvB.x, tdir );
			vec3AddScaledVector( tdir, vB, - uvC.x, tdir );
			vec3MultiplyScalar( tdir, r, tdir );

			vec3Add( tan1[ a ], sdir, tan1[ a ] );
			vec3Add( tan1[ b ], sdir, tan1[ b ] );
			vec3Add( tan1[ c ], sdir, tan1[ c ] );

			vec3Add( tan2[ a ], tdir, tan2[ a ] );
			vec3Add( tan2[ b ], tdir, tan2[ b ] );
			vec3Add( tan2[ c ], tdir, tan2[ c ] );

		}

		let groups = this.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: index.count
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					index.getX( j + 0 ),
					index.getX( j + 1 ),
					index.getX( j + 2 )
				);

			}

		}

		const tmp = vec3Create(), tmp2 = vec3Create();
		const n = vec3Create(), n2 = vec3Create();

		function handleVertex( v ) {

			vec3FromBufferAttribute( normalAttribute, v, n );
			vec3Copy( n, n2 );

			const t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			vec3Copy( t, tmp );
			vec3MultiplyScalar( n, vec3Dot( n, t ), n );
			vec3Sub( tmp, n, tmp );
			vec3Normalize( tmp, tmp );

			// Calculate handedness

			vec3CrossVectors( n2, t, tmp2 );
			const test = vec3Dot( tmp2, tan2[ v ] );
			const w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangentAttribute.setXYZW( v, tmp.x, tmp.y, tmp.z, w );

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( index.getX( j + 0 ) );
				handleVertex( index.getX( j + 1 ) );
				handleVertex( index.getX( j + 2 ) );

			}

		}

		this._transformed = true;

	}

	/**
	 * Computes vertex normals for the given vertex data. For indexed geometries, the method sets
	 * each vertex normal to be the average of the face normals of the faces that share that vertex.
	 * For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
	 * to be the same as the face normal.
	 */
	computeVertexNormals() {

		const index = this.index;
		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute !== undefined ) {

			let normalAttribute = this.getAttribute( 'normal' );

			if ( normalAttribute === undefined || normalAttribute.count !== positionAttribute.count ) {

				normalAttribute = new BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
				this.setAttribute( 'normal', normalAttribute );

			} else {

				// reset existing normals to zero

				for ( let i = 0, il = normalAttribute.count; i < il; i ++ ) {

					normalAttribute.setXYZ( i, 0, 0, 0 );

				}

			}

			const pA = vec3Create(), pB = vec3Create(), pC = vec3Create();
			const nA = vec3Create(), nB = vec3Create(), nC = vec3Create();
			const cb = vec3Create(), ab = vec3Create();

			// indexed elements

			if ( index ) {

				for ( let i = 0, il = index.count; i < il; i += 3 ) {

					const vA = index.getX( i + 0 );
					const vB = index.getX( i + 1 );
					const vC = index.getX( i + 2 );

					vec3FromBufferAttribute( positionAttribute, vA, pA );
					vec3FromBufferAttribute( positionAttribute, vB, pB );
					vec3FromBufferAttribute( positionAttribute, vC, pC );

					vec3SubVectors( pC, pB, cb );
					vec3SubVectors( pA, pB, ab );
					vec3Cross( cb, ab, cb );

					vec3FromBufferAttribute( normalAttribute, vA, nA );
					vec3FromBufferAttribute( normalAttribute, vB, nB );
					vec3FromBufferAttribute( normalAttribute, vC, nC );

					vec3Add( nA, cb, nA );
					vec3Add( nB, cb, nB );
					vec3Add( nC, cb, nC );

					normalAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
					normalAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
					normalAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

				}

			} else {

				// non-indexed elements (unconnected triangle soup)

				for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

					vec3FromBufferAttribute( positionAttribute, i + 0, pA );
					vec3FromBufferAttribute( positionAttribute, i + 1, pB );
					vec3FromBufferAttribute( positionAttribute, i + 2, pC );

					vec3SubVectors( pC, pB, cb );
					vec3SubVectors( pA, pB, ab );
					vec3Cross( cb, ab, cb );

					normalAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

				}

			}

			this.normalizeNormals();

			normalAttribute.needsUpdate = true;

		}

	}

	/**
	 * Ensures every normal vector in a geometry will have a magnitude of `1`. This will
	 * correct lighting on the geometry surfaces.
	 */
	normalizeNormals() {

		const normals = this.attributes.normal;

		for ( let i = 0, il = normals.count; i < il; i ++ ) {

			vec3FromBufferAttribute( normals, i, _vector );
			vec3Normalize( _vector, _vector );

			normals.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

	}

	/**
	 * Return a new non-index version of this indexed geometry. If the geometry
	 * is already non-indexed, the method is a NOOP.
	 *
	 * @return {BufferGeometry} The non-indexed version of this indexed geometry.
	 */
	toNonIndexed() {

		function convertBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				if ( attribute.isInterleavedBufferAttribute ) {

					index = indices[ i ] * attribute.data.stride + attribute.offset;

				} else {

					index = indices[ i ] * itemSize;

				}

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize, normalized );

		}

		//

		if ( this.index === null ) {

			warn( 'BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.' );
			return this;

		}

		const geometry2 = new BufferGeometry();

		const indices = this.index.array;
		const attributes = this.attributes;

		// attributes

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const newAttribute = convertBufferAttribute( attribute, indices );

			geometry2.setAttribute( name, newAttribute );

		}

		// morph attributes

		const morphAttributes = this.morphAttributes;

		for ( const name in morphAttributes ) {

			const morphArray = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

				const attribute = morphAttribute[ i ];

				const newAttribute = convertBufferAttribute( attribute, indices );

				morphArray.push( newAttribute );

			}

			geometry2.morphAttributes[ name ] = morphArray;

		}

		geometry2.morphTargetsRelative = this.morphTargetsRelative;

		// groups

		const groups = this.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			geometry2.addGroup( group.start, group.count, group.materialIndex );

		}

		return geometry2;

	}

	/**
	 * Serializes the geometry into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized geometry.
	 */
	toJSON() {

		const data = {
			metadata: {
				version: 4.7,
				type: 'BufferGeometry',
				generator: 'BufferGeometry.toJSON'
			}
		};

		// standard BufferGeometry serialization

		data.uuid = this.uuid;
		data.type = ( this.parameters !== undefined && this._transformed === true ) ? 'BufferGeometry' : this.type;
		if ( this.name !== '' ) data.name = this.name;
		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		if ( this.parameters !== undefined && this._transformed !== true ) {

			const parameters = this.parameters;

			for ( const key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		// for simplicity the code assumes attributes are not shared across geometries, see #15811

		data.data = { attributes: {} };

		const index = this.index;

		if ( index !== null ) {

			data.data.index = {
				type: index.array.constructor.name,
				array: Array.prototype.slice.call( index.array )
			};

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];

			data.data.attributes[ key ] = attribute.toJSON( data.data );

		}

		const morphAttributes = {};
		let hasMorphAttributes = false;

		for ( const key in this.morphAttributes ) {

			const attributeArray = this.morphAttributes[ key ];

			const array = [];

			for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

				const attribute = attributeArray[ i ];

				array.push( attribute.toJSON( data.data ) );

			}

			if ( array.length > 0 ) {

				morphAttributes[ key ] = array;

				hasMorphAttributes = true;

			}

		}

		if ( hasMorphAttributes ) {

			data.data.morphAttributes = morphAttributes;
			data.data.morphTargetsRelative = this.morphTargetsRelative;

		}

		const groups = this.groups;

		if ( groups.length > 0 ) {

			data.data.groups = JSON.parse( JSON.stringify( groups ) );

		}

		const boundingSphere = this.boundingSphere;

		if ( boundingSphere !== null ) {

			data.data.boundingSphere = boundingSphere.toJSON();

		}

		return data;

	}

	/**
	 * Returns a new geometry with copied values from this instance.
	 *
	 * @return {BufferGeometry} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given geometry to this instance.
	 *
	 * @param {BufferGeometry} source - The geometry to copy.
	 * @return {BufferGeometry} A reference to this instance.
	 */
	copy( source ) {

		// reset

		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		this.boundingBox = null;
		this.boundingSphere = null;

		// used for storing cloned, shared data

		const data = {};

		// name

		this.name = source.name;

		// index

		const index = source.index;

		if ( index !== null ) {

			this.setIndex( index.clone() );

		}

		// attributes

		const attributes = source.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];
			this.setAttribute( name, attribute.clone( data ) );

		}

		// morph attributes

		const morphAttributes = source.morphAttributes;

		for ( const name in morphAttributes ) {

			const array = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, l = morphAttribute.length; i < l; i ++ ) {

				array.push( morphAttribute[ i ].clone( data ) );

			}

			this.morphAttributes[ name ] = array;

		}

		this.morphTargetsRelative = source.morphTargetsRelative;

		// groups

		const groups = source.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			this.addGroup( group.start, group.count, group.materialIndex );

		}

		// bounding box

		const boundingBox = source.boundingBox;

		if ( boundingBox !== null ) {

			this.boundingBox = box3Copy( boundingBox, new Box3() );

		}

		// bounding sphere

		const boundingSphere = source.boundingSphere;

		if ( boundingSphere !== null ) {

			this.boundingSphere = sphereCopy( boundingSphere, new Sphere() );

		}

		// draw range

		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;

		// user data

		this.userData = source.userData;

		// transformed flag

		this._transformed = source._transformed;

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires BufferGeometry#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export { BufferGeometry };
