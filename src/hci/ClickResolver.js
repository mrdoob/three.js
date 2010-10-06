
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
		
		for ( var i = 0; i < objects.length; i++ ) {
			
			var o = objects[i];
			var intersect = this.getIntersectingFaces( this.scene, camera, o, mouseRayStart, mouseRayDir );
			
			if ( intersect.face != null &&
					(closestIntersect == null ||
					 closestIntersect.distance > intersect.distance)
					 ) {
				
				closestIntersect = intersect;
			}
		}
		
		if ( closestIntersect != null && closestIntersect.face.onSelect ) {
			
			closestIntersect.face.onSelect( scene, camera, o, closestIntersect.face, closestIntersect.point );
		}
	},
		
	
	translateScreenCoordsToZIndex : function ( xPercent, yPercent, targetZIndex ) {

		var maxVisibleXatZIndex, maxVisibleYatZIndex;
		var rayToZIndex   = new THREE.Vector3();
		var left          = new THREE.Vector3();
		var up            = new THREE.Vector3();
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
			
			var vg = new THREE.Geometry();
			
			vg.vertices[ 0 ] = new THREE.Vertex( v );
			vg.vertices[ 1 ] = new THREE.Vertex( v );
			
			scene.addObject( new THREE.Line( vg, new THREE.LineColorMaterial( hex, 1, 10 )));
		}
	},
	
	
	logLine: function( scene, s, e, hex ) {

		if ( this._debug ) {

			this.logPoint( scene, s.clone(), 0x000000 );
			
			var lg = new THREE.Geometry();
			
			lg.vertices[0] = new THREE.Vertex( s.clone() );
			lg.vertices[1] = new THREE.Vertex( e.clone() );
			
			scene.addObject(new THREE.Line( lg, new THREE.LineColorMaterial( hex, 1, 4 ) ));
		}

	},
	
	
	getIntersectingFaces: function( scene, camera, object3d, linePoint, lineDir ) {
		
		var intersect = {
			face     : null,
			point    : null,
			distance : Number.MAX_VALUE
		};
		
		var geo    = object3d.geometry;
		var matrix = object3d.matrix;
		
		for ( f = 0; f < geo.faces.length; f++ ) {
			
			var face = geo.faces[ f ];
			
			if ( !face.selectable ) continue;
			
			var a = matrix.transform( geo.vertices[ face.a ].position.clone() );
			var b = matrix.transform( geo.vertices[ face.b ].position.clone() );
			var c = matrix.transform( geo.vertices[ face.c ].position.clone() );
			var d = null;
			
			if ( face.d ) {
				
				d = matrix.transform( geo.vertices[ face.d ].position.clone() );
			}
			
			var lineStart = linePoint.clone();
			var lineDirection = lineDir.clone();
			var dot = face.normal.dot( lineDirection );
			
			if ( this._debug ) {

				this.logLine( scene, a, new THREE.Vector3().add( a, new THREE.Vector3().addSelf( face.normal ).multiplyScalar( 100 )), 0x0000FF );
				this.logLine( scene, lineStart, lineStart.clone().addSelf(lineDirection), 0x55FF88 );
				this.logPoint( scene, a, 0xFF0000 ); // r
				this.logPoint( scene, b, 0x00FF00 ); // g
				this.logPoint( scene, c, 0x0000FF ); // b
				this.logPoint( scene, d, 0xFFFF00 ); // y
			}
				
			if ( Math.abs(dot) > .0001 ) {
				
				var s = face.normal.dot( new THREE.Vector3().sub( a, lineStart ) ) / dot;
				var planeIntersect = lineStart.addSelf( lineDirection.multiplyScalar( s ) );
				
				if ( this._debug ) this.logPoint( scene, planeIntersect, 0xFFCCAA );
				
				if ( d == null ) {
					
					var ab = isInsideBoundary( planeIntersect, a, b, c );
					var bc = isInsideBoundary( planeIntersect, b, c, a );
					var ca = isInsideBoundary( planeIntersect, c, a, b );
					
					if ( ab && bc && ca ) {
						
						if ( this._debug ) this.logPoint( scene, planeIntersect, 0xFF0000 );
						logIntersect( planeIntersect, face );
						
					}
				} else {
					
					var ab = isInsideBoundary( planeIntersect, a, b, c );
					var bc = isInsideBoundary( planeIntersect, b, c, d );
					var cd = isInsideBoundary( planeIntersect, c, d, a );
					var da = isInsideBoundary( planeIntersect, d, a, b );
					
					if ( ab && bc && cd && da ) {
						
						if ( this._debug ) this.logPoint( scene, planeIntersect, 0xFF0000 );
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
		
		function isInsideBoundary( pointOnPlaneToCheck, pointInside, boundaryPointA, boundaryPointB ) {
		
			var toB = boundaryPointB.clone().subSelf( boundaryPointA );
			var toI = pointInside.clone().subSelf( boundaryPointA );
			var pointMid = toB.setLength( toI.dot( toB ) ).addSelf( boundaryPointA );
			var pointMirror = pointMid.subSelf( pointInside ).multiplyScalar( 2 ).addSelf( pointInside );
			
			return pointOnPlaneToCheck.distanceToSquared( pointInside ) <
				   pointOnPlaneToCheck.distanceToSquared( pointMirror );
		};
		
		return intersect;
	}


};
