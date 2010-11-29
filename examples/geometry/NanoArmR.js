var NanoArmR = function () {

	var scope = this;

	THREE.Geometry.call(this);

	v( 40.812927, 87.089203, -17.499998 );
	v( 40.812927, -17.910797, -17.499998 );
	v( 55.812927, 87.089203, -17.499998 );
	v( 55.812927, -17.910797, -17.499998 );
	v( 55.812927, 87.089203, 17.500002 );
	v( 55.812927, -17.910797, 17.500002 );
	v( 40.812927, 87.089203, 17.500002 );
	v( 40.812927, -17.910797, 17.500002 );

	f4( 2, 3, 1, 0, 0.000000, 0.000000, 1.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);
	f4( 4, 5, 3, 2, 0.000000, 0.000000, 1.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);
	f4( 6, 7, 5, 4, 0.000000, 0.000000, 1.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);
	f4( 0, 1, 7, 6, 0.000000, 0.000000, 1.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);
	f4( 3, 5, 7, 1, -1.000000, 0.000000, 0.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);
	f4( 4, 2, 0, 6, -1.000000, 0.000000, 0.000000 );
	uv( 1.000000, 1.000000, 1.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000);

	scope.colors = {};
	scope.selections = {};
	scope.colors["all"] = 0xcac1ba;
	scope.selections["all"] = [0, 1, 2, 3, 4, 5];

	scope.autoColor = function(){
		for(var s in this.selections){
			for(var i = 0 ; i < this.selections[s].length; i++) this.faces[this.selections[s][i]].material = [ new THREE.MeshColorFillMaterial( this.colors[s],1) ];
		}
	}

	scope.getPosition = function(){	return new THREE.Vector3(-0.12241363525390625, 89.671585083007812, 33.401443481445312);	}

	scope.getRotation = function(){	return new THREE.Vector3(0.0, 0.0, 0.0);	}

	scope.getScale = function(){	return new THREE.Vector3(1.5, 1.5, 1.5);	}

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f3( a, b, c, nx, ny, nz ) {

		scope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );

	}

	function f4( a, b, c, d, nx, ny, nz ) {

		scope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );

	}

	function uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		if ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );
		scope.uvs.push( uv );
	}

}

NanoArmR.prototype = new THREE.Geometry();
NanoArmR.prototype.constructor = NanoArmR;