/**
 * Octahedrons have 8 sides. This octahedron supports subdivision.
 * 
 * Vertices have 'smooth' normals, 
 * to make a sharp edge choose a material that uses face normals instead.
 *
 * @author daniel.deady@knectar.com
 * @param radius
 * @param detail Final number of triangles = 4^detail * 8
 */

THREE.OctahedronGeometry = function ( radius, detail ) {

	THREE.Geometry.call( this );

	detail = detail || 0;

	var that = this; // ugly scope hack

	prepare( new THREE.Vector3( +1, 0, 0 ) ); // right
	prepare( new THREE.Vector3( -1, 0, 0 ) ); // left
	prepare( new THREE.Vector3( 0, +1, 0 ) ); // up
	prepare( new THREE.Vector3( 0, -1, 0 ) ); // down
	prepare( new THREE.Vector3( 0, 0, +1 ) ); // front
	prepare( new THREE.Vector3( 0, 0, -1 ) ); // back
	var midpoints = [], p = this.vertices;

	// careful to output faces counter-clockwise, that is required for meshes
	make( p[0], p[2], p[4], detail );
	make( p[0], p[4], p[3], detail );
	make( p[0], p[3], p[5], detail );
	make( p[0], p[5], p[2], detail );
	make( p[1], p[2], p[5], detail );
	make( p[1], p[5], p[3], detail );
	make( p[1], p[3], p[4], detail );
	make( p[1], p[4], p[2], detail );

	/**
	 * Project vector onto sphere's surface
	 */
	function prepare( vector ) {

		var normal = vector.clone().normalize();
		var vertex = new THREE.Vertex( normal.clone().multiplyScalar( radius ) );
		vertex.index = that.vertices.push( vertex ) - 1;

		// Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.
		var u = azimuth( vector ) / 2 / Math.PI + 0.5;
		var v = inclination( vector ) / Math.PI + 0.5;
		vertex.uv = new THREE.UV( u, v );

		return vertex;

	}

	/**
	 * Approximate a curved face with recursively sub-divided triangles.
	 */
	function make( v1, v2, v3, detail ) {

		if ( detail < 1 ) {

			var face = new THREE.Face3( v1.index, v2.index, v3.index, [ v1.position, v2.position, v3.position ] );
			face.centroid.addSelf( v1.position ).addSelf( v2.position ).addSelf( v3.position ).divideScalar( 3 );
			face.normal = face.centroid.clone().normalize();
			that.faces.push( face );

			var azi = azimuth( face.centroid );
			that.faceVertexUvs[ 0 ].push( [ 
				correctUV( v1.uv, v1.position, azi ),
				correctUV( v2.uv, v2.position, azi ),
				correctUV( v3.uv, v3.position, azi )
			] );

		}
		else {

			detail -= 1;
			// split triangle into 4 smaller triangles
			make( v1, midpoint( v1, v2 ), midpoint( v1, v3 ), detail ); // top quadrant
			make( midpoint( v1, v2 ), v2, midpoint( v2, v3 ), detail ); // left quadrant
			make( midpoint( v1, v3 ), midpoint( v2, v3 ), v3, detail ); // right quadrant
			make( midpoint( v1, v2 ), midpoint( v2, v3 ), midpoint( v1, v3 ), detail ); // center quadrant

		}

	}

	function midpoint( v1, v2 ) {

		if ( !midpoints[ v1.index ] ) midpoints[ v1.index ] = [];
		if ( !midpoints[ v2.index ] ) midpoints[ v2.index ] = [];
		var mid = midpoints[ v1.index ][ v2.index ];
		if ( mid === undefined ) {
			// generate mean point and project to surface with prepare()
			midpoints[ v1.index ][ v2.index ] = midpoints[ v2.index ][ v1.index ] = mid = prepare( 
				new THREE.Vector3().add( v1.position, v2.position ).divideScalar( 2 ) 
			);
		}
		return mid;

	}

	/**
	 * Angle around the Y axis, counter-clockwise when looking from above.
	 */
	function azimuth( vector ) {

		return Math.atan2( vector.z, -vector.x );

	}

	/**
	 * Angle above the XZ plane.
	 */
	function inclination( vector ) {

		return Math.atan2( -vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

	}

	/**
	 * Texture fixing helper. Spheres have some odd behaviours.
	 */
	function correctUV( uv, vector, azimuth ) {

		if ( (azimuth < 0) && (uv.u === 1) ) uv = new THREE.UV( uv.u - 1, uv.v );
		if ( (vector.x === 0) && (vector.z === 0) ) uv = new THREE.UV( azimuth / 2 / Math.PI + 0.5, uv.v );
		return uv;

	}

	this.boundingSphere = { radius: radius };

};

THREE.OctahedronGeometry.prototype = new THREE.Geometry();
THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry;
