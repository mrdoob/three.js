/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

import {
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	Vector3
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

	}

} );

export { LineSegments2 };
