/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://exocortex.com
 */

THREE.Frustum = function ( ) {

	this.planes = [

		new THREE.Plane(),
		new THREE.Plane(),
		new THREE.Plane(),
		new THREE.Plane(),
		new THREE.Plane(),
		new THREE.Plane()

	];

};

THREE.Frustum.prototype.setFromMatrix = function ( m ) {

	var planes = this.planes;

	var me = m.elements;
	var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
	var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
	var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
	var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

	planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 );
	planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 );
	planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 );
	planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 );
	planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 );
	planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 );

	for ( var i = 0; i < 6; i ++ ) {

		planes[ i ].normalize();

	}

};

THREE.Frustum.prototype.contains = function ( object ) {

	var planes = this.planes;

	var matrix = object.matrixWorld;
	var matrixPosition = matrix.getPosition();
	var radius = - object.geometry.boundingSphere.radius * matrix.getMaxScaleOnAxis();

	var distance = 0.0;

	for ( var i = 0; i < 6; i ++ ) {

		distance = planes[ i ].distanceToPoint( matrixPosition );
		if ( distance <= radius ) return false;

	}

	return true;

};

THREE.Frustum.__v1 = new THREE.Vector3();
