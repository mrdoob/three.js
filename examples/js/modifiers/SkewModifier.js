 /** The Skew modifier allows to incline objects, on the specified angle, in the set direction
 * options:
 * 	 direction - deformation direction (in local coordinates!). 
 * 	 axis - deformation axis (in local coordinates!). Vector of direction and axis are perpendicular.
 * 	 angle - incline angle.
 * @author Vildanov Almaz / alvild@gmail.com
 */

THREE.SkewModifier = function () {

};


THREE.SkewModifier.prototype = {

    constructor: THREE.SkewModifier,

    set: function ( direction, axis, angle ) {
        this.direction = new THREE.Vector3(); this.direction.copy( direction ); this.direction.normalize();
		this.axis = new THREE.Vector3(); this.axis.copy( axis );
        this.angle = angle;
        return this
    },
	
    modify: function ( geometry ) {

		var thirdAxis = new THREE.Vector3();  thirdAxis.crossVectors( this.direction, this.axis );

		// P - matrices of the change-of-coordinates

		var P = new THREE.Matrix4();
		P.set(  thirdAxis.x, thirdAxis.y, thirdAxis.z, 0,
				this.direction.x, this.direction.y, this.direction.z, 0,
				this.axis.x, this.axis.y, this.axis.z, 0, 0, 0, 0, 1 
			).transpose();

		var InverseP =  new THREE.Matrix4().getInverse( P );

		var Syx = 0, Szx = 0, Sxy = 0, Szy = Math.tan( this.angle ), Sxz = 0, Syz = 0;

		var matrix = new THREE.Matrix4();

		matrix.set(   1,   Syx,  Szx,  0,
					Sxy,     1,  Szy,  0,
					Sxz,   Syz,   1,   0,
		  			0,      0,    0,   1  );

		var SkewMatrix =  new THREE.Matrix4(); // SkewMatrix = InverseP * matrix * P
		SkewMatrix.multiplyMatrices( P, matrix ); SkewMatrix.multiplyMatrices( SkewMatrix, InverseP );
		geometry.applyMatrix( SkewMatrix );

        return this
    }

}