/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

THREE.BoxGeometry2 = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	var scope = this;

	this.width = width;
	this.height = height;
	this.depth = depth;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;
	this.depthSegments = depthSegments || 1;

	var width_half = this.width / 2;
	var height_half = this.height / 2;
	var depth_half = this.depth / 2;

	var vector = new THREE.Vector3();

	var vectors = [];
	var vertices = [];

	var addVertex = function ( a, b, c ) {

		vertices.push( vectors[ a ], vectors[ a + 1 ], vectors[ a + 2 ] );
		vertices.push( vectors[ b ], vectors[ b + 1 ], vectors[ b + 2 ] );
		vertices.push( vectors[ c ], vectors[ c + 1 ], vectors[ c + 2 ] );

	};

	buildPlane( 'z', 'y', - 1, - 1, this.depth, this.height, width_half, 0 ); // px
	buildPlane( 'z', 'y',   1, - 1, this.depth, this.height, - width_half, 1 ); // nx
	buildPlane( 'x', 'z',   1,   1, this.width, this.depth, height_half, 2 ); // py
	buildPlane( 'x', 'z',   1, - 1, this.width, this.depth, - height_half, 3 ); // ny
	buildPlane( 'x', 'y',   1, - 1, this.width, this.height, depth_half, 4 ); // pz
	buildPlane( 'x', 'y', - 1, - 1, this.width, this.height, - depth_half, 5 ); // nz

	function buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {

		var w, ix, iy,
		gridX = scope.widthSegments,
		gridY = scope.heightSegments,
		width_half = width / 2,
		height_half = height / 2,
		offset = vectors.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			gridY = scope.depthSegments;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			gridX = scope.depthSegments;

		}

		var gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		segment_width = width / gridX,
		segment_height = height / gridY,
		normal = new THREE.Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				vectors.push( vector.x, vector.y, vector.z );

			}

		}

		for ( iy = 0; iy < gridY; iy++ ) {

			for ( ix = 0; ix < gridX; ix++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				addVertex( a * 3 + offset, b * 3 + offset, d * 3 + offset );
				addVertex( b * 3 + offset, c * 3 + offset, d * 3 + offset );

			}

		}

	}

	THREE.Geometry2.call( this, vertices.length / 3 );

	this.vertices.set( vertices );

};

THREE.BoxGeometry2.prototype = Object.create( THREE.Geometry2.prototype );
THREE.BoxGeometry2.prototype.constructor = THREE.BoxGeometry2;
