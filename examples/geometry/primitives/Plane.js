/**
 * @author mr.doob / http://mrdoob.com/
 */

var Plane = function (width, height) {

	THREE.Geometry.call(this);

	var scope = this,
	width_half = width / 2,
	height_half = height / 2;
		
	v( -width_half,  height_half, 0 );
	v(  width_half,  height_half, 0 );
	v(  width_half, -height_half, 0 );
	v( -width_half, -height_half, 0 );
		
	f4( 0, 1, 2, 3 );
	
	function v(x, y, z) {
	
		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
	}

	function f4(a, b, c, d) {
	
		scope.faces.push( new THREE.Face4(a, b, c, d) );
	}	
}

Plane.prototype = new THREE.Geometry();
Plane.prototype.constructor = Plane;
