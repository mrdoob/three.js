// Ray
//function Ray(org, dir) {
//    this.origin = org || new THREE.Vector3();
//	// Make sure the direction is always normalized!
//    this.direction = dir || new THREE.Vector3(1,0,0); 
//}

//Ray.prototype.intersectionPoint = function(t) {
//	return this.origin.clone().addSelf(this.direction.multiplyScalar(t));
//}

// Parametric plane
THREE.PlaneCollider = function(pt, nor){
	this.point = pt;
	this.normal = nor;
}

// Parametric sphere
THREE.SphereCollider = function(cen, rad){
	this.center = cen;
	this.radius = rad;
	this.radiusSq = rad * rad;
}

// Box (AABB or OOBB)
THREE.BoxCollider = function(min, max){
	this.min = min;
	this.max = max;
	this.dynamic = true;
}

THREE.MeshCollider = function(vertices, faces, normals, box) {		
	this.vertices = vertices;
	this.faces = faces;
	this.normals = normals;
	this.box = box;
	
	this.numFaces = this.faces.length;
}

THREE.CollisionSystem = function(){
	this.colliders = [];
	this.hits = [];
};

THREE.Collisions = new THREE.CollisionSystem();

// @params r Ray
// @returns Array of colliders with a field "distance" set (@see Collisions.rayCast for details), empty if not intersection
THREE.CollisionSystem.prototype.rayCastAll = function(r) {
	r.direction.normalize();
	var ld = 0;	
	this.hits.length = 0;
	
	for (var i = 0; i < this.colliders.length; i++) {
		var d = this.rayCast(r, this.colliders[i]);		
		if (d < Number.MAX_VALUE) {
			this.colliders[i].distance = d;
			if(d > ld) this.hits.push(this.colliders[i]);
			else this.hits.unshift(this.colliders[i]);
			ld = d;
		}
	}
	return this.hits;
}

// @params r Ray
// @returns nearest collider found, with "distance" field set, or null if no intersection
THREE.CollisionSystem.prototype.rayCastNearest = function(r){
	var cs = this.rayCastAll(r);
	
	if(cs.length == 0) return null;
	
	var i = 0;
	while(cs[i] instanceof THREE.MeshCollider) {
		var d = this.rayMesh(r, cs[i]);
		if(d < Number.MAX_VALUE) {
			cs[i].distance = d;
			break;
		}
		i++;
	}
	
	if(i > cs.length) return null;
	
	return cs[i];
}

// @params r Ray, c any supported collider type
// @returns Number, distance to intersection, MAX_VALUE if no intersection and -1 if ray inside collider (where applicable)
THREE.CollisionSystem.prototype.rayCast = function(r, c) {
	if(c instanceof THREE.PlaneCollider)
		return this.rayPlane(r, c);
	else if(c instanceof THREE.SphereCollider)
		return this.raySphere(r, c);
	else if (c instanceof THREE.BoxCollider)
		return this.rayBox(r, c);
	else if (c instanceof THREE.MeshCollider && c.box)
		return this.rayBox(r, c.box);
}

// @params r Ray, me CMesh
// @returns Number, distance to intersection or MAX_VALUE if no intersection
THREE.CollisionSystem.prototype.rayMesh = function(r, me){
	var rt = this.makeRayLocal(r, me.mesh);

	var d = Number.MAX_VALUE;
	
	for(var i = 0; i < me.numFaces/3; i++) {
		var t = i * 3;
		
		var p0 = me.vertices[ me.faces[t+0] ];
		var p1 = me.vertices[ me.faces[t+1] ];
		var p2 = me.vertices[ me.faces[t+2] ];	
		var n = me.normals[ me.faces[i] ];
		
		d = Math.min(d, this.rayTriangle(rt, p0, p1, p2, n, d));
	}
	
	return d;
}

THREE.CollisionSystem.prototype.rayTriangle = function(r, p0, p1, p2, n, mind){
	//if (!n) {
		var e1 = new THREE.Vector3().sub(p1, p0);
		var e2 = new THREE.Vector3().sub(p2, p1);
		n = new THREE.Vector3().cross(e1, e2);
	//}
	
	var dot = n.dot(r.direction);
	if(!(dot < 0)) return Number.MAX_VALUE;

	var d = n.dot(p0);
	var t = d - n.dot(r.origin);
	
	if(!(t <= 0)) return Number.MAX_VALUE;
	if(!(t >= dot*mind)) return Number.MAX_VALUE;
	
	t = t / dot;

	var p = r.origin.clone().addSelf(r.direction.clone().multiplyScalar(t));
	var u0, u1, u2, v0, v1, v2;
	if(Math.abs(n.x) > Math.abs(n.y)){
		if (Math.abs(n.x) > Math.abs(n.z)) {
			u0 = p.y - p0.y;
			u1 = p1.y - p0.y;
			u2 = p2.y - p0.y;
			
			v0 = p.z - p0.z;
			v1 = p1.z - p0.z;
			v2 = p2.z - p0.z;
		} else {
			u0 = p.x - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.y - p0.y;
			v1 = p1.y - p0.y;
			v2 = p2.y - p0.y;
		}
	} else {
		if(Math.abs(n.y) > Math.abs(n.z)){
			u0 = p.x - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.z - p0.z;
			v1 = p1.z - p0.z;
			v2 = p2.z - p0.z;
		} else {
			u0 = p.x - p0.x;
			u1 = p1.x - p0.x;
			u2 = p2.x - p0.x;
			
			v0 = p.y - p0.y;
			v1 = p1.y - p0.y;
			v2 = p2.y - p0.y;
		}
	}
	
	var temp = u1 * v2 - v1 * u2;	
	if(!(temp != 0)) return Number.MAX_VALUE;
	//console.log("temp: " + temp);
	temp = 1 / temp;
	
	var alpha = (u0 * v2 - v0 * u2) * temp;
	if(!(alpha >= 0)) return Number.MAX_VALUE;
	//console.log("alpha: " + alpha);
	
	var beta = (u1 * v0 - v1 * u0) * temp;
	if(!(beta >= 0)) return Number.MAX_VALUE;
	//console.log("beta: " + beta);
	
	var gamma = 1 - alpha - beta;
	if(!(gamma >= 0)) return Number.MAX_VALUE;
	//console.log("gamma: " + gamma);
	
	return t;
}

// @params r Ray, m THREE.Mesh
THREE.CollisionSystem.prototype.makeRayLocal = function(r, m){
	var rt = new THREE.Ray(r.origin.clone(), r.direction.clone());
	var mt = THREE.Matrix4.makeInvert( m.matrixWorld );
	mt.multiplyVector3(rt.origin);
	mt.rotateAxis(rt.direction);
	rt.direction.normalize();
	//m.localRay = rt;
	return rt;
}

// @params r Ray, s CBox
// @returns Number, distance to intersection, -1 if inside or MAX_VALUE if no intersection
THREE.CollisionSystem.prototype.rayBox = function(r, ab){
	
	// If Collider.dynamic = true (default) it will act as an OOBB, getting the transformation from a mesh it is attached to
	// In this case it needs to have a 'mesh' field, which has a 'matrixWorld' field in turn (like in THREE.Mesh)
	var rt;
	
	if(ab.dynamic && ab.mesh && ab.mesh.matrixWorld) {
		//if(ab.mesh.localRay) rt = ab.mesh.localRay;
		//else 
		rt = this.makeRayLocal(r, ab.mesh);
	} else {
		rt = new THREE.Ray(r.origin.clone(), r.direction.clone());
	}

	// If box is not marked as dynamic or mesh is not found, it works like a simple AABB
	// and uses the originaly calculated bounding box (faster if object is static)
	
	var xt = 0, yt = 0, zt = 0;
	var xn = 0, yn = 0, zn = 0;
	var ins = true;
	
	if(rt.origin.x < ab.min.x) {
		xt = ab.min.x - rt.origin.x;
		/* If this and the similar lines below are uncommented, 
		 * the function will return MAX_VALUE (i.e. no intersection) 
		 * if the Ray.direction is too short to reach the AABB.
		 *
		 * Otherwise the Ray is considered infinite (but only forward) 
		 * and returned is the distance from Ray.origin to intersection point.
		 */ 
		//if(xt > r.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = -1;
	} else if(rt.origin.x > ab.max.x) {
		xt = ab.max.x - rt.origin.x;
		//if(xt < r.direction.x) return return Number.MAX_VALUE;
		xt /= rt.direction.x;
		ins = false;
		xn = 1;
	}
	
	if(rt.origin.y < ab.min.y) {
		yt = ab.min.y - rt.origin.y;
		//if(yt > r.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = -1;
	} else if(rt.origin.y > ab.max.y) {
		yt = ab.max.y - rt.origin.y;
		//if(yt < r.direction.y) return return Number.MAX_VALUE;
		yt /= rt.direction.y;
		ins = false;
		yn = 1;
	}
	
	if(rt.origin.z < ab.min.z) {
		zt = ab.min.z - rt.origin.z;
		//if(zt > r.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
		ins = false;
		zn = -1;
	} else if(rt.origin.z > ab.max.z) {
		zt = ab.max.z - rt.origin.z;
		//if(zt < r.direction.z) return return Number.MAX_VALUE;
		zt /= rt.direction.z;
		ins = false;
		zn = 1;
	}

	if(ins) return -1;

	var which = 0;
	var t = xt;
	if(yt > t) {
		which = 1;
		t = yt;
	}
	
	if (zt > t) {
		which = 2;
		t = zt;
	}
	
	switch(which) {
		case 0:
			var y = rt.origin.y + rt.direction.y * t;
			if(y < ab.min.y || y > ab.max.y) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if(z < ab.min.z || z > ab.max.z) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3(xn, 0, 0);
			break;
		case 1:
			var x = rt.origin.x + rt.direction.x * t;
			if(x < ab.min.x || x > ab.max.x) return Number.MAX_VALUE;
			var z = rt.origin.z + rt.direction.z * t;
			if(z < ab.min.z || z > ab.max.z) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3(0, yn, 0);
			break;
		case 2:
			var x = rt.origin.x + rt.direction.x * t;
			if(x < ab.min.x || x > ab.max.x) return Number.MAX_VALUE;
			var y = rt.origin.y + rt.direction.y * t;
			if(y < ab.min.y || y > ab.max.y) return Number.MAX_VALUE;
			ab.normal = new THREE.Vector3(0, 0, zn);
			break;
	}
	
	return t;
}

// @params r Ray, s CSphere
// @returns Number, parametric distance or MAX_VALUE if no intersection
// #TBT
THREE.CollisionSystem.prototype.rayPlane = function(r, p){
	var t = r.direction.dot(p.normal);
	var d = p.point.dot(p.normal);
	var ds;
	
	if(t < 0) ds = (d - r.origin.dot(p.normal)) / t;
	else return Number.MAX_VALUE;
	
	if(ds > 0) return ds;
	else return Number.MAX_VALUE;

}

// @params r Ray, s CSphere
// @returns Number, parametric distance or MAX_VALUE if no intersection
THREE.CollisionSystem.prototype.raySphere = function(r, s){
	var e = s.center.clone().subSelf(r.origin);
	if(e.lengthSq < s.radiusSq) return -1;
	
	var a = e.dot(r.direction.clone()); // Ray.direction must be unit vector!
	if(a <= 0) return Number.MAX_VALUE;
	
	var t = s.radiusSq - (e.lengthSq() - a * a);
	if(t >= 0) return Math.abs(a) - Math.sqrt(t);
	
	return Number.MAX_VALUE;
}







