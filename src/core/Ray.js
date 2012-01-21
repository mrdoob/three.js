/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

	this.intersectScene = function ( scene ) {

		return this.intersectObjects( scene.children );

	};

	this.intersectObjects = function ( objects, tollerance ) {

		var i, l, object,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ],tollerance ) );

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	};

	var a = new THREE.Vector3();
	var b = new THREE.Vector3();
	var c = new THREE.Vector3();
	var d = new THREE.Vector3();

	var originCopy = new THREE.Vector3();
	var directionCopy = new THREE.Vector3();

	var vector = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var intersectPoint = new THREE.Vector3()

	this.intersectObject = function ( object, tollerance ) {

		var intersect, intersects = [];

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( object.children[ i ] ) );

		}

		if ( object instanceof THREE.Particle ) {

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance > object.scale.x ) {

				return [];

			}

			intersect = {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			};

			intersects.push( intersect );

		} else if ( object instanceof THREE.Line ) {
			var vertexA, vertexB, distance;
			for (var i = object.geometry.vertices.length - 2; i >= 0; i--) {
				vertexA = object.geometry.vertices[i].position.fromObject(object);
				vertexB = object.geometry.vertices[i+1].position.fromObject(object);

				distance = distanceToLine(this.origin,this.direction,vertexA,vertexB);
				if (distance < tollerance){
					intersect = {
						distance: distance,
						edge: {
							distance:distance,
							vertices:[vertexA,vertexB]
						},
						object: object
					};
					intersects.push( intersect );
				}
			};

		} else if ( object instanceof THREE.Mesh ) {

			// Checking boundingSphere

			var distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );
			var scale = THREE.Frustum.__v1.set( object.matrixWorld.getColumnX().length(), object.matrixWorld.getColumnY().length(), object.matrixWorld.getColumnZ().length() );

			if ( distance > object.geometry.boundingSphere.radius * Math.max( scale.x, Math.max( scale.y, scale.z ) ) ) {

				return intersects;

			}

			// Checking faces

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				originCopy.copy( this.origin );
				directionCopy.copy( this.direction );

				objMatrix = object.matrixWorld;

				// determine if ray intersects the plane of the face
				// note: this works regardless of the direction of the face normal

				vector = objMatrix.multiplyVector3( vector.copy( face.centroid ) ).subSelf( originCopy );
				normal = object.matrixRotationWorld.multiplyVector3( normal.copy( face.normal ) );
				dot = directionCopy.dot( normal );

				// bail if ray and plane are parallel

				if ( Math.abs( dot ) < 0.0001 ) continue;

				// calc distance to plane

				scalar = normal.dot( vector ) / dot;

				// if negative distance, then plane is behind ray

				if ( scalar < 0 ) continue;

				if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) {

					intersectPoint.add( originCopy, directionCopy.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ].position ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ].position ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ].position ) );

						if ( pointInFace3( intersectPoint, a, b, c ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};
							intersect.nearestVertex= nearestVertex(intersect);
							intersect.nearestEdge= nearestEdge(intersect);
							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						a = objMatrix.multiplyVector3( a.copy( vertices[ face.a ].position ) );
						b = objMatrix.multiplyVector3( b.copy( vertices[ face.b ].position ) );
						c = objMatrix.multiplyVector3( c.copy( vertices[ face.c ].position ) );
						d = objMatrix.multiplyVector3( d.copy( vertices[ face.d ].position ) );

						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

							intersect = {

								distance: originCopy.distanceTo( intersectPoint ),
								point: intersectPoint.clone(),
								face: face,
								object: object

							};
							intersect.nearestVertex= nearestVertex(intersect);
							intersect.nearestEdge= nearestEdge(intersect);
							intersects.push( intersect );

						}

					}

				}

			}

		}

		return intersects;

	}

	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
	var dot, intersect, distance;

	function distanceFromIntersection( origin, direction, position ) {

		v0.sub( position, origin );
		dot = v0.dot( direction );

		intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
		distance = position.distanceTo( intersect );

		return distance;

	}

	// http://www.blackpawn.com/texts/pointinpoly/default.html

	var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;

	function pointInFace3( p, a, b, c ) {

		v0.sub( c, a );
		v1.sub( b, a );
		v2.sub( p, a );

		dot00 = v0.dot( v0 );
		dot01 = v0.dot( v1 );
		dot02 = v0.dot( v2 );
		dot11 = v1.dot( v1 );
		dot12 = v1.dot( v2 );

		invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

	}
	
	function nearestVertex(contact){
		var face, object, point, vertex, distance, checkDistance,a,b,c,d,verts,result;
		face = contact.face;
        object = contact.object;
        point = contact.point;

        
        a = object.geometry.vertices[face.a].position;
        b = object.geometry.vertices[face.b].position;
        c = object.geometry.vertices[face.c].position;
		verts = [a,b,c];
        if (face.d != null) {
          d = object.geometry.vertices[face.d].position;
          verts.push(d);
        }

        for (var i = verts.length - 1; i >= 0; i--) {
        	checkDistance = verts[i].fromObject(object).distanceTo(contact.point);
			if (checkDistance < distance || !distance){
		      	distance = checkDistance;
		      	result = {
			      	distance: distance,
			      	vertex: verts[i]
			     };
	      	}
        };
        return result;
		
	}

	function nearestEdge(contact){
		var a, b, c, check, d, face, object, point, edge, edges, _i, _len, distance, result,
          _this = this;
        //http://paulbourke.net/geometry/pointline/
        check = function(point, lineStart, lineEnd) {
	          var U, intersection, lineMag;
	          
	          lineMag = lineStart.distanceTo(lineEnd);
	          U = (((point.x - lineStart.x) * (lineEnd.x - lineStart.x)) + ((point.y - lineStart.y) * (lineEnd.y - lineStart.y)) + ((point.z - lineStart.z) * (lineEnd.z - lineStart.z))) / (lineMag * lineMag);
	          
	          if (U < 0.0 || U > 1.0) return 0;
	          
	          intersection = new THREE.Vector3();

	          intersection.x = lineStart.x + U * (lineEnd.x - lineStart.x);
	          intersection.y = lineStart.y + U * (lineEnd.y - lineStart.y);
	          intersection.z = lineStart.z + U * (lineEnd.z - lineStart.z);
	          
	          return point.distanceTo(intersection);
        };
        face = contact.face;
        object = contact.object;
        point = contact.point;

        a = object.geometry.vertices[face.a].position.fromObject(object);
        b = object.geometry.vertices[face.b].position.fromObject(object);
        c = object.geometry.vertices[face.c].position.fromObject(object);

        if (face.d != null) {
          d = object.geometry.vertices[face.d].position.fromObject(object);
        }
        if (face instanceof THREE.Face3) {
          edges = [[a, b], [b, c], [c, a]];
        } else {
          edges = [[a, b], [b, c], [c, d], [d, a]];
        }
        result = {}
        for (_i = 0, _len = edges.length; _i < _len; _i++) {
          edge = edges[_i];
          var checkDistance = check(point, edge[0], edge[1]);
          if (checkDistance < distance || !distance){
          	var nearestEdge = [edge[0].toObject(object),edge[1].toObject(object)]
          	distance = checkDistance;
          	result = {
          		distance: distance,
          		vertices: nearestEdge
          	};
          }

        }
        return result;
	}

	function distanceToLine(origin,direction,start,end){
   		var p13,p43,p21,d1343,d4321,d1321,d4343,d2121,mua,mub,numer,denom,EPS,pa,pb;
   		EPS = 0.000001;
   		p13 = new THREE.Vector3();
   		
   		p13.x = origin.x - start.x;
   		p13.y = origin.y - start.y;
   		p13.z = origin.z - start.z;

   		p43 = new THREE.Vector3();
   		p43.x = end.x - start.x;
   		p43.y = end.y - start.y;
   		p43.z = end.z - start.z;

   		if (Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS){
      		return(false);
      	}
      	p21 = new THREE.Vector3();
      	p21.x = direction.x - origin.x;
   		p21.y = direction.y - origin.y;
   		p21.z = direction.z - origin.z;

   		if (Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS){
      		return(false);
      	}

		d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
		d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
		d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
		d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
		d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

		denom = d2121 * d4343 - d4321 * d4321;
		if (Math.abs(denom) < EPS){
			return(false);
		}
		numer = d1343 * d4321 - d1321 * d4343;

		mua = numer / denom;
		mub = (d1343 + d4321 * (mua)) / d4343;
		
		pa = new THREE.Vector3();
		pb = new THREE.Vector3();

		pa.x = origin.x + mua * p21.x;
		pa.y = origin.y + mua * p21.y;
		pa.z = origin.z + mua * p21.z;
		pb.x = start.x + mub * p43.x;
		pb.y = start.y + mub * p43.y;
		pb.z = start.z + mub * p43.z;
		
		return pa.distanceTo(pb);
	}

};
