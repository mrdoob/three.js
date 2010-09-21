/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 */

THREE.Geometry = function () {

	this.vertices = [];
	this.faces = [];
	this.uvs = [];

};

THREE.Geometry.prototype = {

	computeNormals: function () {

		var v, f, vA, vB, vC, cb, ab;

		for ( v = 0; v < this.vertices.length; v++ ) {

			this.vertices[ v ].normal.set( 0, 0, 0 );

		}

		for ( f = 0; f < this.faces.length; f++ ) {

			vA = this.vertices[ this.faces[ f ].a ];
			vB = this.vertices[ this.faces[ f ].b ];
			vC = this.vertices[ this.faces[ f ].c ];

			cb = new THREE.Vector3();
			ab = new THREE.Vector3();

			cb.sub( vC.position, vB.position );
			ab.sub( vA.position, vB.position );
			cb.crossSelf( ab );

			if ( !cb.isZero() ) {

				cb.normalize();

			}

			this.faces[ f ].normal = cb;

		}

	},

	toString: function () {

		return 'THREE.Geometry ( vertices: ' + this.vertices + ', faces: ' + this.faces + ' )';

	}

};
