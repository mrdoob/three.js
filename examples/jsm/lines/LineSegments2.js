import {
	Box3,
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Line3,
	MathUtils,
	Matrix4,
	Mesh,
	Sphere,
	Vector3,
	Vector4
} from 'three';
import { LineSegmentsGeometry } from '../lines/LineSegmentsGeometry.js';
import { LineMaterial } from '../lines/LineMaterial.js';

const _start = new Vector3();
const _end = new Vector3();

const _start4 = new Vector4();
const _end4 = new Vector4();

const _ssOrigin = new Vector4();
const _ssOrigin3 = new Vector3();
const _mvMatrix = new Matrix4();
const _line = new Line3();
const _closestPoint = new Vector3();

const _box = new Box3();
const _sphere = new Sphere();
const _clipToWorldVector = new Vector4();

// Returns the margin required to expand by in world space given the distance from the camera,
// line width, resolution, and camera projection
function getWorldSpaceHalfWidth( camera, distance, lineWidth, resolution ) {

	// transform into clip space, adjust the x and y values by the pixel width offset, then
	// transform back into world space to get world offset. Note clip space is [-1, 1] so full
	// width does not need to be halved.
	_clipToWorldVector.set( 0, 0, - distance, 1.0 ).applyMatrix4( camera.projectionMatrix );
	_clipToWorldVector.multiplyScalar( 1.0 / _clipToWorldVector.w );
	_clipToWorldVector.x = lineWidth / resolution.width;
	_clipToWorldVector.y = lineWidth / resolution.height;
	_clipToWorldVector.applyMatrix4( camera.projectionMatrixInverse );
	_clipToWorldVector.multiplyScalar( 1.0 / _clipToWorldVector.w );

	return Math.abs( Math.max( _clipToWorldVector.x, _clipToWorldVector.y ) );

}

function getPointAndPointOnLine( { ray, instanceStart, instanceEnd, matrixWorld, point, pointOnLine, i } ) {

	_line.start.fromBufferAttribute( instanceStart, i );
	_line.end.fromBufferAttribute( instanceEnd, i );

	_line.start.applyMatrix4( matrixWorld );
	_line.end.applyMatrix4( matrixWorld );

	ray.distanceSqToSegment( _line.start, _line.end, point, pointOnLine );

}

function computeStartEnd( instanceStart, instanceEnd, i ) {

	_start4.fromBufferAttribute( instanceStart, i );
	_end4.fromBufferAttribute( instanceEnd, i );

	_start4.w = 1;
	_end4.w = 1;

	// camera space
	_start4.applyMatrix4( _mvMatrix );
	_end4.applyMatrix4( _mvMatrix );

}

function trimSegment( near ) {

	// trim the segment if it extends behind camera near
	if ( _start4.z > near ) {

		const deltaDist = _start4.z - _end4.z;
		const t = ( _start4.z - near ) / deltaDist;
		_start4.lerp( _end4, t );

	} else if ( _end4.z > near ) {

		const deltaDist = _end4.z - _start4.z;
		const t = ( _end4.z - near ) / deltaDist;
		_end4.lerp( _start4, t );

	}

}

function isInClipSpace( projectionMatrix, resolution ) {

	// clip space
	_start4.applyMatrix4( projectionMatrix );
	_end4.applyMatrix4( projectionMatrix );
	// ndc space [ - 1.0, 1.0 ]
	_start4.multiplyScalar( 1 / _start4.w );
	_end4.multiplyScalar( 1 / _end4.w );
	// screen space
	_start4.x *= resolution.x / 2;
	_start4.y *= resolution.y / 2;
	_end4.x *= resolution.x / 2;
	_end4.y *= resolution.y / 2;
	// create 2d segment
	_line.start.copy( _start4 );
	_line.start.z = 0;
	_line.end.copy( _end4 );
	_line.end.z = 0;
	// get closest point on ray to segment
	const param = _line.closestPointToPointParameter( _ssOrigin3, true );
	_line.at( param, _closestPoint );
	// check if the intersection point is within clip space
	const zPos = MathUtils.lerp( _start4.z, _end4.z, param );
	return zPos >= - 1 && zPos <= 1;

}



class LineSegments2 extends Mesh {

	constructor( geometry = new LineSegmentsGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.type = 'LineSegments2';

	}

	// for backwards-compatability, but could be a method of LineSegmentsGeometry...

	computeLineDistances() {

		const geometry = this.geometry;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;
		const lineDistances = new Float32Array( 2 * instanceStart.count );

		for ( let i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

			_start.fromBufferAttribute( instanceStart, i );
			_end.fromBufferAttribute( instanceEnd, i );

			lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
			lineDistances[ j + 1 ] = lineDistances[ j ] + _start.distanceTo( _end );

		}

		const instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

		geometry.setAttribute( 'instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
		geometry.setAttribute( 'instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

		return this;

	}

	raycast( raycaster, intersects ) {

		if ( raycaster.camera === null ) {

			console.error( 'LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.' );

		}

		const threshold = ( raycaster.params.Line2 !== undefined ) ? raycaster.params.Line2.threshold || 0 : 0;

		const ray = raycaster.ray;
		const camera = raycaster.camera;
		const projectionMatrix = camera.projectionMatrix;

		const matrixWorld = this.matrixWorld;
		const geometry = this.geometry;
		const material = this.material;
		const resolution = material.resolution;
		const lineWidth = material.linewidth + threshold;
		const worldUnits = this.material.worldUnits;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;

		// camera forward is negative
		const near = - camera.near;

		//

		// check if we intersect the sphere bounds
		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		_sphere.copy( geometry.boundingSphere ).applyMatrix4( matrixWorld );
		const distanceToSphere = Math.max( camera.near, _sphere.distanceToPoint( ray.origin ) );

		// increase the sphere bounds by the worst case line screen space width
		let sphereMargin;
		if ( worldUnits ) {

			sphereMargin = lineWidth * 0.5;

		} else {

			sphereMargin = getWorldSpaceHalfWidth( camera, distanceToSphere, lineWidth, resolution );

		}

		_sphere.radius += sphereMargin;

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) {

			return;

		}

		//

		// check if we intersect the box bounds
		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		_box.copy( geometry.boundingBox ).applyMatrix4( matrixWorld );
		const distanceToBox = Math.max( camera.near, _box.distanceToPoint( ray.origin ) );

		// increase the box bounds by the worst case line screen space width
		let boxMargin;
		if ( this.material.worldUnits ) {

			boxMargin = lineWidth * 0.5;

		} else {

			boxMargin = getWorldSpaceHalfWidth( camera, distanceToBox, lineWidth, resolution );

		}

		_box.expandByScalar( boxMargin );

		if ( raycaster.ray.intersectsBox( _box ) === false ) {

			return;

		}

		//

		let faceIndex;
		let point;
		let pointOnLine;
		let dist = Infinity;
		let isLoopingInside = false; // is true while isInside == true
		_mvMatrix.multiplyMatrices( camera.matrixWorldInverse, matrixWorld );

		if ( worldUnits ) {

			for ( let i = 0, l = instanceStart.count; i < l; i ++ ) {

				computeStartEnd( instanceStart, instanceEnd, i );

				// skip the segment if it's entirely behind the camera
				const isBehindCameraNear = _start4.z > near && _end4.z > near;
				if ( isBehindCameraNear ) {

					continue;

				}

				// trim the segment if it extends behind camera near
				trimSegment( near );

				if ( ! isInClipSpace( projectionMatrix, resolution ) ) {

					continue;

				}

				const pointOnLineTmp = new Vector3();
				const pointTmp = new Vector3();
				getPointAndPointOnLine( {

					ray,
					instanceStart,
					instanceEnd, matrixWorld,
					point: pointTmp,
					pointOnLine: pointOnLineTmp,
					i

				} );
				const distTmp = pointTmp.distanceTo( pointOnLineTmp );
				const isInside = distTmp < lineWidth * 0.5;

				if ( ! isInside && isLoopingInside ) {

					intersects.push( {
						point: point,
						pointOnLine: pointOnLine,
						distance: ray.origin.distanceTo( point ),
						object: this,
						face: null,
						faceIndex: faceIndex,
						uv: null,
						uv2: null,
					} );
					dist = Infinity;
					isLoopingInside = false;

				}

				if ( isInside && distTmp < dist ) {

					isLoopingInside = true;
					faceIndex = i;
					dist = distTmp;
					point = pointTmp;
					pointOnLine = pointOnLineTmp;

					if ( faceIndex === l - 1 ) {

						intersects.push( {
							point: point,
							pointOnLine: pointOnLine,
							distance: ray.origin.distanceTo( point ),
							object: this,
							face: null,
							faceIndex: faceIndex,
							uv: null,
							uv2: null,
						} );

					}

				}

			}

		} else {

			// pick a point 1 unit out along the ray to avoid the ray origin
			// sitting at the camera origin which will cause "w" to be 0 when
			// applying the projection matrix.
			ray.at( 1, _ssOrigin );

			// ndc space [ - 1.0, 1.0 ]
			_ssOrigin.w = 1;
			_ssOrigin.applyMatrix4( camera.matrixWorldInverse );
			_ssOrigin.applyMatrix4( projectionMatrix );
			_ssOrigin.multiplyScalar( 1 / _ssOrigin.w );

			// screen space
			_ssOrigin.x *= resolution.x / 2;
			_ssOrigin.y *= resolution.y / 2;
			_ssOrigin.z = 0;

			_ssOrigin3.copy( _ssOrigin );

			for ( let i = 0, l = instanceStart.count; i < l; i ++ ) {

				computeStartEnd( instanceStart, instanceEnd, i );

			// skip the segment if it's entirely behind the camera
			const isBehindCameraNear = _start4.z > near && _end4.z > near;
			if ( isBehindCameraNear ) {

					continue;

				}

				// trim the segment if it extends behind camera near
				trimSegment( near );

				if ( ! isInClipSpace( projectionMatrix, resolution ) ) {

					continue;

				}

				const distTmp = _ssOrigin3.distanceTo( _closestPoint );
				const isInside = distTmp < lineWidth * 0.5;

				if ( ! isInside && isLoopingInside ) {

					intersects.push( {
						point: point,
						pointOnLine: pointOnLine,
						distance: ray.origin.distanceTo( point ),
						object: this,
						face: null,
						faceIndex: faceIndex,
						uv: null,
						uv2: null,
					} );
					dist = Infinity;
					isLoopingInside = false;

				}

				if ( isInside && distTmp < dist ) {

					isLoopingInside = true;
					pointOnLine = new Vector3();
					point = new Vector3();
					getPointAndPointOnLine( {
						ray,
						instanceStart,
						instanceEnd,
						matrixWorld,
						point,
						pointOnLine,
						i
					} );
					faceIndex = i;
					dist = distTmp;

					// handling end of loop
					if ( faceIndex === l - 1 ) {

						intersects.push( {
							point: point,
							pointOnLine: pointOnLine,
							distance: ray.origin.distanceTo( point ),
							object: this,
							face: null,
							faceIndex: faceIndex,
							uv: null,
							uv2: null,

						} );

					}

				}

			}

		}

	}

}

LineSegments2.prototype.isLineSegments2 = true;

export { LineSegments2 };
