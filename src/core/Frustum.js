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

	planes[ 0 ].set( m.elements[3] - m.elements[0], m.elements[7] - m.elements[4], m.elements[11] - m.elements[8], m.elements[15] - m.elements[12] );
	planes[ 1 ].set( m.elements[3] + m.elements[0], m.elements[7] + m.elements[4], m.elements[11] + m.elements[8], m.elements[15] + m.elements[12] );
	planes[ 2 ].set( m.elements[3] + m.elements[1], m.elements[7] + m.elements[5], m.elements[11] + m.elements[9], m.elements[15] + m.elements[13] );
	planes[ 3 ].set( m.elements[3] - m.elements[1], m.elements[7] - m.elements[5], m.elements[11] - m.elements[9], m.elements[15] - m.elements[13] );
	planes[ 4 ].set( m.elements[3] - m.elements[2], m.elements[7] - m.elements[6], m.elements[11] - m.elements[10], m.elements[15] - m.elements[14] );
	planes[ 5 ].set( m.elements[3] + m.elements[2], m.elements[7] + m.elements[6], m.elements[11] + m.elements[10], m.elements[15] + m.elements[14] );

	for ( i = 0; i < 6; i ++ ) {

		plane = planes[ i ];
		plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

	}

};

THREE.Frustum.prototype.contains = function ( object ) {

	var distance,
	planes = this.planes,
	matrix = object.matrixWorld,
	scale = THREE.Frustum.__v1.set( matrix.getColumnX().length(), matrix.getColumnY().length(), matrix.getColumnZ().length() ),
	radius = - object.geometry.boundingSphere.radius * Math.max( scale.x, Math.max( scale.y, scale.z ) );

	for ( var i = 0; i < 6; i ++ ) {

		distance = planes[ i ].x * matrix.elements[12] + planes[ i ].y * matrix.elements[13] + planes[ i ].z * matrix.elements[14] + planes[ i ].w;
		if ( distance <= radius ) return false;

	}

	return true;

};

THREE.Frustum.__v1 = new THREE.Vector3();
