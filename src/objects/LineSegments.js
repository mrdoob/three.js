/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LineSegments = function LineSegments ( geometry, material ) {

	THREE.Line.call( this, geometry, material );

};

THREE.LineSegments.prototype = Object.create( THREE.Line.prototype );
THREE.LineSegments.prototype.constructor = THREE.LineSegments;
