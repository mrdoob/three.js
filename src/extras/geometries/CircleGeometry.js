/**
 * @author hughes
 */

THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength, innerRadius ) {

    THREE.Geometry.call( this );

    radius = radius || 50;

    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;
    segments = segments !== undefined ? Math.max( 3, segments ) : 8;
    innerRadius = innerRadius !== undefined ? innerRadius : 0;

    if ( innerRadius >= radius ) {
    	console.warn( "CircleGeometry: Can't set the innerRadius to be greater than the radius.");
    	innerRadius = 0;
    }

    var i, uvs = [], center;

    if ( !innerRadius ) {
	    center = new THREE.Vector3();
        var centerUV = new THREE.Vector2( 0.5, 0.5 );

	    this.vertices.push(center);
	    uvs.push( centerUV );
	  }

    for ( i = 0; i <= segments; i ++ ) {

        var vertex;

        if ( innerRadius ) {
        	vertex = new THREE.Vector3();
        	vertex.x = innerRadius * Math.cos( thetaStart + i / segments * thetaLength );
	        vertex.y = innerRadius * Math.sin( thetaStart + i / segments * thetaLength );

	        this.vertices.push( vertex );
	        uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, - ( vertex.y / radius + 1 ) / 2 + 1 ) );
        }
        vertex = new THREE.Vector3();
        vertex.x = radius * Math.cos( thetaStart + i / segments * thetaLength );
        vertex.y = radius * Math.sin( thetaStart + i / segments * thetaLength );

        this.vertices.push( vertex );
        uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, - ( vertex.y / radius + 1 ) / 2 + 1 ) );

    }

    var n = new THREE.Vector3( 0, 0, -1 );

    for ( i = 1; i <= segments; i ++ ) {
    		if ( innerRadius ) {
    			var v1 = (i - 1) * 2 + 1;
	        var v2 = (i - 1) * 2;
	        var v3 = i * 2 + 1;
	        var v4 = i * 2;
	        this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
	        this.faces.push( new THREE.Face3( v2, v4, v3, [ n, n, n ] ) );
	        this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ] );
	        this.faceVertexUvs[ 0 ].push( [ uvs[ v2 ], uvs[ v4 ], uvs[ v3 ] ] );
    		}
    		else {
	        var v1 = i;
	        var v2 = i + 1 ;
	        var v3 = 0;

	        this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
	        this.faceVertexUvs[ 0 ].push( [ uvs[ i ], uvs[ i + 1 ], centerUV ] );
	      }

    }

    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.CircleGeometry.prototype = Object.create( THREE.Geometry.prototype );
