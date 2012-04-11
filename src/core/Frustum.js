/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Frustum = function ( ) {

	this.planes = [

		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()

	];

};

THREE.Frustum.prototype.setFromMatrix = function ( m ) {

	var i, plane,
	planes = this.planes;
    var me = m.elements;

	planes[ 0 ].set( me[3] - me[0], me[7] - me[4], me[11] - me[8], me[15] - me[12] );
	planes[ 1 ].set( me[3] + me[0], me[7] + me[4], me[11] + me[8], me[15] + me[12] );
	planes[ 2 ].set( me[3] + me[1], me[7] + me[5], me[11] + me[9], me[15] + me[13] );
	planes[ 3 ].set( me[3] - me[1], me[7] - me[5], me[11] - me[9], me[15] - me[13] );
	planes[ 4 ].set( me[3] - me[2], me[7] - me[6], me[11] - me[10], me[15] - me[14] );
	planes[ 5 ].set( me[3] + me[2], me[7] + me[6], me[11] + me[10], me[15] + me[14] );

	for ( i = 0; i < 6; i ++ ) {

		plane = planes[ i ];
		plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

	}

};

THREE.Frustum.prototype.contains = function ( object ) {

	var distance,
	planes = this.planes,
	matrix = object.matrixWorld,
    me = matrix.elements,
	scale = THREE.Frustum.__v1.set( matrix.getColumnX().length(), matrix.getColumnY().length(), matrix.getColumnZ().length() ),
	radius = - object.geometry.boundingSphere.radius * Math.max( scale.x, Math.max( scale.y, scale.z ) );

	for ( var i = 0; i < 6; i ++ ) {

		distance = planes[ i ].x * me[12] + planes[ i ].y * me[13] + planes[ i ].z * me[14] + planes[ i ].w;
		if ( distance <= radius ) return false;

	}

	return true;

};

THREE.Frustum.__v1 = new THREE.Vector3();
