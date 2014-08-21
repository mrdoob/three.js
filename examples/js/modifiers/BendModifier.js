 /** The Bend modifier lets you bend the current selection up to 90 degrees about a single axis,
 * producing a uniform bend in an object's geometry.
 * You can control the angle and direction of the bend on any of three axes.
 * options:
 * 	 axis - longitudinal axis (in local coordinates!)
 * 	 direction - deformation direction (in local coordinates!)
 * 	 angle - deformation angle
 * @author Vildanov Almaz / alvild@gmail.com
 * The algorithm of a bend is based on the chain line cosh: y = 1/b * cosh(b*x) - 1/b. It can be used only in three.js.
 */

THREE.BendModifier = function () {

};

THREE.BendModifier.prototype = {

    constructor: THREE.BendModifier,

    set: function ( direction, axis, angle ) {
        this.direction = new THREE.Vector3(); this.direction.copy( direction );
		this.axis = new THREE.Vector3(); this.axis.copy( axis );
        this.angle = angle;
        return this
    },

	_cosh: function( x )  {
		return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
	},

	_sinhInverse: function( x )  {
			return  Math.log( Math.abs( x ) + Math.sqrt( x * x + 1 ) );
	},

    modify: function ( mesh ) {
        
		var M = new THREE.Matrix4().getInverse( mesh.matrixWorld );

		var thirdAxis = new THREE.Vector3();  thirdAxis.crossVectors( this.direction, this.axis );
		
		// P - matrices of the change-of-coordinates
		var P = new THREE.Matrix4( this.axis.x, this.axis.y, this.axis.z, 0, this.direction.x, this.direction.y, this.direction.z, 0, thirdAxis.x, thirdAxis.y, thirdAxis.z, 0, 0, 0, 0, 1 ).transpose();
		var InverseP =  new THREE.Matrix3().getInverse( P );
		var newVertices = []; var oldVertices = []; var anglesBetweenOldandNewVertices = []; 
		
		var meshGeometryBoundingBoxMaxx=0; var meshGeometryBoundingBoxMinx = 0;
		var meshGeometryBoundingBoxMaxy=0; var meshGeometryBoundingBoxMiny = 0;
		
		for (var i = 0; i < mesh.geometry.vertices.length; i++)  {
		
			newVertices[i] = new THREE.Vector3(); newVertices[i].copy( mesh.geometry.vertices[i] ).applyMatrix3( InverseP );
			if ( newVertices[i].x > meshGeometryBoundingBoxMaxx ) { meshGeometryBoundingBoxMaxx = newVertices[i].x; }
			if ( newVertices[i].x < meshGeometryBoundingBoxMinx ) { meshGeometryBoundingBoxMinx = newVertices[i].x; }
			if ( newVertices[i].y > meshGeometryBoundingBoxMaxy ) { meshGeometryBoundingBoxMaxy = newVertices[i].y; }
			if ( newVertices[i].y < meshGeometryBoundingBoxMiny ) { meshGeometryBoundingBoxMiny = newVertices[i].y; }
		
		}
		
		var meshWidthold =  meshGeometryBoundingBoxMaxx - meshGeometryBoundingBoxMinx;
		var meshDepth =  meshGeometryBoundingBoxMaxy - meshGeometryBoundingBoxMiny;
		var ParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidthold;
		var oldMiddlex = (meshGeometryBoundingBoxMaxx + meshGeometryBoundingBoxMinx) / 2;
		var oldMiddley = (meshGeometryBoundingBoxMaxy + meshGeometryBoundingBoxMiny) / 2;

		for (var i = 0; i < mesh.geometry.vertices.length; i++ )  {
		
			oldVertices[i] = new THREE.Vector3(); oldVertices[i].copy( newVertices[i] );
			newVertices[i].x = THREE.Math.sign( newVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( newVertices[i].x - oldMiddlex ) * ParamB );
		
		}
			
		var meshWidth = 2 / ParamB * this._sinhInverse( meshWidthold / 2 * ParamB );

		var NewParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidth;

		var rightEdgePos = new THREE.Vector3( meshWidth / 2, -meshDepth / 2, 0 );
		rightEdgePos.y = 1 / NewParamB * this._cosh( NewParamB * rightEdgePos.x ) - 1 / NewParamB - meshDepth / 2;

		var bendCenter = new THREE.Vector3( 0, rightEdgePos.y  + rightEdgePos.x / Math.tan( this.angle ), 0 );

		for ( var i = 0; i < mesh.geometry.vertices.length; i++ )  {

			var x0 = THREE.Math.sign( oldVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( oldVertices[i].x - oldMiddlex ) * ParamB );
			var y0 = 1 / NewParamB * this._cosh( NewParamB * x0 ) - 1 / NewParamB;
						
			var k = new THREE.Vector3( bendCenter.x - x0, bendCenter.y - ( y0 - meshDepth / 2 ), bendCenter.z ).normalize();
						
			var Q = new THREE.Vector3();
			Q.addVectors( new THREE.Vector3( x0, y0 - meshDepth / 2, oldVertices[i].z ), k.multiplyScalar( oldVertices[i].y + meshDepth / 2 ) );
			newVertices[i].x = Q.x;  newVertices[i].y = Q.y;

		}	

		middle = oldMiddlex * meshWidth / meshWidthold;
	
		for ( var i = 0; i < mesh.geometry.vertices.length; i++ )  {

			var O = new THREE.Vector3( oldMiddlex, oldMiddley, oldVertices[i].z );
			var p = new THREE.Vector3(); p.subVectors( oldVertices[i], O );
			var q = new THREE.Vector3(); q.subVectors( newVertices[i], O );			
				
			anglesBetweenOldandNewVertices[i] = - Math.acos( 1 / this._cosh( ParamB * mesh.geometry.vertices[i].x ) )  * THREE.Math.sign( newVertices[i].x );

			newVertices[i].x = newVertices[i].x + middle;
			mesh.geometry.vertices[i].copy( newVertices[i].applyMatrix4( P ) );

		}
			
		mesh.geometry.computeFaceNormals();
		mesh.geometry.verticesNeedUpdate = true;
		mesh.geometry.normalsNeedUpdate = true;

		// compute Vertex Normals
		var fvNames = [ 'a', 'b', 'c', 'd' ];

		for ( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {

			var face = mesh.geometry.faces[ f ];
			if ( face.vertexNormals === undefined ) {
				continue;
			}
			for ( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {
			
				var angle = anglesBetweenOldandNewVertices[ face[ fvNames[ v ] ] ];
				x = thirdAxis.x; y = thirdAxis.y; z = thirdAxis.z;
	
				var P = new THREE.Matrix3( Math.cos(angle) + (1-Math.cos(angle))*x*x, (1-Math.cos(angle))*x*y - Math.sin(angle)*z, (1-Math.cos(angle))*x*z +Math.sin(angle)*y,
					(1-Math.cos(angle))*y*x+Math.sin(angle)*z, Math.cos(angle)+(1-Math.cos(angle))*y*y, (1-Math.cos(angle))*y*z - Math.sin(angle)*x,
					(1-Math.cos(angle))*z*x - Math.sin(angle)*y, (1-Math.cos(angle))*z*y + Math.sin(angle)*x, Math.cos(angle)+(1-Math.cos(angle))*z*z );
							
				face.vertexNormals[ v ].applyMatrix3( P );

				}

			}
		// end compute Vertex Normals			
		
		return this			
    }	
}