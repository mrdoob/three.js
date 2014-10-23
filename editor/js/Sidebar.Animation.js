/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var options = {};
	var possibleAnimations = {};

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/animation/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/animation/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	var animationsRow = new UI.Panel();
	container.add( animationsRow );

	var animations = {};

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			if ( child instanceof THREE.SkinnedMesh ) {

				var material = child.material;

				if ( material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < material.materials.length; i ++ ) {

						material.materials[ i ].skinning = true;

					}

				} else {

					child.material.skinning = true;

				}

				animations[ child.id ] = new THREE.Animation( child, child.geometry.animation );

			}

		} );

	} );

	signals.objectSelected.add( function ( object ) {

		container.setDisplay( 'none' );

		if ( object instanceof THREE.SkinnedMesh ) {

			animationsRow.clear();

			var animation = animations[ object.id ];

			var playButton = new UI.Button().setLabel( 'Play' ).onClick( function () {

				animation.play();

				signals.playAnimation.dispatch( animation );

			} );
			animationsRow.add( playButton );

			var pauseButton = new UI.Button().setLabel( 'Stop' ).onClick( function () {

				animation.stop();

				signals.stopAnimation.dispatch( animation );

			} );
			animationsRow.add( pauseButton );

			container.setDisplay( 'block' );

		}

	} );

	return container;

}
