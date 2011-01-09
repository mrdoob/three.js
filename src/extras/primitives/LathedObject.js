/**
 * @author astrodud / http://astrodud.isgreat.org/
 */

function transformVector3( v, m ) { // Transform a Vector3 via a Matrix4
   var x = m.n11 * v.x + m.n12 * v.y + m.n13 * v.z + m.n14;
   var y = m.n21 * v.x + m.n22 * v.y + m.n23 * v.z + m.n24;
   var z = m.n31 * v.x + m.n32 * v.y + m.n33 * v.z + m.n34;
   return( new THREE.Vector3( x, y, z ) );
};

function LathedObject( verts, nsteps, latheAngle ) {
   THREE.Geometry.call( this );
   nsteps = nsteps || 12;
   latheAngle = latheAngle || 2 * Math.PI;
   var stepSize = latheAngle / nsteps;
   var newV = [], oldInds = [], newInds = [], startInds = [];
   for ( var j = 0; j < verts.length; j ++ ) {
      this.vertices.push( new THREE.Vertex( verts[ j ] ) );
      oldInds[ j ] = this.vertices.length - 1;
      newV[ j ] = new THREE.Vector3( verts[ j ].x, verts[ j ].y, verts[ j ].z );
   }
   var m = THREE.Matrix4.rotationZMatrix( stepSize );
   for ( var r = 0; r <= latheAngle + 0.001; r += stepSize ) { // need the +0.001 for it go up to latheAngle
      for ( var j = 0; j < newV.length; j ++ ) {
	 if ( r < latheAngle ) {
	    newV[ j ] = transformVector3( newV[ j ], m );
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
