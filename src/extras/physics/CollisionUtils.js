/**
 * @author bartek drozdz / http://everyday3d.com/
 */

THREE.CollisionUtils = {};

// @params m THREE.Mesh
// @returns CBox dynamic Object Bounding Box

THREE.CollisionUtils.MeshOBB = function( m ) {

	m.geometry.computeBoundingBox();
	var b = m.geometry.boundingBox;
	var min = new THREE.Vector3( b.x[0], b.y[0], b.z[0] );
	var max = new THREE.Vector3( b.x[1], b.y[1], b.z[1] );
	var box = new THREE.BoxCollider( min, max );
	box.mesh = m;
	return box;

}

// @params m THREE.Mesh
// @returns CBox static Axis-Aligned Bounding Box
//
// The AABB is calculated based on current
// position of the object (assumes it won't move)

THREE.CollisionUtils.MeshAABB = function( m ) {

	var box = THREE.CollisionUtils.MeshOBB( m );
	box.min.addSelf( m.position );
	box.max.addSelf( m.position );
	box.dynamic = false;
	return box;

};

// @params m THREE.Mesh
// @returns CMesh with aOOB attached (that speeds up intersection tests)

THREE.CollisionUtils.MeshColliderWBox = function( m ) {

	var mv = m.geometry.vertices;
	var mvl = mv.length;
	var mf = m.geometry.faces;
	var mfl = mf.length;

	var vertices = [];
	var faces = [];
	var normals = [];

	for( var i = 0; i < mvl; i++ ) {

		vertices.push( new THREE.Vector3( mv[ i ].position.x, mv[ i ].position.y, mv[ i ].position.z ) );

	}

	for( var i = 0; i < mfl; i++ ) {

		faces.push( mf[ i ].a, mf[ i ].b, mf[ i ].c );
		normals.push( new THREE.Vector3( mf[ i ].normal.x, mf[ i ].normal.y, mf[ i ].normal.z ) );

	}

	var mc = new THREE.MeshCollider( vertices, faces, normals, THREE.CollisionUtils.MeshOBB( m ) );
	mc.mesh = m;

	return mc;

};
