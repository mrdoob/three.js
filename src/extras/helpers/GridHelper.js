/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GridHelper = function ( size, step, color1, color2 ) {

	color1 = new THREE.Color( color1 !== undefined ? color1 : 0x444444 );
	color2 = new THREE.Color( color2 !== undefined ? color2 : 0x888888 );

	var vertices = [];
	var colors = [];

	for ( var i = - size, j = 0; i <= size; i += step ) {

		vertices.push( - size, 0, i, size, 0, i );
		vertices.push( i, 0, - size, i, 0, size );

		var color = i === 0 ? color1 : color2;

		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;
		color.toArray( colors, j ); j += 3;

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new THREE.Float32Attribute( colors, 3 ) );

	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	THREE.LineSegments.call( this, geometry, material );

};

THREE.GridHelper.prototype = Object.create( THREE.LineSegments.prototype );
THREE.GridHelper.prototype.constructor = THREE.GridHelper;

THREE.GridHelper.prototype.setColors = function () {

	console.error( 'THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.' );

};
