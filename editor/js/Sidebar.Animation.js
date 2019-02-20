/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;
	var mixer = editor.animationMixer;

	var actions = {};

	signals.objectSelected.add( function ( object ) {

		var animations = editor.animations[ object !== null ? object.uuid : '' ];

		if ( animations !== undefined ) {

			container.setDisplay( '' );

			var options = {};
			var firstAnimation;

			for ( var animation of animations ) {

				if ( firstAnimation === undefined ) firstAnimation = animation.name;

				actions[ animation.name ] = mixer.clipAction( animation, object );
				options[ animation.name ] = animation.name;

			}

			animationsSelect.setOptions( options );
			animationsSelect.setValue( firstAnimation );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectRemoved.add( function ( object ) {

		var animations = editor.animations[ object !== null ? object.uuid : '' ];

		if ( animations !== undefined ) {

			mixer.uncacheRoot( object );

		}

	} );

	function playAction() {

		actions[ animationsSelect.getValue() ].play();

	}

	function stopAction() {

		actions[ animationsSelect.getValue() ].stop();

	}

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text( 'Animations' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );
	container.add( new UI.Break() );

	var div = new UI.Div();
	container.add( div );

	var animationsSelect = new UI.Select().setFontSize( '12px' );
	div.add( animationsSelect );
	div.add( new UI.Button( 'Play' ).setMarginLeft( '4px' ).onClick( playAction ) );
	div.add( new UI.Button( 'Stop' ).setMarginLeft( '4px' ).onClick( stopAction ) );

	return container;

};
