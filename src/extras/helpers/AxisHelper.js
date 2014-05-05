/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AxisHelper = function ( size ) {

	size = size || 1;

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute( 'position', new THREE.Float32Attribute( 6, 3 ) );
	geometry.addAttribute( 'color', new THREE.Float32Attribute( 6, 3 ) );

	var positions = geometry.attributes.position.array;
	var colors = geometry.attributes.color.array;

	positions[3] = positions[10] = positions[17] = size;
	colors[0] = colors[3] = colors[7] = colors[10] = colors[14] = colors[17] = 1;
	colors[4] = colors[9] = colors[16] = 2 / 3;

	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

};

THREE.AxisHelper.prototype = Object.create( THREE.Line.prototype );
