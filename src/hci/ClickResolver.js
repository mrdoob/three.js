
THREE.ClickResolver = function( camera, scene ) {

	this.camera = camera;
	this.scene  = scene;
	this._debug = false;
	
};

THREE.ClickResolver.prototype = {

	findIntersectInScene : function ( xPercent, yPercent ) {

		var objects = this.scene.objects;
		var intersects = [];

		var mouseRayStart = this.translateScreenCoordsToZIndex( xPercent, yPercent, 300 );
		var mouseRayEnd =   this.translateScreenCoordsToZIndex( xPercent, yPercent, 800 );

		var mouseRayDir = new THREE.Vector3().sub( mouseRayEnd, mouseRayStart );

		var closestIntersect = null;

		for ( var i = 0, l = objects.length; i < l; i++ ) {

			var object = objects[i];

			if ( object instanceof THREE.Mesh ) {

				var intersect = this.getIntersectingFaces( this.scene, camera, object, mouseRayStart, mouseRayDir );

				if ( intersect.face != null && (closestIntersect == null || closestIntersect.distance > intersect.distance) ) {

					closestIntersect = intersect;

				}

			}

		}

		if ( closestIntersect != null && closestIntersect.face.onSelect ) {

			closestIntersect.face.onSelect( scene, camera, object, closestIntersect.face, closestIntersect.point );

		}

	},

	translateScreenCoordsToZIndex: function ( xPercent, yPercent, targetZIndex ) {

		var maxVisibleXatZIndex, maxVisibleYatZIndex;
		var rayToZIndex = new THREE.Vector3();
		var left = new THREE.Vector3();
		var up = new THREE.Vector3();
		var coordAtZIndex = new THREE.Vector3();

		rayToZIndex.sub( this.camera.target.position, this.camera.position ).setLength( targetZIndex );
		
		maxVisibleYatZIndex = rayToZIndex.length() * Math.tan( this.camera.fov * Math.PI / 360 );
		maxVisibleXatZIndex = maxVisibleYatZIndex  * this.camera.aspect;
		
		left.cross( this.camera.up, rayToZIndex );
		up  .cross( rayToZIndex, left );
		
		return coordAtZIndex.add( this.camera.position, rayToZIndex ).
			addSelf( left.setLength( maxVisibleXatZIndex * ( 1 - 2 * xPercent ))).
			addSelf( up  .setLength( maxVisibleYatZIndex * ( 1 - 2 * yPercent )));
	},
	
	
	logPoint: function( scene, v, hex ) {
		
		if ( this._debug ) {
			
			var p = new THREE.Particle( new THREE.ParticleCircleMaterial( hex, 0.5 ) );
			p.position = v.clone();
			p.scale.x = p.scale.y = p.scale.z = 5;
			
			scene.addObject( p );
		}
	},
	
	
	logLine: function( scene, s, e, hex ) {

		if ( this._debug ) {

			this.logPoint( scene, s.clone(), 0x000000 );
			
			var lg = new THREE.Geometry();
			
			lg.vertices[0] = new THREE.Vertex( s.clone() );
			lg.vertices[1] = new THREE.Vertex( e.clone() );
			
			scene.addObject( new THREE.Line( lg, new THREE.LineColorMaterial( hex, 0.5 ) ) );
		}

	},
	
	
	getIntersectingFaces: function( scene, camera, object3d, linePoint, lineDir ) {
		
		var intersect = {
			face     : null,
			point    : null,
			distance : Number.MAX_VALUE
		};
		
		var geometry = object3d.geometry;
		var matrix = object3d.matrix;
		
		for ( f = 0; f < geometry.faces.length; f++ ) {
			
			var face = geometry.faces[ f ];
			
			// if ( !face.selectable ) continue;
			
			var a = matrix.transform( geometry.vertices[ face.a ].position.clone() );
			var b = matrix.transform( geometry.vertices[ face.b ].position.clone() );
			var c = matrix.transform( geometry.vertices[ face.c ].position.clone() );
			var d = face.d ? matrix.transform( geometry.vertices[ face.d ].position.clone() ) : null;
			
			var lineStart = linePoint.clone();
			var lineDirection = lineDir.clone();
			var dot = face.normal.dot( lineDirection );
			
			if ( this._debug ) {

				this.logLine( scene, a, new THREE.Vector3().add( a, new THREE.Vector3().addSelf( face.normal ).multiplyScalar( 100 ) ), 0x0000FF );
				this.logLine( scene, lineStart, lineStart.clone().addSelf( lineDirection ), 0x55FF88 );
				this.logPoint( scene, a, 0xFF0000 ); // r
				this.logPoint( scene, b, 0x00FF00 ); // g
				this.logPoint( scene, c, 0x0000FF ); // b
				if ( d ) this.logPoint( scene, d, 0xFFFF00 ); // y
			}

			if ( dot < 0 ) { // Math.abs( dot ) > 0.0001

				var s = face.normal.dot( new THREE.Vector3().sub( a, lineStart ) ) / dot;
				var planeIntersect = lineStart.addSelf( lineDirection.multiplyScalar( s ) );

				// if ( this._debug ) this.logPoint( scene, planeIntersect, 0x808080 );

				if ( d == null ) {

					/*
					var ab = isInsideBoundary( planeIntersect, a, b, c );
					var bc = isInsideBoundary( planeIntersect, b, c, a );
					var ca = isInsideBoundary( planeIntersect, c, a, b );

					if ( ab && bc && ca ) {
					*/

					// console.log( f, ab, bc, ca );

					if ( pointInFace3Fast( planeIntersect, a, b, c ) ) {

						if ( this._debug ) this.logPoint( scene, planeIntersect, 0x0000ff );
						logIntersect( planeIntersect, face );

					}

				} else {

					/*
					var ab = isInsideBoundary( planeIntersect, a, b, c );
					var bc = isInsideBoundary( planeIntersect, b, c, d );
					var cd = isInsideBoundary( planeIntersect, c, d, a );
					var da = isInsideBoundary( planeIntersect, d, a, b );

					if ( ab && bc && cd && da ) {
					*/
					if ( pointInFace4( planeIntersect, a, b, c, d ) ) {

						if ( this._debug ) this.logPoint( scene, planeIntersect, 0x000000 );
						logIntersect( planeIntersect, face );

					}

				}

			}

		}

		function logIntersect( planeIntersect, face ) {

			var distance = camera.position.distanceTo( planeIntersect );

			if ( distance < intersect.distance ) {

				intersect.distance = distance;
				intersect.face = face;
				intersect.point = planeIntersect;

			}

		}

		/*
		function isInsideBoundary( pointOnPlaneToCheck, pointInside, boundaryPointA, boundaryPointB ) {

			var toB = boundaryPointB.clone().subSelf( boundaryPointA );
			var toI = pointInside.clone().subSelf( boundaryPointA );
			var pointMid = toB.setLength( toI.dot( toB ) ).addSelf( boundaryPointA );
			var pointMirror = pointMid.subSelf( pointInside ).multiplyScalar( 2 ).addSelf( pointInside );

			return pointOnPlaneToCheck.distanceToSquared( pointInside ) < pointOnPlaneToCheck.distanceToSquared( pointMirror );
		}
		*/

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		function pointInFace3( p, a, b, c ) {

			return sameSide( p, a, b, c ) && sameSide( p, b, a, c ) && sameSide( p, c, a, b );

		}

		function pointInFace3Fast( p, a, b, c ) {

			var v0 = c.clone().subSelf( a ), v1 = b.clone().subSelf( a ), v2 = p.clone().subSelf( a ),
			dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

		}

		function pointInFace4( p, a, b, c, d ) {

			return sameSide( p, a, b, c ) && sameSide( p, b, c, d ) && sameSide( p, c, d, a ) && sameSide( p, c, a, b );

		}

		function sameSide( p1, p2, a, b ) {

			var cp1 = new THREE.Vector3().cross( b.clone().subSelf( a ), p1.clone().subSelf( a ) );
			var cp2 = new THREE.Vector3().cross( b.clone().subSelf( a ), p2.clone().subSelf( a ) );
			return cp1.dot( cp2 ) >= 0;

		}

		return intersect;
	}


};
