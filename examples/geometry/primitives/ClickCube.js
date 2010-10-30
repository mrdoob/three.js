/**
 * @author mr.doob / http://mrdoob.com/
 */

var ClickCube = function (width, height, depth, onSelect) {

	THREE.Geometry.call(this);

	var scope = this,
	width_half = width / 2,
	height_half = height / 2,
	depth_half = depth / 2;

	v(  width_half,  height_half, -depth_half );
	v(  width_half, -height_half, -depth_half );
	v( -width_half, -height_half, -depth_half );
	v( -width_half,  height_half, -depth_half );
	v(  width_half,  height_half,  depth_half );
	v(  width_half, -height_half,  depth_half );
	v( -width_half, -height_half,  depth_half );
	v( -width_half,  height_half,  depth_half );

	f4( 0, 1, 2, 3 );
	
	f4( 4, 7, 6, 5 );
	f4( 0, 4, 5, 1 );
	f4( 2, 6, 7, 3 );
	f4( 1, 5, 6, 2 );
	f4( 4, 0, 3, 7 );

	function v(x, y, z) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
	}

	function f4(a, b, c, d) {
		var f = new THREE.SelectableFace4( a, b, c, d, onSelect );
		scope.faces.push(f);
	}

	this.computeCentroids();
	this.computeNormals();

};

ClickCube.prototype = new THREE.Geometry();
ClickCube.prototype.constructor = ClickCube;
