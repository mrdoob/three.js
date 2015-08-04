/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LineSegments = function ( geometry, material ) {

	THREE.Line.call( this, geometry, material );

	this.type = 'LineSegments';

};

THREE.LineSegments.prototype = Object.create( THREE.Line.prototype );
THREE.LineSegments.prototype.constructor = THREE.LineSegments;

THREE.LineSegments.prototype.clone = function () {

	var line = new THREE.LineSegments( this.geometry, this.material );

	line.copy( this );

	return line;

};
