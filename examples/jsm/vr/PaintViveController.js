/**
 * @author mrdoob / http://mrdoob.com
 */

import {
	CanvasTexture,
	CircleBufferGeometry,
	Color,
	DoubleSide,
	Group,
	IcosahedronBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	Shape,
	ShapeBufferGeometry
} from "../../../build/three.module.js";
import { ViveController } from "../vr/ViveController.js";

var PaintViveController = function ( id ) {

	ViveController.call( this, id );

	var PI2 = Math.PI * 2;

	var MODES = { COLOR: 0, SIZE: 1 };
	var mode = MODES.COLOR;

	var color = new Color( 1, 1, 1 );
	var size = 1.0;

	//

	function generateHueTexture() {

		var canvas = document.createElement( 'canvas' );
		canvas.width = 256;
		canvas.height = 256;

		var context = canvas.getContext( '2d' );
		var imageData = context.getImageData( 0, 0, 256, 256 );
		var data = imageData.data;
		var swatchColor = new Color();

		for ( var i = 0, j = 0; i < data.length; i += 4, j ++ ) {

			var x = ( ( j % 256 ) / 256 ) - 0.5;
			var y = ( Math.floor( j / 256 ) / 256 ) - 0.5;

			swatchColor.setHSL( Math.atan2( y, x ) / PI2, 1, ( 0.5 - Math.sqrt( x * x + y * y ) ) * 2.0 );

			data[ i + 0 ] = swatchColor.r * 256;
			data[ i + 1 ] = swatchColor.g * 256;
			data[ i + 2 ] = swatchColor.b * 256;
			data[ i + 3 ] = 256;

		}

		context.putImageData( imageData, 0, 0 );

		return new CanvasTexture( canvas );

	}

	// COLOR UI

	var geometry = new CircleBufferGeometry( 1, 32 );
	var material = new MeshBasicMaterial( { map: generateHueTexture() } );
	var colorUI = new Mesh( geometry, material );
	colorUI.position.set( 0, 0.005, 0.0495 );
	colorUI.rotation.x = - 1.45;
	colorUI.scale.setScalar( 0.02 );
	this.add( colorUI );

	var geometry = new IcosahedronBufferGeometry( 0.1, 2 );
	var material = new MeshBasicMaterial();
	material.color = color;
	var ball = new Mesh( geometry, material );
	colorUI.add( ball );


	// SIZE UI
	var sizeUI = new Group();
	sizeUI.position.set( 0, 0.005, 0.0495 );
	sizeUI.rotation.x = - 1.45;
	sizeUI.scale.setScalar( 0.02 );
	this.add( sizeUI );

	var triangleShape = new Shape();
	triangleShape.moveTo( 0, - 1 );
	triangleShape.lineTo( 1, 1 );
	triangleShape.lineTo( - 1, 1 );

	var geometry = new ShapeBufferGeometry( triangleShape );
	var material = new MeshBasicMaterial( { color: 0x222222, wireframe: true } );
	var sizeUIOutline = new Mesh( geometry, material );
	sizeUIOutline.position.z = 0.001;
	resizeTriangleGeometry( sizeUIOutline.geometry, 1.0 );
	sizeUI.add( sizeUIOutline );

	var geometry = new ShapeBufferGeometry( triangleShape );
	var material = new MeshBasicMaterial( { side: DoubleSide } );
	material.color = color;
	var sizeUIFill = new Mesh( geometry, material );
	sizeUIFill.position.z = 0.0011;
	resizeTriangleGeometry( sizeUIFill.geometry, 0.5 );
	sizeUI.add( sizeUIFill );

	sizeUI.visible = false;



	function onAxisChanged( event ) {

		if ( this.getButtonState( 'thumbpad' ) === false ) return;

		var x = event.axes[ 0 ] / 2.0;
		var y = - event.axes[ 1 ] / 2.0;

		if ( mode === MODES.COLOR ) {

			color.setHSL( Math.atan2( y, x ) / PI2, 1, ( 0.5 - Math.sqrt( x * x + y * y ) ) * 2.0 );

			ball.position.set( event.axes[ 0 ], event.axes[ 1 ], 0 );

		}

		if ( mode === MODES.SIZE ) {

			var ratio = 0.5 - y;
			size = ratio * 2;

			resizeTriangleGeometry( sizeUIFill.geometry, ratio );

		}

	}

	function resizeTriangleGeometry( geometry, ratio ) {

		var x = 0, y = 0;
		var fullWidth = 0.75, fullHeight = 1.5;
		var angle = Math.atan( ( fullWidth / 2 ) / fullHeight );

		var bottomY = y - fullHeight / 2;
		var height = fullHeight * ratio;
		var width = ( Math.tan( angle ) * height ) * 2;

		var position = geometry.attributes.position;

		position.setXYZ( 0, x, bottomY, 0 );
		position.setXYZ( 1, x + width / 2, bottomY + height, 0 );
		position.setXYZ( 2, x - width / 2, bottomY + height, 0 );

		position.needsUpdate = true;

	}

	function onGripsDown() {

		if ( mode === MODES.COLOR ) {

			mode = MODES.SIZE;
			colorUI.visible = false;
			sizeUI.visible = true;
			return;

		}

		if ( mode === MODES.SIZE ) {

			mode = MODES.COLOR;
			colorUI.visible = true;
			sizeUI.visible = false;
			return;

		}

	}

	this.getColor = function () {

		return color;

	};

	this.getSize = function () {

		return size;

	 };

	this.addEventListener( 'axischanged', onAxisChanged );
	this.addEventListener( 'gripsdown', onGripsDown );

};

PaintViveController.prototype = Object.create( ViveController.prototype );
PaintViveController.prototype.constructor = PaintViveController;

export { PaintViveController };
