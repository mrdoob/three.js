/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

THREE.BoxGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	THREE.Geometry.call( this );

	this.type = 'BoxGeometry';

	this.parameters = {
		width: width,
		height: height,
		depth: depth,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		depthSegments: depthSegments
	};

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;
	this.depthSegments = depthSegments || 1;

	var constructee = this;  // constructee = the instance currently being constructed by the BoxGeometry constructor

	var width_half = width / 2;    // width  = the distance along x in the absolute 3D space
	var height_half = height / 2;  // height = the distance along y in the absolute 3D space
	var depth_half = depth / 2;    // depth  = the distance along z in the absolute 3D space

	buildPlane( 'z', 'y', -1, -1, depth, height, width_half, 0 ); // px
	buildPlane( 'z', 'y',  1, -1, depth, height, -width_half, 1 ); // nx
	buildPlane( 'x', 'z',  1,  1, width, depth, height_half, 2 ); // py
	buildPlane( 'x', 'z',  1, -1, width, depth, -height_half, 3 ); // ny
	buildPlane( 'x', 'y',  1, -1, width, height, depth_half, 4 ); // pz
	buildPlane( 'x', 'y', -1, -1, width, height, -depth_half, 5 ); // nz

	function buildPlane( u, v, uDir, vDir, uDist, vDist, wDist_half, materialIndex ) {

		var w, iu, iv,
			segU = constructee.widthSegments,  // number of segments along u   // width  = x
			segV = constructee.heightSegments, // number of segments along v   // height = y
			uDist_half = uDist / 2,  // the extent of the plane along u, divided by two
			vDist_half = vDist / 2,  // the extent of the plane along v, divided by two
			offset = constructee.vertices.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			segV = constructee.depthSegments;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			segU = constructee.depthSegments;

		}

		var segUi = segU + 1,  // i = inc = incremented (by one)
			segVi = segV + 1,  // i = inc = incremented (by one)
			segmentDist_u = uDist / segU,
			segmentDist_v = vDist / segV,
			normal = new THREE.Vector3();

		normal[ w ] = wDist_half > 0 ? 1 : -1;

		for ( iv = 0; iv < segVi; iv++ ) {

			for ( iu = 0; iu < segUi; iu++ ) {

				var vertex = new THREE.Vector3();
				vertex[ u ] = ( iu * segmentDist_u - uDist_half ) * uDir;
				vertex[ v ] = ( iv * segmentDist_v - vDist_half ) * vDir;
				vertex[ w ] = wDist_half;

				constructee.vertices.push( vertex );

			}

		}

		for ( iv = 0; iv < segV; iv++ ) {

			for ( iu = 0; iu < segU; iu++ ) {

				var a = iu         + segUi *   iv;
				var b = iu         + segUi * ( iv + 1 );
				var c = ( iu + 1 ) + segUi * ( iv + 1 );
				var d = ( iu + 1 ) + segUi *   iv;

				var uva = new THREE.Vector2(   iu       / segU, 1 -   iv       / segV );
				var uvb = new THREE.Vector2(   iu       / segU, 1 - ( iv + 1 ) / segV );
				var uvc = new THREE.Vector2( ( iu + 1 ) / segU, 1 - ( iv + 1 ) / segV );
				var uvd = new THREE.Vector2( ( iu + 1 ) / segU, 1 -   iv       / segV );

				var face1 = new THREE.Face3( a + offset, b + offset, d + offset );
				face1.normal.copy( normal );
				face1.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face1.materialIndex = materialIndex;

				constructee.faces.push( face1 );
				constructee.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

				var face2 = new THREE.Face3( b + offset, c + offset, d + offset );
				face2.normal.copy( normal );
				face2.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
				face2.materialIndex = materialIndex;

				constructee.faces.push( face2 );
				constructee.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

			}

		}

	}

	this.mergeVertices();
};
THREE.BoxGeometry.prototype = Object.create( THREE.Geometry.prototype );
