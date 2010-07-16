/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 */

THREE.Geometry = function () {

	this.vertices = [];
	this.faces = [];
	this.uvs = [];

	this.computeNormals = function () {

		var v, f, vA, vB, vC, cb, ab, normal;

		for ( v = 0; v < this.vertices.length; v++ ) {

			this.vertices[ v ].normal.set( 0, 0, 0 );

		}

		for ( f = 0; f < this.faces.length; f++ ) {

			vA = this.vertices[ this.faces[ f ].a ];
			vB = this.vertices[ this.faces[ f ].b ];
			vC = this.vertices[ this.faces[ f ].c ];

			cb = new THREE.Vector3();
			ab = new THREE.Vector3();
			normal = new THREE.Vector3();

			cb.sub( vC.position, vB.position );
			ab.sub( vA.position, vB.position );
			cb.crossSelf( ab );

			if ( !cb.isZero() ) {

				cb.normalize();

			}

			this.faces[ f ].normal = cb;

			vA.normal.addSelf( normal );
			vB.normal.addSelf( normal );
			vC.normal.addSelf( normal );

			if ( this.faces[ f ] instanceof THREE.Face4 ) {

				this.vertices[ this.faces[ f ].d ].normal.addSelf( normal );

			}

		}

	};

};
