/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.BlendCharacter = function () {

	this.animations = {};
	this.weightSchedule = [];
	this.warpSchedule = [];

	this.load = function ( url, onLoad ) {

		var scope = this;

		var loader = new THREE.JSONLoader();
		loader.load( url, function( geometry, materials ) {

			var originalMaterial = materials[ 0 ];
			originalMaterial.skinning = true;

			THREE.SkinnedMesh.call( scope, geometry, originalMaterial );

			scope.mixer = new THREE.AnimationMixer( scope );

			// Create the animations		
			for ( var i = 0; i < geometry.animations.length; ++ i ) {

				var animName = geometry.animations[ i ].name;
				scope.animations[ animName ] = geometry.animations[ i ];

			}

			// Loading is complete, fire the callback
			if ( onLoad !== undefined ) onLoad();

		} );

	};

	this.update = function( dt ) {

		this.mixer.update( dt );

	};

	this.play = function( animName, weight ) {

		this.mixer.removeAllActions();
		
		this.mixer.play( new THREE.AnimationAction( this.animations[ animName ] ) );

	};

	this.crossfade = function( fromAnimName, toAnimName, duration ) {

		this.mixer.removeAllActions();
 
		var fromAction = new THREE.AnimationAction( this.animations[ fromAnimName ] );
		var toAction = new THREE.AnimationAction( this.animations[ toAnimName ] );

		this.mixer.play( fromAction );
		this.mixer.play( toAction );

		this.mixer.crossFade( fromAction, toAction, duration, false );

	};

	this.warp = function( fromAnimName, toAnimName, duration ) {

		this.mixer.removeAllActions();

		var fromAction = new THREE.AnimationAction( this.animations[ fromAnimName ] );
		var toAction = new THREE.AnimationAction( this.animations[ toAnimName ] );

		this.mixer.play( fromAction );
		this.mixer.play( toAction );

		this.mixer.crossFade( fromAction, toAction, duration, true );

	};

	this.applyWeight = function( animName, weight ) {

		var action = this.mixer.findActionByName( animName );
		if( action ) {
			action.weight = weight;
		}

	};

	this.pauseAll = function() {

		this.mixer.timeScale = 0;

	};

	this.unPauseAll = function() {

		this.mixer.timeScale = 1;

	};


	this.stopAll = function() {

		this.mixer.removeAllActions();

	};

	this.showModel = function( boolean ) {

		this.visible = boolean;

	}

};


THREE.BlendCharacter.prototype = Object.create( THREE.SkinnedMesh.prototype );
THREE.BlendCharacter.prototype.constructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function() {

	var forward = new THREE.Vector3();

	return function() {

		// pull the character's forward basis vector out of the matrix
		forward.set(
			- this.matrix.elements[ 8 ],
			- this.matrix.elements[ 9 ],
			- this.matrix.elements[ 10 ]
		);

		return forward;

	}

};

