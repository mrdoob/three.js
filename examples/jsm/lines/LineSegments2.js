/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

import {
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	Vector3,
	Matrix4,
	Ray,
	Sphere
} from "../../../build/three.module.js";
import { LineSegmentsGeometry } from "../lines/LineSegmentsGeometry.js";
import { LineMaterial } from "../lines/LineMaterial.js";

var LineSegments2 = function ( geometry, material ) {

	Mesh.call( this );

	this.type = 'LineSegments2';

	this.geometry = geometry !== undefined ? geometry : new LineSegmentsGeometry();
	this.material = material !== undefined ? material : new LineMaterial( { color: Math.random() * 0xffffff } );

};

LineSegments2.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: LineSegments2,

	isLineSegments2: true,

	computeLineDistances: ( function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

		var start = new Vector3();
		var end = new Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;
			var lineDistances = new Float32Array( 2 * instanceStart.data.count );

			for ( var i = 0, j = 0, l = instanceStart.data.count; i < l; i ++, j += 2 ) {

				start.fromBufferAttribute( instanceStart, i );
				end.fromBufferAttribute( instanceEnd, i );

				lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
				lineDistances[ j + 1 ] = lineDistances[ j ] + start.distanceTo( end );

			}

			var instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

			geometry.addAttribute( 'instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
			geometry.addAttribute( 'instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

			return this;

		};

	}() ),

	copy: function ( /* source */ ) {

		// todo

		return this;

	},


	raycast: ( function () {

		var inverseMatrix = new Matrix4();
		var ray = new Ray();
		var sphere = new Sphere();

		return function raycast( raycaster, intersects ) {

			var precision = raycaster.linePrecision;

			// If using a persepective-line material, there is a known precision:
			// This doesn't work correctly though; the collision distance turns out too large.
			if(this.material && this.material.worldlinewidth) precision = this.material.worldlinewidth;

			var geometry = this.geometry;
			var matrixWorld = this.matrixWorld;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();
			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( matrixWorld );
			sphere.radius += precision;

			if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

			inverseMatrix.getInverse( matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			// This was in the orignal Line.js raycast code, but it's correctness is debatable. Line objects
			// have infintesimal width, so exapnding the size of the object should not exapand the width of the line.
			// var localPrecision = precision / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
			//var localPrecisionSq = localPrecision * localPrecision;

			var localPrecisionSq = precision * precision;


			var vStart = new Vector3();
			var vEnd = new Vector3();
			var interSegment = new Vector3();
			var interRay = new Vector3();

	     	// Currently, the geometry is always a LineSegments2 geometry, which uses the instanceStart/instanceEnd to store segment locations
	     	var starts = geometry.attributes.instanceStart;
	     	var ends = geometry.attributes.instanceEnd;

      		for ( var i = 0; i < starts.count; i ++ ) {

		        vStart.fromArray( starts.data.array, i * starts.data.stride + starts.offset );
		        vEnd.fromArray( ends.data.array, i * ends.data.stride + ends.offset );
		        var distSq = ray.distanceSqToSegment( vStart, vEnd, interRay, interSegment );

		        if ( distSq > localPrecisionSq ) continue;

		        interRay.applyMatrix4( this.matrixWorld ); //Move back to world space for distance calculation

		        var distance = raycaster.ray.origin.distanceTo( interRay );

		        if ( distance < raycaster.near || distance > raycaster.far ) continue;

		        intersects.push( {

		          distance: distance,
		          // What do we want? intersection point on the ray or on the segment??
		          // point: raycaster.ray.at( distance ),
		          point: interSegment.clone().applyMatrix4( this.matrixWorld ),
		          transverseDistance: Math.sqrt(distSq),   // Special value indicating the distance of interesection from the ray
		          index: i,
		          face: null,
		          faceIndex: null,
		          object: this
		        } );

      		}

		};

	}() )


} );

export { LineSegments2 };
