/**
 * @author oosmoxiecode
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 */

THREE.Torus = function ( radius, tube, segmentsR, segmentsT ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 100;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 8;
	this.segmentsT = segmentsT || 6;

	var temp_uv = [];

	for ( var j = 0; j <= this.segmentsR; ++j ) {

		for ( var i = 0; i <= this.segmentsT; ++i ) {

			var u = i / this.segmentsT * 2 * Math.PI;
			var v = j / this.segmentsR * 2 * Math.PI;
			var x = (this.radius + this.tube*Math.cos(v))*Math.cos(u);
			var y = (this.radius + this.tube*Math.cos(v))*Math.sin(u);
			var z = this.tube*Math.sin(v);

			vert( x, y, z );

			temp_uv.push( [i/this.segmentsT, 1 - j/this.segmentsR] );

		}
	}


	for ( var j = 1; j <= this.segmentsR; ++j ) {

		for ( var i = 1; i <= this.segmentsT; ++i ) {

			var a = (this.segmentsT + 1)*j + i;
			var b = (this.segmentsT + 1)*j + i - 1;
			var c = (this.segmentsT + 1)*(j - 1) + i - 1;
			var d = (this.segmentsT + 1)*(j - 1) + i;

			f4( a, b, c,d );

			this.faceVertexUvs[ 0 ].push( [new THREE.UV( temp_uv[a][0], temp_uv[a][1] ),
							new THREE.UV( temp_uv[b][0], temp_uv[b][1] ),
							new THREE.UV( temp_uv[c][0], temp_uv[c][1] ),
							new THREE.UV( temp_uv[d][0], temp_uv[d][1] )
							] );
		}

	}

	delete temp_uv;

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function vert( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	};

	function f4( a, b, c, d ) {

		scope.faces.push( new THREE.Face4( a, b, c, d ) );

	};

};

THREE.Torus.prototype = new THREE.Geometry();
THREE.Torus.prototype.constructor = THREE.Torus;
