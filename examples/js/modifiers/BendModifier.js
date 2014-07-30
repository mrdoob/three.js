
 /** The Bend modifier lets you bend the current selection up to 90 degrees about a single axis, 
 * producing a uniform bend in an object's geometry. 
 * You can control the angle and direction of the bend on any of three axes. 
 * options:	
 * 	 axis - longitudinal axis (in local coordinates!)
 * 	 direction - deformation direction (in local coordinates!)
 * 	 angle - deformation angle 
 * @author Vildanov Almaz / alvild@gmail.com 
 * The algorithm of a bend is based on the chain line ch. It can be used only in three.js.
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
	ch: function( x )
		{
			return ( Math.exp(x) + Math.exp(-x) )/2;
		},	
	sh_inverse: function( x )
		{
			return  Math.log(  Math.abs(x) + Math.sqrt( x*x + 1 ) ) ;
		},		
    modify: function ( mesh ) {
        var M = new THREE.Matrix4().getInverse( mesh.matrixWorld );
		
	var vec = new THREE.Vector3();  vec.crossVectors( this.direction, this.axis ); 

	var P = new THREE.Matrix4( this.axis.x, this.axis.y, this.axis.z, 0, this.direction.x, this.direction.y, this.direction.z, 0, vec.x, vec.y, vec.z, 0, 0, 0, 0, 1 ).transpose();
	var P_inverse =  new THREE.Matrix3().getInverse( P ); 
		var new_vertices = []; var new_angles = []; var damp_vertices = []; 
		
		var mesh_geometry_boundingBox_max_x=0; var mesh_geometry_boundingBox_min_x = 0;
		var mesh_geometry_boundingBox_max_y=0; var mesh_geometry_boundingBox_min_y = 0;
		
		for (var i=0; i< mesh.geometry.vertices.length; i++)
			{
				new_vertices[i]= new THREE.Vector3(); new_vertices[i].copy( mesh.geometry.vertices[i] ).applyMatrix3( P_inverse ) ;
				if ( new_vertices[i].x > mesh_geometry_boundingBox_max_x ) { mesh_geometry_boundingBox_max_x = new_vertices[i].x; }
				if ( new_vertices[i].x < mesh_geometry_boundingBox_min_x ) { mesh_geometry_boundingBox_min_x = new_vertices[i].x; }	
				if ( new_vertices[i].y > mesh_geometry_boundingBox_max_y ) { mesh_geometry_boundingBox_max_y = new_vertices[i].y; }
				if ( new_vertices[i].y < mesh_geometry_boundingBox_min_y ) { mesh_geometry_boundingBox_min_y = new_vertices[i].y; }		
			}
		
	var mesh_width_old =  mesh_geometry_boundingBox_max_x - mesh_geometry_boundingBox_min_x; 
	var mesh_depth =  mesh_geometry_boundingBox_max_y - mesh_geometry_boundingBox_min_y;
	var bb=2*this.sh_inverse(Math.tan(this.angle))/mesh_width_old;
	var middle_old_x = (mesh_geometry_boundingBox_max_x + mesh_geometry_boundingBox_min_x)/2;
	var middle_old_y = (mesh_geometry_boundingBox_max_y + mesh_geometry_boundingBox_min_y)/2;

		for (var i=0; i< mesh.geometry.vertices.length; i++)
			{
				damp_vertices[i]= new THREE.Vector3(); damp_vertices[i].copy( new_vertices[i] );
				new_vertices[i].x = THREE.Math.sign( new_vertices[i].x - middle_old_x ) * 1/bb * this.sh_inverse( ( new_vertices[i].x - middle_old_x )* bb );
			}	
			
	var mesh_width =  2*1/bb * this.sh_inverse( mesh_width_old/2 * bb );

	var b=2*this.sh_inverse(Math.tan(this.angle))/mesh_width; //Line( new THREE.Vector3( 0,-mesh_depth/2, 0), new THREE.Vector3(0,1,0), 600 );

	var x_right = new THREE.Vector3( mesh_width/2, -mesh_depth/2, 0 );
	x_right.y = 1/b * this.ch( b*x_right.x ) - 1/b - mesh_depth/2;

	var Y = x_right.y  + x_right.x / Math.tan( this.angle ); //Line( new THREE.Vector3( x_right.x, x_right.y, 0 ), new THREE.Vector3(Math.cos(Math.PI/2+this.angle), Math.sin(Math.PI/2+this.angle), 0 ), 550 );	


		for (var i=0; i< mesh.geometry.vertices.length; i++)
			{       
						var x0 = THREE.Math.sign( damp_vertices[i].x - middle_old_x ) * 1/bb * this.sh_inverse( ( damp_vertices[i].x - middle_old_x )* bb );
						var y0 = 1/b * this.ch( b*x0 ) - 1/b; 
						
						var k = new THREE.Vector3( 0-x0, Y - (y0 - mesh_depth/2 ), 0 ).normalize();
						
						var Q = new THREE.Vector3( ); 
						Q.addVectors( new THREE.Vector3( x0, y0 - mesh_depth/2, damp_vertices[i].z ), k.multiplyScalar( damp_vertices[i].y + mesh_depth/2) );
						new_vertices[i].x = Q.x;  new_vertices[i].y = Q.y; 
    
			}	
	
	
	middle = middle_old_x * mesh_width / mesh_width_old;
	
		for (var i=0; i< mesh.geometry.vertices.length; i++)
			{
				var O = new THREE.Vector3( middle_old_x, middle_old_y, damp_vertices[i].z );
				var p = new THREE.Vector3(); p.subVectors( damp_vertices[i], O );
				var q = new THREE.Vector3(); q.subVectors( new_vertices[i], O );				
				
				new_angles[i] = - Math.acos(1/this.ch( bb*mesh.geometry.vertices[i].x ))  * THREE.Math.sign(new_vertices[i].x);

				new_vertices[i].x = new_vertices[i].x + middle;
				mesh.geometry.vertices[i].copy( new_vertices[i].applyMatrix4( P ) );
			}
			
		mesh.geometry.computeFaceNormals();
	//	mesh.geometry.computeVertexNormals();
		mesh.geometry.verticesNeedUpdate = true;
		mesh.geometry.normalsNeedUpdate = true; 


				var fvNames = [ 'a', 'b', 'c', 'd' ];
				var normalLength = 15;

				for( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {
					var face = mesh.geometry.faces[ f ];
					if( face.vertexNormals === undefined ) {
						continue;
					}
					for( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {
			
	var angle = new_angles[face[ fvNames[ v ] ]];		
			x = vec.x;
			y = vec.y;
			z = vec.z;
			
	var P = new THREE.Matrix3( Math.cos(angle) + (1-Math.cos(angle))*x*x, (1-Math.cos(angle))*x*y - Math.sin(angle)*z, (1-Math.cos(angle))*x*z +Math.sin(angle)*y,
							(1-Math.cos(angle))*y*x+Math.sin(angle)*z, Math.cos(angle)+(1-Math.cos(angle))*y*y, (1-Math.cos(angle))*y*z - Math.sin(angle)*x,
							(1-Math.cos(angle))*z*x - Math.sin(angle)*y, (1-Math.cos(angle))*z*y + Math.sin(angle)*x, Math.cos(angle)+(1-Math.cos(angle))*z*z );
							
	face.vertexNormals[ v ].applyMatrix3( P ) ;

					}
				}
        return this			
    }	
}