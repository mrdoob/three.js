/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AxisHelper = function ( size ) {

	size = size || 1;
	
	this.colors = {
		xAxisStart: new THREE.Color( 1, 0, 0 ), xAxisEnd: new THREE.Color( 1, 0.6, 0 ),
		yAxisStart: new THREE.Color( 0, 1, 0 ), yAxisEnd: new THREE.Color( 0.6, 1, 0 ),
		zAxisStart: new THREE.Color( 0, 0, 1 ), zAxisEnd: new THREE.Color( 0, 0.6, 1 )
	};

	var vertices = new Float32Array( [
		0, 0, 0,  size, 0, 0,
		0, 0, 0,  0, size, 0,
		0, 0, 0,  0, 0, size
	] );

	var colors = new Float32Array( [
		this.colors.xAxisStart.r, this.colors.xAxisStart.g, this.colors.xAxisStart.b,  this.colors.xAxisEnd.r, this.colors.xAxisEnd.g, this.colors.xAxisEnd.b,
		this.colors.yAxisStart.r, this.colors.yAxisStart.g, this.colors.yAxisStart.b,  this.colors.yAxisEnd.r, this.colors.yAxisEnd.g, this.colors.yAxisEnd.b,
		this.colors.zAxisStart.r, this.colors.zAxisStart.g, this.colors.zAxisStart.b,  this.colors.zAxisEnd.r, this.colors.zAxisEnd.g, this.colors.zAxisEnd.b
	] );

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

};

THREE.AxisHelper.prototype = Object.create( THREE.Line.prototype );
THREE.AxisHelper.prototype.constructor = THREE.AxisHelper;

THREE.AxisHelper.prototype.setColors = function ( xStart, xEnd, yStart, yEnd, zStart, zEnd ) {

	this.colors.xAxisStart.set( xStart );  this.colors.xAxisEnd.set( xEnd );
	this.colors.yAxisStart.set( yStart );  this.colors.yAxisEnd.set( yEnd );
	this.colors.zAxisStart.set( zStart );  this.colors.zAxisEnd.set( zEnd );
	
	var colorArray = this.geometry.attributes.color.array;
	
	colorArray[ 0 ] = this.colors.xAxisStart.r;  colorArray[ 1 ] = this.colors.xAxisStart.g;  colorArray[ 2 ] = this.colors.xAxisStart.b;
	colorArray[ 3 ] = this.colors.xAxisEnd.r;    colorArray[ 4 ] = this.colors.xAxisEnd.g;    colorArray[ 5 ] = this.colors.xAxisEnd.b;
	colorArray[ 6 ] = this.colors.yAxisStart.r;  colorArray[ 7 ] = this.colors.yAxisStart.g;  colorArray[ 8 ] = this.colors.yAxisStart.b;
	colorArray[ 9 ] = this.colors.yAxisEnd.r;    colorArray[ 10 ] = this.colors.yAxisEnd.g;   colorArray[ 11 ] = this.colors.yAxisEnd.b;
	colorArray[ 12 ] = this.colors.zAxisStart.r; colorArray[ 13 ] = this.colors.zAxisStart.g; colorArray[ 14 ] = this.colors.zAxisStart.b;
	colorArray[ 15 ] = this.colors.zAxisEnd.r;   colorArray[ 16 ] = this.colors.zAxisEnd.g;   colorArray[ 17 ] = this.colors.zAxisEnd.b;
	
	this.geometry.attributes.color.needsUpdate = true;

};
