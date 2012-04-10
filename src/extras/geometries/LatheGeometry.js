/**
 * @author astrodud / http://astrodud.isgreat.org/
 * @author zz85 / https://github.com/zz85
 */

THREE.LatheGeometry = function ( points, steps, angle ) {

	THREE.Geometry.call( this );

	this.steps = steps || 12;
	this.angle = angle || 2 * Math.PI;

	var stepSize = this.angle / this.steps,
	newV = [],
	matrix = new THREE.Matrix4().makeRotationZ( stepSize );

	for ( var j = 0; j < points.length; j ++ ) {

		this.vertices.push( new THREE.Vertex( points[ j ] ) );

		newV[ j ] = points[ j ].clone();

	}

	for ( var i = 0; i < this.steps; i ++ ) {

		for ( var j = 0; j < newV.length; j ++ ) {

				newV[ j ] = matrix.multiplyVector3( newV[ j ].clone() );
				this.vertices.push( new THREE.Vertex( newV[ j ] ) );

		}

		var a, b, c, d;
		var steps = this.steps;
		for ( var k = 0, kl = points.length; k < kl-1; k++) {

			a = i * kl + k;
			b = ((i + 1) % steps) * kl + k;
			c = ((i + 1) % steps) * kl + (k + 1) % kl;
			d = i * kl + (k + 1) % kl;
			

			this.faces.push( new THREE.Face4( a, b, c, d ) );

			this.faceVertexUvs[ 0 ].push( [

				// UV mappings which wraps around
				new THREE.UV( 1 - i / steps, k / kl ),
				new THREE.UV( 1 - (i + 1) / steps, k / kl ),
				new THREE.UV( 1 - (i + 1) / steps, ( k+ 1 ) / kl ),
				new THREE.UV( 1 - i / steps, ( k + 1 ) / kl ),
				
			] );

		}


	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.LatheGeometry.prototype = new THREE.Geometry();
THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry;
