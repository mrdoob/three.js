import {
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	MathUtils,
	Mesh,
	Line2NodeMaterial,
	Vector3,
	box3ApplyMatrix4,
	box3Copy,
	box3Create,
	box3DistanceToPoint,
	box3ExpandByScalar,
	line3ApplyMatrix4,
	line3At,
	line3ClosestPointToPointParameter,
	line3Create,
	mat4Create,
	mat4MultiplyMatrices,
	rayAt,
	rayDistanceSqToSegment,
	rayIntersectsBox,
	rayIntersectsSphere,
	sphereApplyMatrix4,
	sphereCopy,
	sphereCreate,
	sphereDistanceToPoint,
	vec2Create,
	vec2Set,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3DistanceTo,
	vec3FromBufferAttribute,
	vec4ApplyMatrix4,
	vec4Create,
	vec4FromBufferAttribute,
	vec4Lerp,
	vec4MultiplyScalar,
	vec4Set
} from 'three/webgpu';
import { LineSegmentsGeometry } from '../LineSegmentsGeometry.js';

const _start = /*@__PURE__*/ vec3Create();
const _end = /*@__PURE__*/ vec3Create();

const _start4 = /*@__PURE__*/ vec4Create();
const _end4 = /*@__PURE__*/ vec4Create();

const _ssOrigin = /*@__PURE__*/ vec4Create();
const _ssOrigin3 = /*@__PURE__*/ vec3Create();
const _mvMatrix = /*@__PURE__*/ mat4Create();
const _line = /*@__PURE__*/ line3Create();
const _closestPoint = /*@__PURE__*/ vec3Create();

const _box = /*@__PURE__*/ box3Create();
const _sphere = /*@__PURE__*/ sphereCreate();
const _clipToWorldVector = /*@__PURE__*/ vec4Create();
const _viewport = /*@__PURE__*/ vec4Create();

let _ray, _lineWidth;

// Returns the margin required to expand by in world space given the distance from the camera,
// line width, resolution, and camera projection
function getWorldSpaceHalfWidth( camera, distance, resolution ) {

	// transform into clip space, adjust the x and y values by the pixel width offset, then
	// transform back into world space to get world offset. Note clip space is [-1, 1] so full
	// width does not need to be halved.
	vec4Set( 0, 0, - distance, 1.0, _clipToWorldVector );
	vec4ApplyMatrix4( _clipToWorldVector, camera.projectionMatrix, _clipToWorldVector );
	vec4MultiplyScalar( _clipToWorldVector, 1.0 / _clipToWorldVector.w, _clipToWorldVector );
	_clipToWorldVector.x = _lineWidth / resolution.x;
	_clipToWorldVector.y = _lineWidth / resolution.y;
	vec4ApplyMatrix4( _clipToWorldVector, camera.projectionMatrixInverse, _clipToWorldVector );
	vec4MultiplyScalar( _clipToWorldVector, 1.0 / _clipToWorldVector.w, _clipToWorldVector );

	return Math.abs( Math.max( _clipToWorldVector.x, _clipToWorldVector.y ) );

}

function raycastWorldUnits( lineSegments, intersects ) {

	const matrixWorld = lineSegments.matrixWorld;
	const geometry = lineSegments.geometry;
	const instanceStart = geometry.attributes.instanceStart;
	const instanceEnd = geometry.attributes.instanceEnd;
	const segmentCount = Math.min( geometry.instanceCount, instanceStart.count );

	for ( let i = 0, l = segmentCount; i < l; i ++ ) {

		vec3FromBufferAttribute( instanceStart, i, _line.start );
		vec3FromBufferAttribute( instanceEnd, i, _line.end );

		line3ApplyMatrix4( _line, matrixWorld, _line );

		const pointOnLine = new Vector3();
		const point = new Vector3();

		rayDistanceSqToSegment( _ray, _line.start, _line.end, point, pointOnLine );
		const isInside = vec3DistanceTo( point, pointOnLine ) < _lineWidth * 0.5;

		if ( isInside ) {

			intersects.push( {
				point,
				pointOnLine,
				distance: vec3DistanceTo( _ray.origin, point ),
				object: lineSegments,
				face: null,
				faceIndex: i,
				uv: null,
				uv1: null,
			} );

		}

	}

}

function raycastScreenSpace( lineSegments, camera, intersects ) {

	const projectionMatrix = camera.projectionMatrix;
	const matrixWorld = lineSegments.matrixWorld;

	const resolution = lineSegments._resolution;

	const geometry = lineSegments.geometry;
	const instanceStart = geometry.attributes.instanceStart;
	const instanceEnd = geometry.attributes.instanceEnd;
	const segmentCount = Math.min( geometry.instanceCount, instanceStart.count );

	const near = - camera.near;

	//

	// pick a point 1 unit out along the ray to avoid the ray origin
	// sitting at the camera origin which will cause "w" to be 0 when
	// applying the projection matrix.
	rayAt( _ray, 1, _ssOrigin );

	// ndc space [ - 1.0, 1.0 ]
	_ssOrigin.w = 1;
	vec4ApplyMatrix4( _ssOrigin, camera.matrixWorldInverse, _ssOrigin );
	vec4ApplyMatrix4( _ssOrigin, projectionMatrix, _ssOrigin );
	vec4MultiplyScalar( _ssOrigin, 1 / _ssOrigin.w, _ssOrigin );

	// screen space
	_ssOrigin.x *= resolution.x / 2;
	_ssOrigin.y *= resolution.y / 2;
	_ssOrigin.z = 0;

	vec3Copy( _ssOrigin, _ssOrigin3 );

	mat4MultiplyMatrices( camera.matrixWorldInverse, matrixWorld, _mvMatrix );

	for ( let i = 0, l = segmentCount; i < l; i ++ ) {

		vec4FromBufferAttribute( instanceStart, i, _start4 );
		vec4FromBufferAttribute( instanceEnd, i, _end4 );

		_start4.w = 1;
		_end4.w = 1;

		// camera space
		vec4ApplyMatrix4( _start4, _mvMatrix, _start4 );
		vec4ApplyMatrix4( _end4, _mvMatrix, _end4 );

		// skip the segment if it's entirely behind the camera
		const isBehindCameraNear = _start4.z > near && _end4.z > near;
		if ( isBehindCameraNear ) {

			continue;

		}

		// trim the segment if it extends behind camera near
		if ( _start4.z > near ) {

			const deltaDist = _start4.z - _end4.z;
			const t = ( _start4.z - near ) / deltaDist;
			vec4Lerp( _start4, _end4, t, _start4 );

		} else if ( _end4.z > near ) {

			const deltaDist = _end4.z - _start4.z;
			const t = ( _end4.z - near ) / deltaDist;
			vec4Lerp( _end4, _start4, t, _end4 );

		}

		// clip space
		vec4ApplyMatrix4( _start4, projectionMatrix, _start4 );
		vec4ApplyMatrix4( _end4, projectionMatrix, _end4 );

		// ndc space [ - 1.0, 1.0 ]
		vec4MultiplyScalar( _start4, 1 / _start4.w, _start4 );
		vec4MultiplyScalar( _end4, 1 / _end4.w, _end4 );

		// screen space
		_start4.x *= resolution.x / 2;
		_start4.y *= resolution.y / 2;

		_end4.x *= resolution.x / 2;
		_end4.y *= resolution.y / 2;

		// create 2d segment
		vec3Copy( _start4, _line.start );
		_line.start.z = 0;

		vec3Copy( _end4, _line.end );
		_line.end.z = 0;

		// get closest point on ray to segment
		const param = line3ClosestPointToPointParameter( _line, _ssOrigin3, true );
		line3At( _line, param, _closestPoint );

		// check if the intersection point is within clip space
		const zPos = MathUtils.lerp( _start4.z, _end4.z, param );
		const isInClipSpace = zPos >= - 1 && zPos <= 1;

		const isInside = vec3DistanceTo( _ssOrigin3, _closestPoint ) < _lineWidth * 0.5;

		if ( isInClipSpace && isInside ) {

			vec3FromBufferAttribute( instanceStart, i, _line.start );
			vec3FromBufferAttribute( instanceEnd, i, _line.end );

			vec3ApplyMatrix4( _line.start, matrixWorld, _line.start );
			vec3ApplyMatrix4( _line.end, matrixWorld, _line.end );

			const pointOnLine = new Vector3();
			const point = new Vector3();

			rayDistanceSqToSegment( _ray, _line.start, _line.end, point, pointOnLine );

			intersects.push( {
				point: point,
				pointOnLine: pointOnLine,
				distance: vec3DistanceTo( _ray.origin, point ),
				object: lineSegments,
				face: null,
				faceIndex: i,
				uv: null,
				uv1: null,
			} );

		}

	}

}

/**
 * A series of lines drawn between pairs of vertices.
 *
 * This adds functionality beyond {@link LineSegments}, like arbitrary line width and changing width
 * to be in world units. {@link Line2} extends this object, forming a polyline instead of individual
 * segments.
 *
 * This module can only be used with {@link WebGPURenderer}. When using {@link WebGLRenderer},
 * import the class from `lines/LineSegments2.js`.
 *
 * @augments Mesh
 * @three_import import { LineSegments2 } from 'three/addons/lines/webgpu/LineSegments2.js';
 */
class LineSegments2 extends Mesh {

	/**
	 * Constructs a new wide line.
	 *
	 * @param {LineSegmentsGeometry} [geometry] - The line geometry.
	 * @param {Line2NodeMaterial} [material] - The line material.
	 */
	constructor( geometry = new LineSegmentsGeometry(), material = new Line2NodeMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineSegments2 = true;

		this.type = 'LineSegments2';

		this._resolution = vec2Create();

	}

	/**
	 * Computes an array of distance values which are necessary for rendering dashed lines.
	 * For each vertex in the geometry, the method calculates the cumulative length from the
	 * current point to the very beginning of the line.
	 *
	 * @return {LineSegments2} A reference to this instance.
	 */
	computeLineDistances() {

		// for backwards-compatibility, but could be a method of LineSegmentsGeometry...

		const geometry = this.geometry;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;
		const lineDistances = new Float32Array( 2 * instanceStart.count );

		for ( let i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

			vec3FromBufferAttribute( instanceStart, i, _start );
			vec3FromBufferAttribute( instanceEnd, i, _end );

			lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
			lineDistances[ j + 1 ] = lineDistances[ j ] + vec3DistanceTo( _start, _end );

		}

		const instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

		geometry.setAttribute( 'instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
		geometry.setAttribute( 'instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

		return this;

	}

	onBeforeRender( renderer ) {

		renderer.getViewport( _viewport );
		vec2Set( _viewport.z, _viewport.w, this._resolution );

	}

	/**
	 * Computes intersection points between a casted ray and this instance.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		const worldUnits = this.material.worldUnits;
		const camera = raycaster.camera;

		if ( camera === null && ! worldUnits ) {

			console.error( 'LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.' );

		}

		// early out if no resolution has been set (line was not rendered yet)

		if ( worldUnits === false && ( this._resolution.x === 0 || this._resolution.y === 0 ) ) {

			return;

		}

		const threshold = ( raycaster.params.Line2 !== undefined ) ? raycaster.params.Line2.threshold || 0 : 0;

		_ray = raycaster.ray;

		const matrixWorld = this.matrixWorld;
		const geometry = this.geometry;
		const material = this.material;

		_lineWidth = material.linewidth + threshold;

		// check if we intersect the sphere bounds
		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		sphereCopy( geometry.boundingSphere, _sphere );
		sphereApplyMatrix4( _sphere, matrixWorld, _sphere );

		// increase the sphere bounds by the worst case line screen space width
		let sphereMargin;
		if ( worldUnits ) {

			sphereMargin = _lineWidth * 0.5;

		} else {

			const distanceToSphere = Math.max( camera.near, sphereDistanceToPoint( _sphere, _ray.origin ) );
			sphereMargin = getWorldSpaceHalfWidth( camera, distanceToSphere, this._resolution );

		}

		_sphere.radius += sphereMargin;

		if ( rayIntersectsSphere( _ray, _sphere ) === false ) {

			return;

		}

		// check if we intersect the box bounds
		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		box3Copy( geometry.boundingBox, _box );
		box3ApplyMatrix4( _box, matrixWorld, _box );

		// increase the box bounds by the worst case line width
		let boxMargin;
		if ( worldUnits ) {

			boxMargin = _lineWidth * 0.5;

		} else {

			const distanceToBox = Math.max( camera.near, box3DistanceToPoint( _box, _ray.origin ) );
			boxMargin = getWorldSpaceHalfWidth( camera, distanceToBox, this._resolution );

		}

		box3ExpandByScalar( _box, boxMargin, _box );

		if ( rayIntersectsBox( _ray, _box ) === false ) {

			return;

		}

		if ( worldUnits ) {

			raycastWorldUnits( this, intersects );

		} else {

			raycastScreenSpace( this, camera, intersects );

		}

	}

}

export { LineSegments2 };
