/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SegmentsLine = function ( geometry, material ) {

	THREE.Line.call( this, geometry, material );

	this.type = 'SegmentsLine';

};

THREE.SegmentsLine.prototype = Object.create( THREE.Line.prototype );
THREE.SegmentsLine.prototype.constructor = THREE.SegmentsLine;
