/**
 * @author astrodud / http://astrodud.isgreat.org/
 */

function LathedObject( verts, nsteps, latheAngle ) {

	THREE.Geometry.call( this );

	this.nsteps = nsteps || 12;
	this.latheAngle = latheAngle || 2 * Math.PI;
	
	var stepSize = this.latheAngle / this.nsteps;
	
	var newV = [], oldInds = [], newInds = [], startInds = [];
	
	for ( var j = 0; j < verts.length; j ++ ) {
      
		this.vertices.push( new THREE.Vertex( verts[ j ] ) );
		oldInds[ j ] = this.vertices.length - 1;
		newV[ j ] = new THREE.Vector3( verts[ j ].x, verts[ j ].y, verts[ j ].z );

	}
	
	var m = THREE.Matrix4.rotationZMatrix( this.stepSize );
	
	for ( var r = 0; r <= this.latheAngle + 0.001; r += this.stepSize ) { // need the +0.001 for it go up to latheAngle
	
		for ( var j = 0; j < newV.length; j ++ ) {
			
			if ( r < latheAngle ) {
				
				newV[ j ] = m.multiplyVector3( newV[ j ].clone() );
				this.vertices.push( new THREE.Vertex( newV[ j ] ) );
				newInds[ j ] = this.vertices.length - 1;

			} else {
			
				newInds = startInds; // wrap it up!

			}

		}
		
		if ( r == 0 ) startInds = oldInds;
      
		for ( var j = 0; j < oldInds.length - 1; j ++ ) {
			
			this.faces.push( new THREE.Face4( newInds[ j ], newInds[ j + 1 ], oldInds[ j + 1 ], oldInds[ j ] ) );
			this.uvs.push( [ new THREE.UV( r / latheAngle, j / verts.length ),
							 new THREE.UV( r / latheAngle, ( j + 1 ) / verts.length ),
							 new THREE.UV( ( r - stepSize ) / latheAngle, ( j + 1 ) / verts.length ),
							 new THREE.UV( ( r - stepSize ) / latheAngle, j / verts.length ) ] );
			
		}
		
		oldInds = newInds;
		newInds = [];
	}
	
	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
	this.sortFacesByMaterial();

};

LathedObject.prototype = new THREE.Geometry();
LathedObject.prototype.constructor = LathedObject;
