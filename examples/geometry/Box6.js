var Box6 = function () {

	var scope = this;

	THREE.Geometry.call(this);

	v( -100.000000, 100.000000, -100.000000 );
	v( -100.000000, -100.000000, -100.000000 );
	v( 100.000000, 100.000000, -100.000000 );
	v( 100.000000, -100.000000, -100.000000 );
	v( 100.000000, 100.000000, 100.000000 );
	v( 100.000000, -100.000000, 100.000000 );
	v( -100.000000, 100.000000, 100.000000 );
	v( -100.000000, -100.000000, 100.000000 );

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
	scope.selections["top"] = [4];
	scope.selections["bottom"] = [5];
	scope.selections["front"] = [2];
	scope.selections["back"] = [0];
	scope.selections["left"] = [3];
	scope.selections["right"] = [1];
	scope.colors["top"] = 0xb20000;
	scope.colors["bottom"] = 0x00b200;
	scope.colors["front"] = 0x0000b2;
	scope.colors["back"] = 0x00b2b2;
	scope.colors["left"] = 0xb200b2;
	scope.colors["right"] = 0xb2b200;

	scope.autoColor = function(){
	    for(var s in this.selections){
			for(var i = 0 ; i < this.selections[s].length; i++) this.faces[this.selections[s][i]].material = [ new THREE.MeshBasicMaterial( { color: this.colors[s], wireframe: false } ) ];
		}
	}

	scope.getPosition = function(){	return new THREE.Vector3(0.0, 0.0, 0.0);	}

	scope.getRotation = function(){	return new THREE.Vector3(0.0, 0.0, 0.0);	}

	scope.getScale = function(){	return new THREE.Vector3(1.0, 1.0, 1.0);	}

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

Box6.prototype = new THREE.Geometry();
Box6.prototype.constructor = Box6;