/**
 * @author mrdoob / http://mrdoob.com/
 */
(function(THREE){
		
	THREE.Ray = function ( origin, direction, near, far ) {
		
		this.origin = origin || new THREE.Vector3();
		this.direction = direction || new THREE.Vector3();
		this.near = near || 0;
		this.far = far || Infinity;
	};
	
	var originCopy = new THREE.Vector3();
	
	var localOriginCopy = new THREE.Vector3();
	var localDirectionCopy = new THREE.Vector3();
	
	var vector = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var intersectPoint = new THREE.Vector3();
	
	var inverseMatrix = new THREE.Matrix4();
	
	var descSort = function ( a, b ) {
	
		return a.distance - b.distance;
	
	};
	
	
	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

	
	var distanceFromIntersection = function ( origin, direction, position ) {
		var dot, intersect, distance;
			
		v0.sub( position, origin );
		dot = v0.dot( direction );
	
		intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
		distance = position.distanceTo( intersect );
	
		return distance;
	
	};
	
	// http://www.blackpawn.com/texts/pointinpoly/default.html
	

	
	var pointInFace3 = function ( p, a, b, c ) {
		
		var dot00, dot01, dot02, dot11, dot12, invDenom, u, v;
		
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
	
	};
	
	var intersectObject = function(object,ray,intersects){
		var distance,intersect;
		if ( object instanceof THREE.Particle ) {
	
			distance = distanceFromIntersection( ray.origin, ray.direction, object.matrixWorld.getPosition() );
	
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
	
		} else if ( object instanceof THREE.Mesh ) {
	
			// Checking boundingSphere
	
			//var scale = THREE.Frustum.__v1.set( object.matrixWorld.getColumnX().length(), object.matrixWorld.getColumnY().length(), object.matrixWorld.getColumnZ().length() );
			var scaledRadius = object.geometry.boundingSphere.radius * object.matrixWorld.getMaxScaleOnAxis();
	
			// Checking distance to ray
	
			distance = distanceFromIntersection( ray.origin, ray.direction, object.matrixWorld.getPosition() );
	
			if ( distance > scaledRadius) {
	
				return intersects;
	
			}
	
			// Checking faces
	
			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix, geometryMaterials,
			isFaceMaterial, material, side, point;
	
			geometryMaterials = object.geometry.materials;
			isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
			side = object.material.side;
			var a, b, c, d;
			var precision = ray.precision;
			
			object.matrixRotationWorld.extractRotation( object.matrixWorld );
			
			originCopy.copy( ray.origin );
	
			objMatrix = object.matrixWorld;
			inverseMatrix.getInverse(objMatrix);
			
			localOriginCopy.copy(originCopy);
			inverseMatrix.multiplyVector3(localOriginCopy);
			
			localDirectionCopy.copy(ray.direction);
			inverseMatrix.rotateAxis(localDirectionCopy).normalize();
	
			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
	
				face = geometry.faces[ f ];
	
				material = isFaceMaterial === true ? geometryMaterials[ face.materialIndex ] : object.material;
				if ( material === undefined ) continue;
				side = material.side;
	
				vector.sub( face.centroid, localOriginCopy );
				normal = face.normal;
				dot = localDirectionCopy.dot( normal );
	
	
				// bail if ray and plane are parallel
	
				if ( Math.abs( dot ) < precision ) continue;
	
				// calc distance to plane
	
				scalar = normal.dot( vector ) / dot;
	
				// if negative distance, then plane is behind ray
	
				if ( scalar < 0 ) continue;
	
				if ( side === THREE.DoubleSide || ( side === THREE.FrontSide ? dot < 0 : dot > 0 ) ) {
	
					intersectPoint.add( localOriginCopy, localDirectionCopy.multiplyScalar( scalar ) );
	
					if ( face instanceof THREE.Face3 ) {
	
						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];
	
						if ( pointInFace3( intersectPoint, a, b, c ) ) {
	
							point = object.matrixWorld.multiplyVector3(intersectPoint.clone()); 
							distance = originCopy.distanceTo( point);
							
							if ( distance < ray.near ) continue;
							if ( distance > ray.far ) continue; 
							
							
							intersect = {
	
								distance: distance,
								point: point,
								face: face,
								faceIndex: f,
								object: object
	
							};
	
							intersects.push( intersect );
	
						}
	
					} else if ( face instanceof THREE.Face4 ) {
	
						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];
						d = vertices[ face.d ];
	
						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {
	
							point = object.matrixWorld.multiplyVector3(intersectPoint.clone()); 
							distance = originCopy.distanceTo( point);
							
							if ( distance < ray.near ) continue;
							if ( distance > ray.far ) continue; 
							
							intersect = {
	
								distance: distance,
								point: point,
								face: face,
								faceIndex: f,
								object: object
	
							};
	
							intersects.push( intersect );
	
						}
	
					}
	
				}
	
			}
	
		}
		
	};
	
	var intersectDescendants= function(object,ray,intersects){
		var descendants = object.getDescendants();
		var length = descendants.length;
		for ( var i = 0; i < length; i ++ ) {
	
			intersectObject(descendants[i],this,intersects);
	
		}
	};
	
	//
	
	THREE.Ray.prototype.precision = 0.0001;
/*
	This has deemed to be unnessecary
	THREE.Ray.prototype.setPrecision = function ( value ) {
		
		this.precision = value;
		
	};*/
		
	THREE.Ray.prototype.intersectObject = function ( object, recursive ) {
	
		var intersects = [];
	
		if ( recursive === true ) {
			
			intersectDescendants(object,this,intersects);
	
		}
	
		intersectObject(object,this,intersects);
	
		intersects.sort( descSort );
	
		return intersects;
	
	};
	
	THREE.Ray.prototype.intersectObjects = function ( objects, recursive ) {
	
		var intersects = [];
	
		for ( var i = 0, l = objects.length; i < l; i ++ ) {
			
			intersectObject(objects[i],this,intersects);
	
			if ( recursive === true ) { 
				
				intersectDescendants(objects[i],this,intersects);
	
			}
		}
	
		intersects.sort( descSort );
	
		return intersects;
	
	};
	
}(THREE));
