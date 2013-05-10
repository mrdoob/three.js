/**************************************************************
 *	Line3D
 **************************************************************/

THREE.LineCurve3 = THREE.Curve.create(

	function ( v1, v2 ) {

		this.v1 = v1;
		this.v2 = v2;

	},

	function ( t ) {

		var r = new THREE.Vector3();


		r.subVectors( this.v2, this.v1 ); // diff
		r.multiplyScalar( t );
		r.add( this.v1 );

		return r;

	}

);
