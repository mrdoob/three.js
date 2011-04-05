/**
 * @author drojdjou / http://everyday3d.com/
 */

THREE.PlaneCollider = function( point, normal ) {

	this.point = point;
	this.normal = normal;

};


THREE.SphereCollider = function( center, radius ) {

	this.center = center;
	this.radius = radius;
	this.radiusSq = radius * radius;

};

THREE.BoxCollider = function( min, max ) {

	this.min = min;
	this.max = max;
	this.dynamic = true;

};

THREE.MeshCollider = function( vertices, faces, normals, box ) {
	
	this.vertices = vertices;
	this.faces = faces;
	this.normals = normals;
	this.box = box;
	this.numFaces = this.faces.length;

};

THREE.CollisionSystem = function() {

	this.colliders = [];
	this.hits = [];

};

THREE.Collisions = new THREE.CollisionSystem();

THREE.CollisionSystem.prototype.rayCastAll = function( r ) {

	r.direction.normalize();

	var ld = 0;	
	this.hits.length = 0;
	
	for ( var i = 0; i < this.colliders.length; i++ ) {

		var d = this.rayCast( r, this.colliders[ i ] );	
		
		if ( d < Number.MAX_VALUE ) {

			this.colliders[ i ].distance = d;

			if ( d > ld ) 
				this.hits.push( this.colliders[ i ] );
			else 
				this.hits.unshift( this.colliders[ i ] );

			ld = d;

		}

	}

	return this.hits;

};

THREE.CollisionSystem.prototype.rayCastNearest = function( r ) {

	var cs = this.rayCastAll( r );
	
	if( cs.length == 0 ) return null;
	
	var i = 0;

	while( cs[i] instanceof THREE.MeshCollider ) {

		var d = this.rayMesh( r, cs[ i ] );

		if( d < Number.MAX_VALUE ) {

			cs[ i ].distance = d;
			break;

		}

		i++;

	}
	
	if ( i > cs.length ) return null;
	
	return cs[ i ];

};

THREE.CollisionSystem.prototype.rayCast = function( r, c ) {

	if ( c instanceof THREE.PlaneCollider )
		return this.rayPlane( r, c );

	else if ( c instanceof THREE.SphereCollider )
		return this.raySphere( r, c );

	else if ( c instanceof THREE.BoxCollider )
		return this.rayBox( r, c );

	else if ( c instanceof THREE.MeshCollider && c.box )
		return this.rayBox( r, c.box );

};

THREE.CollisionSystem.prototype.rayMesh = function( r, me ) {

	var rt = this.makeRayLocal( r, me.mesh );

	var d = Number.MAX_VALUE;
	
	for( var i = 0; i < me.numFaces/3; i++ ) {

		var t = i * 3;
		
		var p0 = me.vertices[ me.faces[ t + 0 ] ];
		var p1 = me.vertices[ me.faces[ t + 1 ] ];
		var p2 = me.vertices[ me.faces[ t + 2 ] ];	
		var n = me.normals[ me.faces[ i ] ];

		d = Math.min(d, this.rayTriangle( rt, p0, p1, p2, n, d ) );

	}

	return d;

};

THREE.CollisionSystem.prototype.rayTriangle = function( r, p0, p1, p2, n, mind ) {

	//if (!n) {
		var e1 = new THREE.Vector3().sub( p1, p0 );
		var e2 = new THREE.Vector3().sub( p2, p1 );
		n = new THREE.Vector3().cross( e1, e2 );
	//}
	
	var dot = n.dot( r.direction );
	if ( !( dot < 0 ) ) return Number.MAX_VALUE;

	var d = n.dot( p0 );
	var t = d - n.dot( r.origin );
	
	if ( !( t <= 0 ) ) return Number.MAX_VALUE;
	if ( !( t >= dot * mind ) ) return Number.MAX_VALUE;
	
	t = t / dot;

	var p = r.origin.clone().addSelf( r.direction.clone().multiplyScalar( t ) );
	var u0, u1, u2, v0, v1, v2;

	if ( Math.abs( n.x ) > Math.abs( n.y ) ) {

		if ( Math.abs( n.x ) > Math.abs( n.z ) ) {

			u0 = p.y  - p0.y;
			u1 = p1.y - p0.y;
			u2 = p2.y - p0.y;
			
			v0 = p.z  - p0.z;
			v1 = p1.z - p0.z;
			v2 = p2.z - p0.z;

		} else {

			u0 = p.x  - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.y  - p0.y;
			v1 = p1.y - p0.y;
			v2 = p2.y - p0.y;

		}

	} else {

		if( Math.abs( n.y ) > Math.abs( n.z ) ) {

			u0 = p.x  - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.z  - p0.z;
			v1 = p1.z - p0.z;
			v2 = p2.z - p0.z;

		} else {

			u0 = p.x  - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.y  - p0.y;
			v1 = p1.y - p0.y;
			v2 = p2.y - p0.y;

		}

	}
	
	var temp = u1 * v2 - v1 * u2;	
	if( !(temp != 0) ) return Number.MAX_VALUE;
	//console.log("temp: " + temp);
	temp = 1 / temp;
	
	var alpha = ( u0 * v2 - v0 * u2 ) * temp;
	if( !(alpha >= 0) ) return Number.MAX_VALUE;
	//console.log("alpha: " + alpha);
	
	var beta = ( u1 * v0 - v1 * u0 ) * temp;
	if( !(beta >= 0) ) return Number.MAX_VALUE;
	//console.log("beta: " + beta);
	
	var gamma = 1 - alpha - beta;
	if( !(gamma >= 0) ) return Number.MAX_VALUE;
	//console.log("gamma: " + gamma);
	
	return t;

};

THREE.CollisionSystem.prototype.makeRayLocal = function( r, m ) {

	var rt = new THREE.Ray( r.origin.clone(), r.direction.clone() );
	var mt = THREE.Matrix4.makeInvert( m.matrixWorld );

	mt.multiplyVector3( rt.origin );
	mt.rotateAxis( rt.direction );
	rt.direction.normalize();
	//m.localRay = rt;
	return rt;

};

THREE.CollisionSystem.prototype.rayBox = function( r, ab ) {

	var rt;
	
	if ( ab.dynamic && ab.mesh && ab.mesh.matrixWorld ) {

		rt = this.makeRayLocal( r, ab.mesh );

	} else {

		rt = new THREE.Ray( r.origin.clone(), r.direction.clone() );

	}

	var xt = 0, yt = 0, zt = 0;
	var xn = 0, yn = 0, zn = 0;
	var ins = true;
	
	if( rt.origin.x < ab.min.x ) {

		xt = ab.min.x - rt.origin.x;
		//if(xt > r.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = -1;

	} else if( rt.origin.x > ab.max.x ) {

		xt = ab.max.x - rt.origin.x;
		//if(xt < r.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = 1;

	}
	
	if( rt.origin.y < ab.min.y ) {

		yt = ab.min.y - rt.origin.y;
		//if(yt > r.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = -1;

	} else if( rt.origin.y > ab.max.y ) {

		yt = ab.max.y - rt.origin.y;
		//if(yt < r.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = 1;

	}
	
	if( rt.origin.z < ab.min.z ) {

		zt = ab.min.z - rt.origin.z;
		//if(zt > r.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
		ins = false;
		zn = -1;

	} else if( rt.origin.z > ab.max.z ) {

		zt = ab.max.z - rt.origin.z;
		//if(zt < r.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
		ins = false;
		zn = 1;

	}

	if( ins ) return -1;

	var which = 0;
	var t = xt;

	if( yt > t ) {

		which = 1;
		t = yt;

	}
	
	if ( zt > t ) {

		which = 2;
		t = zt;

	}
	
	switch( which ) {

		case 0:

			var y = rt.origin.y + rt.direction.y * t;
			if ( y < ab.min.y || y > ab.max.y ) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if ( z < ab.min.z || z > ab.max.z ) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3( xn, 0, 0 );
			break;

		case 1:

			var x = rt.origin.x + rt.direction.x * t;
			if ( x < ab.min.x || x > ab.max.x ) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if ( z < ab.min.z || z > ab.max.z ) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3( 0, yn, 0) ;
			break;

		case 2:

			var x = rt.origin.x + rt.direction.x * t;
			if (x < ab.min.x || x > ab.max.x ) return Number.MAX_VALUE;
			var y = rt.origin.y + rt.direction.y * t;
			if (y < ab.min.y || y > ab.max.y ) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3( 0, 0, zn );
			break;

	}
	
	return t;

};

THREE.CollisionSystem.prototype.rayPlane = function( r, p ) {

	var t = r.direction.dot( p.normal );
	var d = p.point.dot( p.normal );
	var ds;
	
	if( t < 0 ) ds = ( d - r.origin.dot( p.normal ) ) / t;
	else return Number.MAX_VALUE;
	
	if( ds > 0 ) return ds;
	else return Number.MAX_VALUE;

};

THREE.CollisionSystem.prototype.raySphere = function( r, s ) {

	var e = s.center.clone().subSelf( r.origin );
	if ( e.lengthSq < s.radiusSq ) return -1;
	
	var a = e.dot( r.direction.clone() );
	if ( a <= 0 ) return Number.MAX_VALUE;
	
	var t = s.radiusSq - ( e.lengthSq() - a * a );
	if ( t >= 0 ) return Math.abs( a ) - Math.sqrt( t );
	
	return Number.MAX_VALUE;

};







