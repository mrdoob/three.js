/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var renderer = null;

	signals.rendererChanged.add( function ( newRenderer ) {
		renderer = newRenderer;
	});

	signals.objectSelected.add(function(object)
	{
		var uuid = object !== null ? object.uuid : '';
		var animations = editor.animations[uuid];
		if(animations !== undefined)
		{
			container.setDisplay('');

			mixer = new THREE.AnimationMixer(object);
			var options = {};
			for(var animation of animations)
			{
				options[animation.name] = animation.name;

				var action = mixer.clipAction(animation);
				actions[animation.name] = action;
			}
			animationsSelect.setOptions(options);
		}
		else
		{
			container.setDisplay('none');
		}
	});

	var mixer, currentAnimation, actions = {};

	var clock = new THREE.Clock();
	function updateAnimation()
	{
		if(mixer !== undefined && renderer !== null)
		{
			var dt = clock.getDelta();
			mixer.update(dt);
			if(currentAnimation !== undefined && currentAnimation.isRunning())
			{
				requestAnimationFrame(updateAnimation);
				renderer.render(editor.scene, editor.camera);
			}
			else
			{
				currentAnimation = undefined;
			}
		}
	}

	function stopAnimations()
	{
		if(mixer !== undefined)
		{
			mixer.stopAllAction();
		}
	}

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );

	var div = new UI.Div().setMarginLeft('90px');
	container.add(div);

	div.add(new UI.Button("Stop").setFontSize('12px').onClick(stopAnimations), new UI.Break());

	var animationsSelect = new UI.Select().setFontSize('12px').setMarginTop('10px').onChange(function()
	{
		currentAnimation = actions[animationsSelect.getValue()];
		if(currentAnimation !== undefined)
		{
			stopAnimations();
			currentAnimation.play();
			updateAnimation();
		}
	});
	div.add( animationsSelect );

	return container;

};
