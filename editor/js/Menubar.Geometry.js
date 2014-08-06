Menubar.Geometry = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Geometry' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Compute face normals

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Compute Face Normals' );
	option.onClick( function () {

		var object = editor.selected;

		if ( !object ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.Geometry ) {

			var faces = geometry.faces;

			// remove vertex normals

			for ( var i = 0, l = faces.length; i < l; ++i ) {
				faces[i].vertexNormals = [];
			}

			geometry.computeFaceNormals();
			geometry.normalsNeedUpdate = true;

		} else if ( geometry instanceof THREE.BufferGeometry ) {

			// TODO not supported
			geometry.computeVertexNormals();
			geometry.attributes.normal.needsUpdate = true;

		}

		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );

	// Compute vertex normals

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Compute Vertex Normals' );
	option.onClick( function () {

		var object = editor.selected;

		if ( !object ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.Geometry ) {

			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			geometry.normalsNeedUpdate = true;

		} else if ( geometry instanceof THREE.BufferGeometry ) {

			geometry.computeVertexNormals();
			geometry.attributes.normal.needsUpdate = true;

		}

		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// vertex edit

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Toggle Vertex Edit' );
	option.onClick( function () {

		vertexEdit( editor.selected );

	} );
	options.add( option );

	// toggle linking of pickers

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Disable Linking' );

	var linkOption = option;
	var linkPickersEnabled = true;

	option.onClick( function () {

		linkPickersEnabled = !linkPickersEnabled;
		linkOption.setTextContent( linkPickersEnabled ? 'Disable Linking' : 'Enable Linking' );

		if ( linkPickersEnabled ) {

			linkPickers();

		} else {

			unlinkPickers();

		}

	} );
	options.add( option );

	// events

	// update pickers whenever an object is changed

	editor.signals.objectChanged.add( updatePickers );

	// remove pickers on remove

	editor.signals.objectRemoved.add( removePickers );

	// change geometry whenever a picker is changed

	editor.signals.objectChanged.add( applyPicker );

	// scale helpers depending on camera distance

	editor.signals.cameraChanged.add( scaleHelpers );

	// functions

	// toggle vertex edit

	function vertexEdit( object ) {

		if ( !object || !object.geometry ) return;

		// ask to convert to buffer geometry first

		if ( !(object.geometry instanceof THREE.BufferGeometry) ) {

			if ( confirm( 'Convert ' + object.name + ' to BufferGeometry?' ) === false ) return;

			object.geometry = new THREE.BufferGeometry().fromGeometry( object.geometry );

			editor.signals.objectChanged.dispatch( object );

		}

		object.editorData = object.editorData || {};

		removePickers( object );

		if ( object.editorData.vertexEdit ) {

			object.editorData.vertexEdit = false;
			return;

		}

		var pickers = [];

		var geometry = object.geometry;
		var positionBuffer = geometry.getAttribute( 'position' );

		if ( !positionBuffer ) return;

		var positionArray = positionBuffer.array;

		for ( var i = 0, l = positionArray.length / 3; i < l; ++i ) {

			var picker = addPicker( { index: i, object: object } );
			pickers.push( picker );

		}

		object.editorData.pickers = pickers;
		object.editorData.geometry = geometry;
		object.editorData.vertexEdit = true;

		updatePickers( object );

		editor.signals.cameraChanged.dispatch( editor.camera );

		if ( linkPickersEnabled ) {

			linkPickers();

		}

	}

	// apply picker to its geometry

	function applyPicker( picker, linkedPosition ) {

		if ( !picker.editorData || !picker.editorData.vertexPicker ) return;

		if ( linkedPosition ) picker.position.copy( linkedPosition );

		var object = picker.editorData.object;
		var geometry = object.geometry;

		var inverse = (new THREE.Matrix4).getInverse( object.matrixWorld );
		var vertex = picker.position.clone().applyMatrix4( inverse );

		var positionBuffer = object.geometry.getAttribute( 'position' );

		if ( !positionBuffer ) return;

		var positionArray = positionBuffer.array;

		var index = picker.editorData.index;

		positionArray[ 3 * index ] = vertex.x;
		positionArray[ 3 * index + 1 ] = vertex.y;
		positionArray[ 3 * index + 2 ] = vertex.z;

		positionBuffer.needsUpdate = true;

		object.geometry.computeBoundingBox();

		if ( linkPickersEnabled && !linkedPosition ) {

			for ( var i = 0; i < picker.editorData.linked.length; ++i ) {

				applyPicker( picker.editorData.linked[i], picker.position );

			}

		}

	}

	// update pickers on object

	function updatePickers( object ) {

		if ( !object.editorData || !object.editorData.pickers ) return;

		var pickers = object.editorData.pickers;

		if( object.editorData.geometry !== object.geometry ) {

			// object geometry has changed in the mean time, stop vertex editing
			removePickers( object );
			object.editorData.vertexEdit = false;

			return;

		}

		var positionBuffer = object.geometry.getAttribute( 'position' );

		if ( !positionBuffer ) return;

		var positionArray = positionBuffer.array;

		for ( var i = 0, l = pickers.length; i < l; ++i ) {

			var picker = pickers[i];
			var index = picker.editorData.index;

			var x = positionArray[ 3 * index ];
			var y = positionArray[ 3 * index + 1 ];
			var z = positionArray[ 3 * index + 2 ];

			picker.position.set( x, y, z );
			picker.position.applyMatrix4( picker.editorData.object.matrixWorld );

		}

	}

	// remove pickers from object

	function removePickers( object ) {

		if ( object.editorData && object.editorData.pickers ) {

			var pickers = object.editorData.pickers;

			for ( var i = 0, l = pickers.length; i < l; ++i ) {

				editor.sceneHelpers.remove( pickers[i] );
				editor.signals.objectRemoved.dispatch( pickers[i] );

			}

			object.editorData.pickers = null;
		}
	}

	// add a picker to scene helpers

	var addPicker = (function() {

		var cube = new THREE.BoxGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial( { color: 0xff9900 } );
		material.depthTest = false;
		material.transparent = true;

		return function( editorData ) {

			var picker = new THREE.Mesh( cube, material );

			editorData.helper = true,
			editorData.selectFirst = true,
			editorData.scales = true;
			editorData.vertexPicker = true;

			picker.editorData = editorData;

			editor.sceneHelpers.add( picker );
			editor.signals.objectAdded.dispatch( picker );

			return picker;

		}

	})();

	// link pickers

	function linkPickers() {

		editor.sceneHelpers.traverse( function ( object ) {

			if ( !object.editorData || !object.editorData.vertexPicker ) return;

			object.editorData.linked = [];

			editor.sceneHelpers.traverse( function ( other ) {

				if ( other === object || !other.editorData || !other.editorData.vertexPicker ) return;

				if ( object.position.distanceTo( other.position ) < 0.0001 ) {

					object.editorData.linked.push( other );

				}

			} );

		} );

	}

	// unlink pickers

	function unlinkPickers() {

		editor.sceneHelpers.traverse( function ( object ) {

			if ( !object.editorData || !object.editorData.vertexPicker ) return;

			object.editorData.linked = [];

		} );

	}

	// scale helpers

	function scaleHelpers( camera ) {

		if ( !camera ) return;

		editor.sceneHelpers.traverse( function( object ) {

			if ( object.editorData && object.editorData.scales ) {

				var factor = 0.009 * object.position.distanceTo( camera.position );
				object.scale.set( factor, factor, factor );

			}

		} );

	}

	return container;

};
