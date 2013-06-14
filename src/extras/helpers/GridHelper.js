/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GridHelper = function ( size, step, color1, color2) {

	color1 = new THREE.Color( color1 === undefined ? 0x444444: color1 );
	color2 = new THREE.Color( color2 === undefined ? 0x888888: color2 );

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push(
			new THREE.Vector3( - size, 0, i ), new THREE.Vector3( size, 0, i ),
			new THREE.Vector3( i, 0, - size ), new THREE.Vector3( i, 0, size )
		);

		var color = i === 0 ? color1 : color2;

		geometry.colors.push( color, color, color, color );

	}

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

};

THREE.GridHelper.prototype = Object.create( THREE.Line.prototype );
