/* global triangulate */

import {
	Box3,
	Object3D,
	LightProbe,
	Matrix3,
	Vector3
} from '../../../build/three.module.js';

import { LightProbeGenerator } from './LightProbeGenerator.js';

import { triangulate } from '../libs/delaunay-triangulate.module.js';

/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */

// A LightProbeVolume is a searchable collection of LightProbe
// instances, supporting interpolation of SH information for
// any position in the volume.
//
// References:
// - http://twvideo01.ubm-us.net/o1/vault/gdc2012/slides/Programming%20Track/Cupisz_Robert_Light_Probe_Interpolation.pdf
// - https://en.wikipedia.org/wiki/Barycentric_coordinate_system

function LightProbeVolume () {

	Object3D.call( this );

	this.type = 'LightProbeVolume';

	this.bounds = new Box3();

	this.countX = 0;
	this.countY = 0;
	this.countZ = 0;

	this.probes = [];

	this.cells = [];
	this.cellMatrices = [];
	this.cellCache = new WeakMap();

}

LightProbeVolume.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: LightProbeVolume,

	isLightProbeVolume: true,

	makeEmpty: function () {

		this.bounds.makeEmpty();
		this.countX = this.countY = this.countZ = 0;
		this.probes.length = 0;
		this.cells.length = 0;
		this.cellMatrices.length = 0;
		this.cellCache = new WeakMap();

		return this;

	},

	setFromBounds: function ( bounds, countX, countY, countZ ) {

		this.makeEmpty();

		this.bounds = bounds;

		this.countX = countX;
		this.countY = countY;
		this.countZ = countZ;

		var min = bounds.min;
		var max = bounds.max;

		var spanX = max.x - min.x;
		var spanY = max.y - min.y;
		var spanZ = max.z - min.z;

		for ( var x = 0; x < countX; x ++ ) {

			for ( var y = 0; y < countY; y ++ ) {

				for ( var z = 0; z < countZ; z ++ ) {

					var probe = new LightProbe();

					probe.position.set(

						min.x + spanX * x / ( countX - 1 ),
						min.y + spanY * y / ( countY - 1 ),
						min.z + spanZ * z / ( countZ - 1 )

					);

					this.probes.push( probe );

				}

			}

		}

		return this;

	},

	update: (function () {

		var coords = [];
		var position = new Vector3();

		return function ( mesh, target ) {

			mesh.getWorldPosition( position );
			this.worldToLocal( position );

			var cellIndex = this._findCell( mesh, position );

			if ( cellIndex === undefined ) return this;

			var cell = this.cells[ cellIndex ];

			this._getBarycentricCoordinates( position, cellIndex, coords );

			target.zero()
				.addScaledSH( this.probes[ cell[ 0 ] ].sh, coords[ 0 ] )
				.addScaledSH( this.probes[ cell[ 1 ] ].sh, coords[ 1 ] )
				.addScaledSH( this.probes[ cell[ 2 ] ].sh, coords[ 2 ] )
				.addScaledSH( this.probes[ cell[ 3 ] ].sh, coords[ 3 ] );

			return this;

		};

	})(),

	build: function () {

		// _build() accepts a 'cells' argument and isn't meant for use outside of
		// this class. The public build() method takes no arguments.
		this._build();

		return this;

	},

	_build: function ( cells ) {

		var positions = [];

		for ( var i = 0; i < this.probes.length; ++ i ) {

			positions.push( this.probes[ i ].position.toArray() );

		}

		this.cells = cells || triangulate( positions );
		this.cellCache = new WeakMap();

		// 3x3 matrices may be used to compute the barycentric coordinates for any
		// point, or to determine whether the point lies within the tetrahedron.
		// See: https://en.wikipedia.org/wiki/Barycentric_coordinate_system
		this.cellMatrices = [];

		for ( var i = 0; i < this.cells.length; ++ i ) {

			var cell = this.cells[ i ];

			var cellMatrix = new Matrix3();

			var x1 = positions[ cell[ 0 ] ][ 0 ];
			var x2 = positions[ cell[ 1 ] ][ 0 ];
			var x3 = positions[ cell[ 2 ] ][ 0 ];
			var x4 = positions[ cell[ 3 ] ][ 0 ];

			var y1 = positions[ cell[ 0 ] ][ 1 ];
			var y2 = positions[ cell[ 1 ] ][ 1 ];
			var y3 = positions[ cell[ 2 ] ][ 1 ];
			var y4 = positions[ cell[ 3 ] ][ 1 ];

			var z1 = positions[ cell[ 0 ] ][ 2 ];
			var z2 = positions[ cell[ 1 ] ][ 2 ];
			var z3 = positions[ cell[ 2 ] ][ 2 ];
			var z4 = positions[ cell[ 3 ] ][ 2 ];

			cellMatrix.set(
				x1 - x4, x2 - x4, x3 - x4,
				y1 - y4, y2 - y4, y3 - y4,
				z1 - z4, z2 - z4, z3 - z4
			);

			// Delaunay tetrahedralization may result in degenerate tetrahedra at
			// the boundaries of the volume, e.g. for coplanar points on the convex
			// hull. Ignore these cells.
			if ( cellMatrix.determinant() === 0 ) {

				this.cellMatrices.push( null );

				continue;

			}

			cellMatrix.getInverse( cellMatrix );

			this.cellMatrices.push( cellMatrix );

		}

		return this;

	},

	bake: function ( renderer, scene, cubeCamera, onProgress ) {

		for ( var i = 0; i < this.probes.length; i ++ ) {

			var probe = this.probes[ i ];

			cubeCamera.position.copy( probe.position );
			cubeCamera.update( renderer, scene );

			probe.sh.copy( LightProbeGenerator.fromCubeRenderTarget( renderer, cubeCamera.renderTarget ).sh );

			if ( onProgress ) onProgress( ( i + 1 ) / this.probes.length );

		}

	},

	_findCell: function ( mesh, position ) {

		// Check the cached cell from the previous lookup first.
		var previousCellIndex = this.cellCache.get( mesh );

		if ( previousCellIndex !== undefined
				&& this._pointInCell( position, previousCellIndex ) ) {

			return previousCellIndex;

		}

		// TODO: Use cell connectivity and barycentric coordinates to
		// walk efficiently from the cached cell.
		for ( var i = 0; i < this.cells.length; ++ i ) {

			if ( i === previousCellIndex ) continue;

			if ( ! this.cellMatrices[ i ] ) continue;

			if ( this._pointInCell( position, i ) ) {

				this.cellCache.set( mesh, i );
				return i;

			}

		}

		return undefined;

	},

	_pointInCell: ( function () {

		var coords = [];

		return function ( point, cellIndex ) {

			this._getBarycentricCoordinates( point, cellIndex, coords );

			return coords[ 0 ] >= 0 && coords[ 1 ] >= 0 && coords[ 2 ] >= 0 && coords[ 3 ] >= 0;

		};

	} )(),

	_getBarycentricCoordinates: ( function () {

		var v = new Vector3();

		return function ( point, cellIndex, coords ) {

			var cell = this.cells[ cellIndex ];
			var cellMatrix = this.cellMatrices[ cellIndex ];

			v.copy( point ).sub( this.probes[ cell[ 3 ] ].position );

			v.applyMatrix3( cellMatrix );

			v.toArray( coords );

			coords[ 3 ] = 1.0 - coords[ 0 ] - coords[ 1 ] - coords[ 2 ];

			return this;

		};

	} )(),

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.probes = source.probes.slice();
		this.cells = source.cells.slice();
		this.cellMatrices = source.cellMatrices.slice();
		this.cellCache = new WeakMap();

		return this;

	},

	toJSON: function ( meta ) {

		var data = Object3D.prototype.toJSON.call( this, meta );

		data.bounds = {
			min: this.bounds.min.toArray(),
			max: this.bounds.max.toArray()
		};

		data.countX = this.countX;
		data.countY = this.countY;
		data.countZ = this.countZ;

		data.cells = JSON.parse( JSON.stringify( this.cells ) );
		data.probes = [];

		var probe;

		for ( var i = 0; i < this.probes.length; ++ i ) {

			probe = this.probes[ i ];
			probe.updateMatrix();

			data.probes.push( {

				sh: probe.sh.toArray(),
				position: probe.position.toArray()

			} );

		}

		return data;

	},

	fromJSON: function ( data ) {

		this.makeEmpty();

		this.bounds.set(
			new Vector3().fromArray( data.bounds.min ),
			new Vector3().fromArray( data.bounds.max )
		);

		this.countX = data.countX;
		this.countY = data.countY;
		this.countZ = data.countZ;

		var probe;

		for ( var i = 0; i < data.probes.length; ++ i ) {

			probe = new LightProbe();
			probe.sh.fromArray( data.probes[ i ].sh );
			probe.position.fromArray( data.probes[ i ].position );

			this.probes.push( probe );

		}

		this._build( data.cells );

		return this;

	}

} );

export { LightProbeVolume };
