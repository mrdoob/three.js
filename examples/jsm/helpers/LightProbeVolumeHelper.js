import {
	BufferAttribute,
	BufferGeometry,
	Line,
	LineBasicMaterial
} from "../../../build/three.module.js";

import { LightProbeHelper } from './LightProbeHelper.js';

/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */

var EDGES = [
	[ 0, 1 ],
	[ 0, 2 ],
	[ 0, 3 ],
	[ 1, 2 ],
	[ 1, 3 ],
	[ 2, 3 ]
];

function LightProbeVolumeHelper( lightProbeVolume, size ) {

	this.lightProbeVolume = lightProbeVolume;
	this.lightProbeHelpers = [];
	this.size = size === undefined ? 1 : size;
	this.showProbes = true;
	this.showCells = false;

	var geometry = new BufferGeometry();
	var material = new LineBasicMaterial( { color: 0xffffff } );

	Line.call( this, geometry, material );

	this.update();

}

LightProbeVolumeHelper.prototype = Object.create( Line.prototype );
LightProbeVolumeHelper.prototype.constructor = LightProbeVolumeHelper;

LightProbeVolumeHelper.prototype.update = function () {

	var probeHelper;

	// Remove old probe and volume helpers.

	while ( this.lightProbeHelpers.length > 0 ) {

		probeHelper = this.lightProbeHelpers.pop();
		this.remove( probeHelper );
		probeHelper.dispose();

	}

	var positionAttribute = this.geometry.getAttribute( 'position' );

	if ( positionAttribute ) {

		positionAttribute.dispose();
		this.geometry.deleteAttribute( 'position' );

	}

	//

	var probes = this.lightProbeVolume.probes;
	var cells = this.lightProbeVolume.cells;

	this.visible = probes.length > 0 && cells.length > 0;

	if ( ! this.visible ) return;

	// Create probe helpers.

	if ( this.showProbes ) {

		for ( var i = 0; i < probes.length; ++ i ) {

			probeHelper = new LightProbeHelper( probes[ i ], this.size );

			this.lightProbeHelpers.push( probeHelper );
			this.add( probeHelper );

		}

	}

	// Create cell helper.

	if ( this.showCells ) {

		var cellsTouched = {};
		var positionArray = [];

		for ( var i = 0; i < cells.length; ++ i ) {

			for ( var j = 0; j < EDGES.length; ++ j ) {

				var a = cells[ i ][ EDGES[ j ][ 0 ] ];
				var b = cells[ i ][ EDGES[ j ][ 1 ] ];

				if ( a < 0 || b < 0 ) continue;

				if ( cellsTouched[ a + ':' + b ] ) continue;

				probes[ a ].position.toArray( positionArray, positionArray.length );
				probes[ b ].position.toArray( positionArray, positionArray.length );

				cellsTouched[ a + ':' + b ] = true;
				cellsTouched[ b + ':' + a ] = true;

			}

		}

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positionArray ), 3 ) );

	}

	return this;

};

LightProbeVolumeHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

	var probeHelper;

	while ( this.lightProbeHelpers.length > 0 ) {

		probeHelper = this.lightProbeHelpers.pop();

		this.remove( probeHelper );
		probeHelper.dispose();

	}

};

export { LightProbeVolumeHelper };
