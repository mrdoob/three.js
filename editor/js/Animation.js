import { UIPanel, UIText, UIButton } from './libs/ui.js';

import { AnimationPathHelper } from 'three/addons/helpers/AnimationPathHelper.js';

function Animation( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'animation' );
	container.dom.style.flexDirection = 'column';

	let panelHeight = 36;

	// Listen for resizer changes
	signals.animationPanelResized.add( function ( height ) {

		panelHeight = height;
		container.dom.style.height = height + 'px';
		signals.animationPanelChanged.dispatch( height );

	} );

	// Top bar - playback controls
	const controlsPanel = new UIPanel();
	controlsPanel.dom.style.padding = '6px 10px';
	controlsPanel.dom.style.borderBottom = '1px solid #ccc';
	controlsPanel.dom.style.display = 'flex';
	controlsPanel.dom.style.alignItems = 'center';
	controlsPanel.dom.style.justifyContent = 'center';
	controlsPanel.dom.style.gap = '6px';
	controlsPanel.dom.style.flexShrink = '0';
	container.add( controlsPanel );

	// SVG icons
	const playIcon = `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1.5v9l7-4.5z" fill="currentColor"/></svg>`;
	const pauseIcon = `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor"/></svg>`;
	const stopIcon = `<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="currentColor"/></svg>`;

	const playButton = new UIButton();
	playButton.dom.innerHTML = playIcon;
	playButton.dom.style.width = '24px';
	playButton.dom.style.height = '24px';
	playButton.dom.style.padding = '0';
	playButton.dom.style.borderRadius = '4px';
	playButton.dom.style.display = 'flex';
	playButton.dom.style.alignItems = 'center';
	playButton.dom.style.justifyContent = 'center';
	playButton.onClick( function () {

		if ( currentAction ) {

			if ( currentAction.paused ) {

				currentAction.paused = false;

			} else if ( ! currentAction.isRunning() ) {

				currentAction.reset();
				currentAction.play();

			}

		}

	} );
	controlsPanel.add( playButton );

	const pauseButton = new UIButton();
	pauseButton.dom.innerHTML = pauseIcon;
	pauseButton.dom.style.width = '24px';
	pauseButton.dom.style.height = '24px';
	pauseButton.dom.style.padding = '0';
	pauseButton.dom.style.borderRadius = '4px';
	pauseButton.dom.style.display = 'flex';
	pauseButton.dom.style.alignItems = 'center';
	pauseButton.dom.style.justifyContent = 'center';
	pauseButton.onClick( function () {

		if ( currentAction ) {

			currentAction.paused = true;

		}

	} );
	controlsPanel.add( pauseButton );

	const stopButton = new UIButton();
	stopButton.dom.innerHTML = stopIcon;
	stopButton.dom.style.width = '24px';
	stopButton.dom.style.height = '24px';
	stopButton.dom.style.padding = '0';
	stopButton.dom.style.borderRadius = '4px';
	stopButton.dom.style.display = 'flex';
	stopButton.dom.style.alignItems = 'center';
	stopButton.dom.style.justifyContent = 'center';
	stopButton.onClick( function () {

		if ( currentAction ) {

			currentAction.stop();

		}

	} );
	controlsPanel.add( stopButton );

	// Time display
	const timeDisplay = document.createElement( 'div' );
	timeDisplay.style.display = 'flex';
	timeDisplay.style.alignItems = 'center';
	timeDisplay.style.justifyContent = 'center';
	timeDisplay.style.gap = '4px';
	timeDisplay.style.height = '24px';
	timeDisplay.style.padding = '0 8px';
	timeDisplay.style.background = 'rgba(0,0,0,0.05)';
	timeDisplay.style.borderRadius = '4px';
	timeDisplay.style.fontFamily = 'monospace';
	timeDisplay.style.fontSize = '11px';
	controlsPanel.dom.appendChild( timeDisplay );

	const timeText = new UIText( '0.00' ).setWidth( '36px' );
	timeText.dom.style.textAlign = 'right';
	timeDisplay.appendChild( timeText.dom );

	const separator = new UIText( '/' );
	timeDisplay.appendChild( separator.dom );

	const durationText = new UIText( '0.00' ).setWidth( '36px' );
	timeDisplay.appendChild( durationText.dom );

	// Timeline area with track rows
	const timelineArea = document.createElement( 'div' );
	timelineArea.style.flex = '1';
	timelineArea.style.display = 'flex';
	timelineArea.style.flexDirection = 'column';
	timelineArea.style.overflow = 'hidden';
	timelineArea.style.position = 'relative';
	container.dom.appendChild( timelineArea );

	// Scrollable track list
	const trackListContainer = document.createElement( 'div' );
	trackListContainer.style.flex = '1';
	trackListContainer.style.overflowY = 'auto';
	trackListContainer.style.overflowX = 'hidden';
	timelineArea.appendChild( trackListContainer );

	// Playhead (spans entire timeline area)
	const playhead = document.createElement( 'div' );
	playhead.style.position = 'absolute';
	playhead.style.top = '0';
	playhead.style.bottom = '0';
	playhead.style.width = '2px';
	playhead.style.background = '#f00';
	playhead.style.left = '150px'; // Start at timeline start (after labels)
	playhead.style.pointerEvents = 'none';
	playhead.style.zIndex = '10';
	timelineArea.appendChild( playhead );

	// Timeline scrubbing
	let isDragging = false;
	const labelWidth = 150;

	function updateTimeFromPosition( clientX ) {

		const rect = timelineArea.getBoundingClientRect();
		const timelineStart = labelWidth;
		const timelineWidth = rect.width - labelWidth;
		const x = Math.max( 0, Math.min( clientX - rect.left - timelineStart, timelineWidth ) );
		const percent = x / timelineWidth;

		if ( currentAction && currentClip ) {

			const time = percent * currentClip.duration;
			currentAction.play();
			currentAction.time = time;
			currentAction.paused = true;
			editor.mixer.update( 0 );

		}

	}

	timelineArea.addEventListener( 'mousedown', function ( event ) {

		const rect = timelineArea.getBoundingClientRect();
		if ( event.clientX - rect.left > labelWidth ) {

			event.preventDefault();

			isDragging = true;
			updateTimeFromPosition( event.clientX );

		}

	} );

	document.addEventListener( 'mousemove', function ( event ) {

		if ( isDragging ) {

			updateTimeFromPosition( event.clientX );

		}

	} );

	document.addEventListener( 'mouseup', function () {

		isDragging = false;

	} );

	// Track colors by type
	const trackColors = {
		position: '#4CAF50',
		quaternion: '#2196F3',
		rotation: '#2196F3',
		scale: '#FF9800',
		morphTargetInfluences: '#9C27B0',
		default: '#607D8B'
	};

	function getTrackColor( trackName ) {

		for ( const type in trackColors ) {

			if ( trackName.endsWith( '.' + type ) ) {

				return trackColors[ type ];

			}

		}

		return trackColors.default;

	}

	function getTrackType( trackName ) {

		const parts = trackName.split( '.' );
		return parts[ parts.length - 1 ];

	}

	// Hover path helper
	let hoverHelper = null;
	let currentAction = null;
	let currentClip = null;
	let currentRoot = null;

	// Get all clips from scene animations
	function getAnimationClips() {

		const scene = editor.scene;
		const clips = [];
		const seen = new Set();

		scene.traverse( function ( object ) {

			if ( object.animations && object.animations.length > 0 ) {

				for ( const clip of object.animations ) {

					if ( ! seen.has( clip.uuid ) ) {

						seen.add( clip.uuid );
						clips.push( { clip: clip, root: object } );

					}

				}

			}

		} );

		// Also check scene.animations directly
		for ( const clip of scene.animations ) {

			if ( ! seen.has( clip.uuid ) ) {

				seen.add( clip.uuid );
				clips.push( { clip: clip, root: scene } );

			}

		}

		return clips;

	}

	function getObjectName( trackName, root ) {

		// Extract UUID from track name (format: uuid.property)
		const dotIndex = trackName.lastIndexOf( '.' );
		if ( dotIndex === - 1 ) return trackName;

		const uuid = trackName.substring( 0, dotIndex );
		const object = root.getObjectByProperty( 'uuid', uuid );

		return object ? ( object.name || 'Object' ) : uuid.substring( 0, 8 );

	}

	function update() {

		trackListContainer.innerHTML = '';

		container.setDisplay( 'flex' );
		container.dom.style.height = panelHeight + 'px';
		signals.animationPanelChanged.dispatch( panelHeight );

		const clips = getAnimationClips();

		if ( clips.length === 0 ) {

			return;

		}

		for ( const { clip, root } of clips ) {

			// Clip header row
			const clipRow = document.createElement( 'div' );
			clipRow.style.display = 'flex';
			clipRow.style.alignItems = 'center';
			clipRow.style.height = '24px';
			clipRow.style.borderBottom = '1px solid #ccc';
			clipRow.style.cursor = 'pointer';
			clipRow.style.background = currentClip === clip ? 'rgba(0, 136, 255, 0.1)' : '';

			const clipLabel = document.createElement( 'div' );
			clipLabel.style.width = labelWidth + 'px';
			clipLabel.style.padding = '0 10px';
			clipLabel.style.fontSize = '11px';
			clipLabel.style.fontWeight = 'bold';
			clipLabel.style.overflow = 'hidden';
			clipLabel.style.textOverflow = 'ellipsis';
			clipLabel.style.whiteSpace = 'nowrap';
			clipLabel.style.flexShrink = '0';
			clipLabel.style.boxSizing = 'border-box';
			clipLabel.textContent = clip.name || 'Animation';
			clipRow.appendChild( clipLabel );

			const clipTimeline = document.createElement( 'div' );
			clipTimeline.style.flex = '1';
			clipTimeline.style.height = '100%';
			clipTimeline.style.background = 'rgba(0,0,0,0.03)';
			clipRow.appendChild( clipTimeline );

			clipRow.addEventListener( 'click', function () {

				editor.select( root );
				selectClip( clip, root );
				update(); // Refresh to update highlighting

			} );

			trackListContainer.appendChild( clipRow );

			// Only show tracks for selected clip
			if ( currentClip === clip ) {

				const duration = clip.duration;

				for ( const track of clip.tracks ) {

					const times = track.times;
					if ( times.length === 0 ) continue;

					const startTime = times[ 0 ];
					const endTime = times[ times.length - 1 ];
					const startPercent = ( startTime / duration ) * 100;
					const widthPercent = ( ( endTime - startTime ) / duration ) * 100;

					const trackRow = document.createElement( 'div' );
					trackRow.style.display = 'flex';
					trackRow.style.alignItems = 'center';
					trackRow.style.height = '20px';
					trackRow.style.borderBottom = '1px solid #eee';

					// Track label
					const trackLabel = document.createElement( 'div' );
					trackLabel.style.width = labelWidth + 'px';
					trackLabel.style.padding = '0 10px 0 20px';
					trackLabel.style.fontSize = '10px';
					trackLabel.style.overflow = 'hidden';
					trackLabel.style.textOverflow = 'ellipsis';
					trackLabel.style.whiteSpace = 'nowrap';
					trackLabel.style.flexShrink = '0';
					trackLabel.style.boxSizing = 'border-box';
					trackLabel.style.color = '#666';

					const objectName = getObjectName( track.name, root );
					const trackType = getTrackType( track.name );
					trackLabel.textContent = objectName + '.' + trackType;
					trackLabel.title = track.name;
					trackRow.appendChild( trackLabel );

					// Track timeline with block
					const trackTimeline = document.createElement( 'div' );
					trackTimeline.style.flex = '1';
					trackTimeline.style.height = '100%';
					trackTimeline.style.position = 'relative';
					trackTimeline.style.background = 'rgba(0,0,0,0.02)';

					const block = document.createElement( 'div' );
					block.style.position = 'absolute';
					block.style.left = startPercent + '%';
					block.style.width = Math.max( 0.5, widthPercent ) + '%';
					block.style.top = '3px';
					block.style.bottom = '3px';
					block.style.background = getTrackColor( track.name );
					block.style.borderRadius = '2px';
					block.style.opacity = '0.6';
					block.title = trackType + ': ' + startTime.toFixed( 2 ) + 's - ' + endTime.toFixed( 2 ) + 's';

					trackTimeline.appendChild( block );

					// Add keyframe markers
					for ( let i = 0; i < times.length; i ++ ) {

						const keyframePercent = ( times[ i ] / duration ) * 100;
						const keyframe = document.createElement( 'div' );
						keyframe.style.position = 'absolute';
						keyframe.style.left = keyframePercent + '%';
						keyframe.style.top = '50%';
						keyframe.style.width = '6px';
						keyframe.style.height = '6px';
						keyframe.style.marginLeft = '-3px';
						keyframe.style.marginTop = '-3px';
						keyframe.style.background = getTrackColor( track.name );
						keyframe.style.borderRadius = '1px';
						keyframe.style.transform = 'rotate(45deg)';
						keyframe.title = times[ i ].toFixed( 3 ) + 's';
						trackTimeline.appendChild( keyframe );

					}
					trackRow.appendChild( trackTimeline );

					// Hover on position tracks to show path helper
					if ( track.name.endsWith( '.position' ) && track.getValueSize() === 3 ) {

						const uuid = track.name.replace( '.position', '' );
						const object = root.getObjectByProperty( 'uuid', uuid );

						if ( object ) {

							trackRow.addEventListener( 'mouseenter', function () {

								showPath( clip, object );

							} );

							trackRow.addEventListener( 'mouseleave', function () {

								hidePath();

							} );

						}

					}

					trackListContainer.appendChild( trackRow );

				}

			}

		}

	}

	function selectClip( clip, root ) {

		// Stop current action
		if ( currentAction ) {

			currentAction.stop();

		}

		// Select clip without playing
		currentClip = clip;
		currentRoot = root;
		currentAction = editor.mixer.clipAction( clip, root );

		// Update duration display
		durationText.setValue( clip.duration.toFixed( 2 ) );

	}

	function showPath( clip, object ) {

		hidePath();

		hoverHelper = new AnimationPathHelper( currentRoot, clip, object );
		editor.sceneHelpers.add( hoverHelper );
		signals.sceneGraphChanged.dispatch();

	}

	function hidePath() {

		if ( hoverHelper ) {

			editor.sceneHelpers.remove( hoverHelper );
			hoverHelper.dispose();
			hoverHelper = null;
			signals.sceneGraphChanged.dispatch();

		}

	}

	function clear() {

		hidePath();
		trackListContainer.innerHTML = '';
		currentAction = null;
		currentClip = null;
		currentRoot = null;
		timeText.setValue( '0.00' );
		durationText.setValue( '0.00' );

	}

	// Update time display and playhead during playback
	function updateTime() {

		if ( currentAction && currentClip ) {

			const time = currentAction.time % currentClip.duration;
			timeText.setValue( time.toFixed( 2 ) );

			// Update playhead position
			const rect = timelineArea.getBoundingClientRect();
			const timelineWidth = rect.width - labelWidth;
			const playheadX = labelWidth + ( time / currentClip.duration ) * timelineWidth;
			playhead.style.left = playheadX + 'px';

		}

		requestAnimationFrame( updateTime );

	}

	updateTime();

	// Auto-select clip when an object with animations is selected
	signals.objectSelected.add( function ( object ) {

		if ( object !== null && object.animations && object.animations.length > 0 ) {

			selectClip( object.animations[ 0 ], object );
			update();

		}

	} );

	// Update when scene changes
	signals.editorCleared.add( clear );
	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );

	// Show panel on initial load
	container.setDisplay( 'flex' );
	container.dom.style.height = panelHeight + 'px';
	signals.animationPanelChanged.dispatch( panelHeight );

	return container;

}

export { Animation };
