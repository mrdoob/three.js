/**
 * @author astrodud / http://astrodud.isgreat.org/
 */

function Lathe( points, steps, angle ) {

	THREE.Geometry.call( this );

	this.steps = steps || 12;
	this.angle = angle || 2 * Math.PI;

	var stepSize = this.angle / this.steps;

	var newV = [], oldInds = [], newInds = [], startInds = [];

	for ( var j = 0; j < points.length; j ++ ) {

		this.vertices.push( new THREE.Vertex( points[ j ] ) );

		newV[ j ] = points[ j ].clone();
		oldInds[ j ] = this.vertices.length - 1;

	}

	var matrix = new THREE.Matrix4().setRotationZ( stepSize );

	for ( var r = 0; r <= this.angle + 0.001; r += stepSize ) { // need the +0.001 for it go up to angle

		for ( var j = 0; j < newV.length; j ++ ) {

			if ( r < this.angle ) {

				newV[ j ] = matrix.multiplyVector3( newV[ j ].clone() );
				this.vertices.push( new THREE.Vertex( newV[ j ] ) );
				newInds[ j ] = this.vertices.length - 1;

			} else {

				newInds = startInds; // wrap it up!

			}

		}

		if ( r == 0 ) startInds = oldInds;

		for ( var j = 0; j < oldInds.length - 1; j ++ ) {

			this.faces.push( new THREE.Face4( newInds[ j ], newInds[ j + 1 ], oldInds[ j + 1 ], oldInds[ j ] ) );
			this.uvs.push( [

				new THREE.UV( r / angle, j / points.length ),
				new THREE.UV( r / angle, ( j + 1 ) / points.length ),
				new THREE.UV( ( r - stepSize ) / angle, ( j + 1 ) / points.length ),
				new THREE.UV( ( r - stepSize ) / angle, j / points.length )

			] );

		}

		oldInds = newInds;
		newInds = [];
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

Lathe.prototype = new THREE.Geometry();
Lathe.prototype.constructor = Lathe;
