/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

THREE.PlaneBufferGeometry = function ( width, height, widthSegments, heightSegments, normal, center ) {

	THREE.BufferGeometry.call( this );

	this.type = 'PlaneBufferGeometry';

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		normal: normal,
		cetner: center
	};
	
	if ( normal === undefined ) {
		
		normal = new THREE.Vector3( 0, 0, 1 );
		
	} else {
		
		normal = normal.normalize( );
		
	}
	
	if ( center === undefined ) {
		
		center = new THREE.Vector3( 0, 0, 0 );
		
	}
	
	// create an arbitrary (but nonparalell) vector to cross with the normal to get a vector in the desired plane.
	var nonParallel;
	
	if ( normal.x === 0 && normal.z === 0 ) {
		
		nonParallel = new THREE.Vector3( 0, 0, 1 );
		
	} else {
		
		nonParallel = new THREE.Vector3( 0, 1, 0 );
		
	}
	
	// note that the primaryVector will be ( 1, 0, 0 ) if the normal is not passed, resulting in the 
	// same behaviour as before the option to change the normal was added.
	var primaryVector = nonParallel.cross( normal ).normalize( );
	
	// as above, this will be ( 0, -1, 0 ) if the normal is not passed, resulting in the previous behaviour.
	// primary and normal are perpendicular unit vectors, so this is already normalized.
	var secondaryVector = primaryVector.clone( ).cross( normal );
	
	// scratch vectors for calculating vertex position
	var primaryScratch = new THREE.Vector3( );
	var secondaryScratch = new THREE.Vector3( );

	var width_half = width / 2;
	var height_half = height / 2;

	var gridX = Math.floor( widthSegments ) || 1;
	var gridY = Math.floor( heightSegments ) || 1;

	var gridX1 = gridX + 1;
	var gridY1 = gridY + 1;

	var segment_width = width / gridX;
	var segment_height = height / gridY;

	var vertices = new Float32Array( gridX1 * gridY1 * 3 );
	var normals = new Float32Array( gridX1 * gridY1 * 3 );
	var uvs = new Float32Array( gridX1 * gridY1 * 2 );

	var offset = 0;
	var offset2 = 0;

	for ( var iy = 0; iy < gridY1; iy ++ ) {

		var y = iy * segment_height - height_half;

		for ( var ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;
			
			primaryScratch.copy( primaryVector ).multiplyScalar( x );
			secondaryScratch.copy( secondaryVector ).multiplyScalar( y );
			primaryScratch.add( secondaryScratch ).add( center );

			vertices[ offset     ] = primaryScratch.x;
			vertices[ offset + 1 ] = primaryScratch.y;
			vertices[ offset + 2 ] = primaryScratch.z;

			normals[ offset     ] = normal.x;
			normals[ offset + 1 ] = normal.y;
			normals[ offset + 2 ] = normal.z;

			uvs[ offset2 ] = ix / gridX;
			uvs[ offset2 + 1 ] = 1 - ( iy / gridY );

			offset += 3;
			offset2 += 2;

		}

	}

	offset = 0;

	var indices = new ( ( vertices.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( gridX * gridY * 6 );

	for ( var iy = 0; iy < gridY; iy ++ ) {

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			var d = ( ix + 1 ) + gridX1 * iy;

			indices[ offset ] = a;
			indices[ offset + 1 ] = b;
			indices[ offset + 2 ] = d;

			indices[ offset + 3 ] = b;
			indices[ offset + 4 ] = c;
			indices[ offset + 5 ] = d;

			offset += 6;

		}

	}

	this.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

};

THREE.PlaneBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.PlaneBufferGeometry.prototype.constructor = THREE.PlaneBufferGeometry;

THREE.PlaneBufferGeometry.prototype.clone = function () {

	var geometry = new THREE.PlaneBufferGeometry(
		this.parameters.width,
		this.parameters.height,
		this.parameters.widthSegments,
		this.parameters.heightSegments,
		this.parameters.normal.clone(),
		this.parameters.center.clone()
	);

	geometry.copy( this );

	return geometry;

};
