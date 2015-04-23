/**************************************************************
 *	Quadratic Bezier 3D curve
 **************************************************************/

THREE.QuadraticBezierCurve3 = THREE.Curve.create(

	function ( v0, v1, v2 ) {

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var vector = new THREE.Vector3();

		vector.x = THREE.Shape.Utils.b2( t, this.v0.x, this.v1.x, this.v2.x );
		vector.y = THREE.Shape.Utils.b2( t, this.v0.y, this.v1.y, this.v2.y );
		vector.z = THREE.Shape.Utils.b2( t, this.v0.z, this.v1.z, this.v2.z );

		return vector;

	}

);
