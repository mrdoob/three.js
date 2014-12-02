/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GridHelper = function ( size, step, colorCenterLine, colorGrid ) {

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
	
	if ( colorCenterLine === undefined ) colorCenterLine = 0x444444;
	if ( colorGrid === undefined ) colorGrid = 0x888888;
	
	this.colors = {
		centerLine: new THREE.Color(),
    		grid: new THREE.Color()
	};
	this.colors.centerLine.set( colorCenterLine );
	this.colors.grid.set( colorGrid );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push(
			new THREE.Vector3( - size, 0, i ), new THREE.Vector3( size, 0, i ),
			new THREE.Vector3( i, 0, - size ), new THREE.Vector3( i, 0, size )
		);

		var color = i === 0 ? this.colors.centerLine : this.colors.grid;

		geometry.colors.push( color, color, color, color );

	}

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

};

THREE.GridHelper.prototype = Object.create( THREE.Line.prototype );
THREE.GridHelper.prototype.constructor = THREE.GridHelper;

THREE.GridHelper.prototype.setColors = function ( colorCenterLine, colorGrid ) {

	this.colors.centerLine.set( colorCenterLine );
	this.colors.grid.set( colorGrid );

	this.geometry.colorsNeedUpdate = true;

};
