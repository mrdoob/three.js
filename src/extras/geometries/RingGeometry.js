/**
 * @author Kaleb Murphy
 * @author Dashiel Nemeth
 */

THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	innerRadius = innerRadius || 0;
	outerRadius = outerRadius || 50;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? Math.min( Math.PI * 2, thetaLength ) : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

	var completeRing = ( thetaLength >= Math.PI * 2 ) ? true : false;

	var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

	for ( i = 0; i <= phiSegments; i ++ ) { // concentric circles inside ring

		for ( o = 0; o <= thetaSegments; o ++ ) { // number of segments per circle

			if ( o == thetaSegments && completeRing )
				break;
		
			var vertex = new THREE.Vector3();
			var segment = thetaStart + o / thetaSegments * thetaLength;

			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			this.vertices.push( vertex );
			uvs.push( new THREE.Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );
		}

		radius += radiusStep;

	}

	var n = new THREE.Vector3( 0, 0, 1 );
	var ringVerts = ( completeRing ) ? thetaSegments : thetaSegments + 1;
	var lastSegment = ( completeRing ) ? thetaSegments - 1 : -1;

	for ( i = 0; i < phiSegments; i ++ ) { // concentric circles inside ring

		var firstInner = ringVerts * i;
		var firstOuter = firstInner + ringVerts;
	
		for ( o = 0; o < thetaSegments; o ++ ) { // number of segments per circle

			// Clockwise around the quad from inner left
			var v1 = firstInner + o;
			var v2 = firstOuter + o;
			var v3 = ( o == lastSegment ) ? firstOuter : v2 + 1;
			var v4 = ( o == lastSegment ) ? firstInner : v1 + 1;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);
			
			this.faces.push( new THREE.Face3( v1, v3, v4, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

		}
	}

	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
