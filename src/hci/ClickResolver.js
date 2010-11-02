
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
			var d = face instanceof THREE.Face4 ? matrix.transform( geometry.vertices[ face.d ].position.clone() ) : null;

			var lineStart = linePoint.clone();
			var lineDirection = lineDir.clone();
			var dot = face.normal.dot( lineDirection );

			if ( dot < 0 ) { // Math.abs( dot ) > 0.0001

				var s = face.normal.dot( new THREE.Vector3().sub( a, lineStart ) ) / dot;
				var planeIntersect = lineStart.addSelf( lineDirection.multiplyScalar( s ) );

				if ( face instanceof THREE.Face3 ) {

					if ( pointInFace3( planeIntersect, a, b, c ) ) {

						logIntersect( planeIntersect, face );

					}

				} else if ( face instanceof THREE.Face4 ) {

					if ( pointInFace3( planeIntersect, a, b, d ) || pointInFace3( planeIntersect, b, c, d ) ) {

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

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		function pointInFace3( p, a, b, c ) {

			var v0 = c.clone().subSelf( a ), v1 = b.clone().subSelf( a ), v2 = p.clone().subSelf( a ),
			dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

		}

		return intersect;
	}

};
