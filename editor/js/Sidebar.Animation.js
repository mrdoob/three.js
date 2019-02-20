/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var renderer = null;

	signals.rendererChanged.add( function ( newRenderer ) {

		renderer = newRenderer;

	} );

	signals.objectSelected.add( function ( object ) {

		var uuid = object !== null ? object.uuid : '';
		var animations = editor.animations[ uuid ];
		if ( animations !== undefined ) {

			container.setDisplay( '' );

			mixer = new THREE.AnimationMixer( object );
			var options = {};
			for ( var animation of animations ) {

				options[ animation.name ] = animation.name;

				var action = mixer.clipAction( animation );
				actions[ animation.name ] = action;

			}
			animationsSelect.setOptions( options );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	var mixer, currentAnimation, actions = {};

	var clock = new THREE.Clock();
	function updateAnimation() {

		if ( mixer !== undefined && renderer !== null ) {

			var dt = clock.getDelta();
			mixer.update( dt * speed.getValue() );
			if ( currentAnimation !== undefined && currentAnimation.isRunning() ) {

				requestAnimationFrame( updateAnimation );
				renderer.render( editor.scene, editor.camera );

			} else {

				currentAnimation = undefined;

			}

		}

	}

	function playAnimation() {

		currentAnimation = actions[ animationsSelect.getValue() ];
		if ( currentAnimation !== undefined ) {

			stopAnimations();
			currentAnimation.play();
			updateAnimation();

		}

	}

	function stopAnimations() {

		if ( mixer !== undefined ) {

			mixer.stopAllAction();

		}

	}

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );

	var div = new UI.Div().setMarginLeft( '90px' );
	container.add( div );

	div.add( new UI.Button( "Play" ).setFontSize( '12px' ).onClick( playAnimation ).setMarginRight( '10px' ) );

	div.add( new UI.Button( "Stop" ).setFontSize( '12px' ).onClick( stopAnimations ), new UI.Break() );

	var animationsSelect = new UI.Select().setFontSize( '12px' ).setMarginTop( '10px' ).setMarginBottom( '10px' );
	div.add( animationsSelect, new UI.Break() );

	var row = new UI.Row();
	div.add( row );

	var speed = new UI.Number( 1 ).setRange( 0.25, 2 ).setStep( 0.5 ).setMarginLeft( '10px' );
	row.add( new UI.Text( "Speed" ), speed );

	return container;

};
