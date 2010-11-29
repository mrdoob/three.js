var Dice = function () {

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
	uv( 0.488325, 0.325550, 0.488325, 0.007784, 0.011675, 0.007784, 0.011675, 0.325550);
	f4( 4, 5, 3, 2, 0.000000, 0.000000, 1.000000 );
	uv( 0.988325, 0.325550, 0.988325, 0.007784, 0.511675, 0.007784, 0.511675, 0.325550);
	f4( 6, 7, 5, 4, 0.000000, 0.000000, 1.000000 );
	uv( 0.488325, 0.658883, 0.488325, 0.341117, 0.011675, 0.341117, 0.011675, 0.658883);
	f4( 0, 1, 7, 6, 0.000000, 0.000000, 1.000000 );
	uv( 0.988325, 0.658883, 0.988325, 0.341117, 0.511675, 0.341117, 0.511675, 0.658883);
	f4( 3, 5, 7, 1, -1.000000, 0.000000, 0.000000 );
	uv( 0.488325, 0.992216, 0.488325, 0.674450, 0.011675, 0.674450, 0.011675, 0.992216);
	f4( 4, 2, 0, 6, -1.000000, 0.000000, 0.000000 );
	uv( 0.988325, 0.992216, 0.988325, 0.674450, 0.511675, 0.674450, 0.511675, 0.992216);

	scope.autoColor = function(){
		this.colors = {};
		this.selections = {};
		var i = 0;
		this.colors[""] = 0xcccccc;
		for(var s in this.selections){
			for(i = 0 ; i < this.selections[s].length; i++) this.faces[this.selections[s][i]].material = [ new THREE.MeshColorFillMaterial( this.colors[s],1) ];
		}
	}

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

Dice.prototype = new THREE.Geometry();
Dice.prototype.constructor = Dice;