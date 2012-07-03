/**
 * @author astrodud / http://astrodud.isgreat.org/
 * @author zz85 / https://github.com/zz85
 */

THREE.LatheGeometry = function ( points, steps, angle ) {

	THREE.Geometry.call( this );

	var _steps = steps || 12;
	var _angle = angle || 2 * Math.PI;

	var _newV = [];
	var _matrix = new THREE.Matrix4().makeRotationZ( _angle / _steps );

	for ( var j = 0; j < points.length; j ++ ) {

		_newV[ j ] = points[ j ].clone();
		this.vertices.push( _newV[ j ] );

	}

	var i, il = _steps + 1;

	for ( i = 0; i < il; i ++ ) {

		for ( var j = 0; j < _newV.length; j ++ ) {

			_newV[ j ] = _matrix.multiplyVector3( _newV[ j ].clone() );
			this.vertices.push( _newV[ j ] );

		}

	}

	for ( i = 0; i < _steps; i ++ ) {

		for ( var k = 0, kl = points.length; k < kl - 1; k ++ ) {

			var a = i * kl + k;
			var b = ( ( i + 1 ) % il ) * kl + k;
			var c = ( ( i + 1 ) % il ) * kl + ( k + 1 ) % kl;
			var d = i * kl + ( k + 1 ) % kl;

			this.faces.push( new THREE.Face4( a, b, c, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new THREE.UV( 1 - i / _steps, k / kl ),
				new THREE.UV( 1 - ( i + 1 ) / _steps, k / kl ),
				new THREE.UV( 1 - ( i + 1 ) / _steps, ( k + 1 ) / kl ),
				new THREE.UV( 1 - i / _steps, ( k + 1 ) / kl )
				
			] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.LatheGeometry.prototype = Object.create( THREE.Geometry.prototype );
