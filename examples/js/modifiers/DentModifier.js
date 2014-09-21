 /** DentModifier allows us to make local spherical deformation
 * The geometry has to have rather large number of polygons!
 * options:
 * 	 origin - point where the applied strain 
 * 	 direction - deformation direction ( usually the opposite of normal )
 * 	 radius - deformation radius 
 *	 depth - deformation depth
 * @author Vildanov Almaz / alvild@gmail.com
 */		
		
THREE.DentModifier = function () {
 
};

THREE.DentModifier.prototype = {

    constructor: THREE.DentModifier,

    set: function ( origin, direction, radius, depth ) {
        this.origin = new THREE.Vector3(); this.origin.copy( origin );
        this.direction = new THREE.Vector3(); this.direction.copy( direction );
        this.radius = radius;
        this.depth = depth;
        return this
    },

    modify: function ( geometry ) {

		var R_Squared = this.radius * this.radius;

        var normal = new THREE.Vector3(); normal.copy( this.direction );
        normal.multiplyScalar( -this.radius*( 1 - this.depth ) ); 

        var centerSphere = new THREE.Vector3(); centerSphere.addVectors( this.origin, normal );  
        var Sphere = new THREE.Sphere( centerSphere, this.radius );

		var NewVertexNormals = [];

		for (var i=0; i< geometry.vertices.length; i++) {       

			NewVertexNormals[i] = null;
            if ( centerSphere.distanceToSquared( geometry.vertices[i] ) < R_Squared ) {

                    var Ray = new THREE.Ray( geometry.vertices[i], this.direction );
                    var punct = Ray.intersectSphere( Sphere );
                    geometry.vertices[i] = punct;
					var newNormal = new THREE.Vector3(); newNormal.subVectors( punct, centerSphere );
					NewVertexNormals[i] = newNormal.normalize(); 

               }
		}

		// compute Vertex Normals
		var fvNames = [ 'a', 'b', 'c', 'd' ];

		for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			var face = geometry.faces[ f ];
			if ( face.vertexNormals === undefined ) {
				continue;
			}
			for ( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {

				var angle = NewVertexNormals[ face[ fvNames[ v ] ] ];
				if ( angle != null) { face.vertexNormals[ v ].copy( angle ); }

				}

			}
		// end compute Vertex Normals

		geometry.computeFaceNormals();
		geometry.verticesNeedUpdate = true;
		geometry.normalsNeedUpdate = true; 
        return this

    },

}