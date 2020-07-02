/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from '../../build/three.module.js';

function ViewHelper() {

	THREE.Object3D.call( this );

	var color1 = new THREE.Color( '#ff3653' );
	var color2 = new THREE.Color( '#8adb00' );
	var color3 = new THREE.Color( '#2c8fff' );

	var camera = new THREE.OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
	camera.position.set( 0, 0, 2 );

	var geometry = new THREE.BoxBufferGeometry( 0.8, 0.05, 0.05 ).translate( 0.4, 0, 0 );

	var xAxis = new THREE.Mesh( geometry, getAxisMaterial( color1 ) );
	var yAxis = new THREE.Mesh( geometry, getAxisMaterial( color2 ) );
	var zAxis = new THREE.Mesh( geometry, getAxisMaterial( color3 ) );

	yAxis.rotation.z = Math.PI / 2;
	zAxis.rotation.y = - Math.PI / 2;

	this.add( xAxis );
	this.add( zAxis );
	this.add( yAxis );

	var posXAxisHelper = new THREE.Sprite( getSpriteMaterial( color1, 'X' ) );
	var posYAxisHelper = new THREE.Sprite( getSpriteMaterial( color2, 'Y' ) );
	var posZAxisHelper = new THREE.Sprite( getSpriteMaterial( color3, 'Z' ) );
	var negXAxisHelper = new THREE.Sprite( getSpriteMaterial( color1 ) );
	var negYAxisHelper = new THREE.Sprite( getSpriteMaterial( color2 ) );
	var negZAxisHelper = new THREE.Sprite( getSpriteMaterial( color3 ) );

	posXAxisHelper.position.x = 1;
	posYAxisHelper.position.y = 1;
	posZAxisHelper.position.z = 1;
	negXAxisHelper.position.x = - 1;
	negXAxisHelper.scale.setScalar( 0.8 );
	negYAxisHelper.position.y = - 1;
	negYAxisHelper.scale.setScalar( 0.8 );
	negZAxisHelper.position.z = - 1;
	negZAxisHelper.scale.setScalar( 0.8 );

	this.add( posXAxisHelper );
	this.add( posYAxisHelper );
	this.add( posZAxisHelper );
	this.add( negXAxisHelper );
	this.add( negYAxisHelper );
	this.add( negZAxisHelper );

	var point = new THREE.Vector3();
	var dim = 128;

	this.render = function ( renderer, editorCamera, container ) {

		this.quaternion.copy( editorCamera.quaternion ).inverse();
		this.updateMatrixWorld();

		point.set( 0, 0, 1 );
		point.applyQuaternion( editorCamera.quaternion );

		if ( point.x >= 0 ) {

			posXAxisHelper.material.opacity = 1;
			negXAxisHelper.material.opacity = 0.5;

		} else {

			posXAxisHelper.material.opacity = 0.5;
			negXAxisHelper.material.opacity = 1;

		}

		if ( point.y >= 0 ) {

			posYAxisHelper.material.opacity = 1;
			negYAxisHelper.material.opacity = 0.5;

		} else {

			posYAxisHelper.material.opacity = 0.5;
			negYAxisHelper.material.opacity = 1;

		}

		if ( point.z >= 0 ) {

			posZAxisHelper.material.opacity = 1;
			negZAxisHelper.material.opacity = 0.5;

		} else {

			posZAxisHelper.material.opacity = 0.5;
			negZAxisHelper.material.opacity = 1;

		}

		//

		var x = container.dom.offsetWidth - dim;

		renderer.clearDepth();
		renderer.setViewport( x, 0, dim, dim );
		renderer.render( this, camera );

	};

	function getAxisMaterial( color ) {

		return new THREE.MeshBasicMaterial( { color: color, toneMapped: false } );

	}

	function getSpriteMaterial( color, text = null ) {

		var canvas = document.createElement( 'canvas' );
		canvas.width = 64;
		canvas.height = 64;

		var context = canvas.getContext( '2d' );
		context.beginPath();
		context.arc( 32, 32, 16, 0, 2 * Math.PI );
		context.closePath();
		context.fillStyle = color.getStyle();
		context.fill();

		if ( text !== null ) {

			context.font = '24px Arial';
			context.textAlign = 'center';
			context.fillStyle = '#000000';
			context.fillText( text, 32, 41 );

		}

		var texture = new THREE.CanvasTexture( canvas );

		return new THREE.SpriteMaterial( { map: texture, toneMapped: false } );

	}

}

ViewHelper.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: ViewHelper,

	isViewHelper: true

} );

export { ViewHelper };
