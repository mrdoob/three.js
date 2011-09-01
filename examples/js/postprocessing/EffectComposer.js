/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function( renderer, renderTarget ) {

	this.renderer = renderer;

	this.renderTarget1 = renderTarget;

	if ( this.renderTarget1 === undefined ) {

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
		this.renderTarget1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

	}

	this.renderTarget2 = this.renderTarget1.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	render: function ( delta ) {

		var i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			this.passes[ i ].render( this.renderer, this.writeBuffer, this.readBuffer, delta );

			if ( this.passes[ i ].needsSwap ) {

				this.swapBuffers();

			}

		}

	},

	reset: function ( renderTarget ) {

		this.renderTarget1 = renderTarget;

		if ( this.renderTarget1 === undefined ) {

			this.renderTarget1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

		}

		this.renderTarget2 = this.renderTarget1.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		THREE.EffectComposer.quad.scale.set( window.innerWidth, window.innerHeight, 1 );

		THREE.EffectComposer.camera.left = window.innerWidth / - 2;
		THREE.EffectComposer.camera.right = window.innerWidth / 2;
		THREE.EffectComposer.camera.top = window.innerHeight / 2;
		THREE.EffectComposer.camera.bottom = window.innerHeight / - 2;

		THREE.EffectComposer.camera.updateProjectionMatrix();

	}

};

// shared fullscreen quad scene

THREE.EffectComposer.geometry = new THREE.PlaneGeometry( 1, 1 );

THREE.EffectComposer.quad = new THREE.Mesh( THREE.EffectComposer.geometry, null );
THREE.EffectComposer.quad.position.z = -100;
THREE.EffectComposer.quad.scale.set( window.innerWidth, window.innerHeight, 1 );

THREE.EffectComposer.scene = new THREE.Scene();
THREE.EffectComposer.scene.addObject( THREE.EffectComposer.quad );

// shared ortho camera

THREE.EffectComposer.camera = new THREE.OrthoCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

