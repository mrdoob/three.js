/**
 * @author oosmoxiecode
 * @author mrdoob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

THREE.TorusGeometry = function ( radius, tube, radialSegments, tubularSegments, arc, closedEnded ) {

	THREE.Geometry.call( this );

	this.type = 'TorusGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		arc: arc,
        closedEnded: closedEnded
	};

	radius = radius || 100;
	tube = tube || 40;
	radialSegments = radialSegments || 8;
	tubularSegments = tubularSegments || 6;
	arc = arc || Math.PI * 2;

	var center = new THREE.Vector3(), uvs = [], normals = [];

	for ( var j = 0; j <= radialSegments; j ++ ) {

		for ( var i = 0; i <= tubularSegments; i ++ ) {

			var u = i / tubularSegments * arc;
			var v = j / radialSegments * Math.PI * 2;

			center.x = radius * Math.cos( u );
			center.y = radius * Math.sin( u );

			var vertex = new THREE.Vector3();
			vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = tube * Math.sin( v );

			this.vertices.push( vertex );

			uvs.push( new THREE.Vector2( i / tubularSegments, j / radialSegments ) );
			normals.push( vertex.clone().sub( center ).normalize() );

		}

	}

	for ( var j = 1; j <= radialSegments; j ++ ) {

		for ( var i = 1; i <= tubularSegments; i ++ ) {

			var a = ( tubularSegments + 1 ) * j + i - 1;
			var b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
			var c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
			var d = ( tubularSegments + 1 ) * j + i;

			var face = new THREE.Face3( a, b, d, [ normals[ a ].clone(), normals[ b ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ d ].clone() ] );

			face = new THREE.Face3( b, c, d, [ normals[ b ].clone(), normals[ c ].clone(), normals[ d ].clone() ] );
			this.faces.push( face );
			this.faceVertexUvs[ 0 ].push( [ uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );

		}

	}

    if (closedEnded) {
        var startCenter = new THREE.Vector3(radius,0,0);
        var centerIndex = this.vertices.length;
        this.vertices.push( startCenter );
        var normal = new THREE.Vector3(0,0,-1);
	    for ( var j = 0; j < radialSegments; j ++ ) {
            var v1 = j*(tubularSegments+1);
            var v2 = (j+1)*(tubularSegments+1);
            var v3 = centerIndex;
            var uv1 = new THREE.Vector2( 0, 1 );
            var uv2 = new THREE.Vector2( 1, 1 );
            var uv3 = new THREE.Vector2( 0, 0 );
            face = new THREE.Face3( v1, v2, v3, [normal.clone(), normal.clone(), normal.clone() ] );
            this.faces.push( face );
            this.faceVertexUvs[0].push( [ uv1, uv2, uv3 ] );
        }
        
        var centerIndex = this.vertices.length;
        var endCenter = new THREE.Vector3( radius * Math.cos( arc ), radius*Math.sin( arc ), 0 );        
        this.vertices.push( endCenter );
        normal = new THREE.Vector3(0,0,1);
	    for ( var j = 0; j < radialSegments; j ++ ) {
            var v1 = (j+1)*(tubularSegments+1)-1;
            var v2 = (j+2)*(tubularSegments+1)-1;
            var v3 = centerIndex;
            var uv1 = new THREE.Vector2( 0, 1 );
            var uv2 = new THREE.Vector2( 1, 1 );
            var uv3 = new THREE.Vector2( 0, 0 );
            face = new THREE.Face3( v1, v2, v3, [normal.clone(), normal.clone(), normal.clone() ] );
            this.faces.push( face );
            this.faceVertexUvs[0].push( [ uv1, uv2, uv3 ] );
        }
        
    }

	this.computeFaceNormals();

};

THREE.TorusGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry;
