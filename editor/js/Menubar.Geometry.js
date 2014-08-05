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

	// Convert to Geometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Convert to Geometry' );
	option.onClick( function () {



		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			// convert BoxGeometry and similar to basic Geometry

			if ( confirm( 'Convert ' + object.name + ' to Geometry?' ) === false ) return;

			var original = object.geometry;

			var geometry = new THREE.Geometry();

			geometry.name = original.name;

			geometry.vertices = original.vertices;
			geometry.colors = original.colors;

			geometry.faces = original.faces;

			geometry.faceVertexUvs = original.faceVertexUvs;

			geometry.morphTargets = original.morphTargets;
			geometry.morphColors = original.morphColors;
			geometry.morphNormals = original.morphNormals;

			geometry.skinWeights = original.skinWeights;
			geometry.skinIndices = original.skinIndices;

			geometry.lineDistances = original.lineDistances;

			geometry.boundingBox = original.boundingBox;
			geometry.boundingSphere = original.boundingSphere;

			geometry.hasTangents = original.hasTangents;

			geometry.dynamic = original.dynamic;

			// replace in scene
			editor.scene.traverse( function(obj) {

				if ( obj.geometry === original ) {

					obj.geometry = geometry;
					editor.signals.objectChanged.dispatch( obj );

				}

			} );

		} else if ( object.geometry instanceof THREE.BufferGeometry ) {

			// TODO convert BufferGeometry to Geometry

		}

	} );
	options.add( option );

	// Convert to BufferGeometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Convert to BufferGeometry' );
	option.onClick( function () {

		// convert to BufferGeometry

		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			if ( object.parent === undefined ) return; // avoid flattening the camera or scene

			if ( confirm( 'Convert ' + object.name + ' to BufferGeometry?' ) === false ) return;

			var original = object.geometry;

			var geometry = new THREE.BufferGeometry().fromGeometry( original );

			// replace in scene
			editor.scene.traverse( function(obj) {

				if ( obj.geometry === original ) {

					obj.geometry = geometry;
					editor.signals.objectChanged.dispatch( obj );

				}

			} );

		}

	} );
	options.add( option );

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
			geometry.getAttribute( 'normal' ).needsUpdate = true;

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

		object.editorData = object.editorData || {};

		removePickers( object );

		if ( object.editorData.vertexEdit ) {

			object.editorData.vertexEdit = false;
			return;

		}

		if ( object.geometry instanceof THREE.Geometry ) {

			vertexEditGeometry( object );

		} else if ( object.geometry instanceof THREE.BufferGeometry ) {

			vertexEditBufferGeometry( object );

		}

	}

	function vertexEditGeometry( object ) {

		var pickers = [];
		var pickerMap = {};

		var geometry = object.geometry;
		var vertices = geometry.vertices;

		for ( var i = 0, l = vertices.length; i < l; ++i ) {

			var vertex = vertices[i];

			var x = vertex.x;
			var y = vertex.y;
			var z = vertex.z;

			var key = x + ',' + y + ',' + z;

			if ( pickerMap[key] ) {

				pickerMap[key].editorData.vertices.push( vertex );
				continue;

			}

			var picker = addPicker( { vertices: [vertex], object: object } );

			pickers.push( picker );
			pickerMap[key] = picker;

		}

		object.editorData.pickers = pickers;
		object.editorData.geometry = geometry;
		object.editorData.vertexEdit = true;

		updatePickers( object );

		editor.signals.cameraChanged.dispatch( editor.camera );

	}

	function vertexEditBufferGeometry( object ) {

		var pickerMap = {};
		var pickers = [];

		var geometry = object.geometry;
		var positionBuffer = geometry.getAttribute( 'position' );

		if ( !positionBuffer ) return;

		var positionArray = positionBuffer.array;

		for ( var i = 0, l = positionArray.length / 3; i < l; ++i ) {

			var x = positionArray[ 3 * i ];
			var y = positionArray[ 3 * i + 1 ];
			var z = positionArray[ 3 * i + 2 ];

			var key = x + ',' + y + ',' + z;

			if ( pickerMap[key] ) {

				pickerMap[key].editorData.indices.push( i );
				continue;

			}

			var picker = addPicker( { indices: [i], object: object } );

			pickers.push( picker );
			pickerMap[key] = picker;

		}

		object.editorData.pickers = pickers;
		object.editorData.geometry = geometry;
		object.editorData.vertexEdit = true;

		updatePickers( object );

		editor.signals.cameraChanged.dispatch( editor.camera );

	}

	// apply picker to its geometry

	function applyPicker( picker ) {

		if ( !picker.editorData || !picker.editorData.vertexPicker ) return;

		var object = picker.editorData.object;
		var geometry = object.geometry;

		var inverse = (new THREE.Matrix4).getInverse( object.matrixWorld );
		var vertex = picker.position.clone().applyMatrix4( inverse );

		if ( geometry instanceof THREE.Geometry ) {

			var vertices = picker.editorData.vertices;

			for ( var i = 0, l = vertices.length; i < l; ++i ) {

				vertices[i].copy( vertex );

			}

			geometry.verticesNeedUpdate = true;

		} else if ( geometry instanceof THREE.BufferGeometry ) {

			var positionBuffer = object.geometry.getAttribute( 'position' );

			if ( !positionBuffer ) return;

			var positionArray = positionBuffer.array;

			var indices = picker.editorData.indices;

			for ( var i = 0, l = indices.length; i < l; ++i ) {

				positionArray[ 3 * indices[i] ] = vertex.x;
				positionArray[ 3 * indices[i] + 1 ] = vertex.y;
				positionArray[ 3 * indices[i] + 2 ] = vertex.z;

			}

			positionBuffer.needsUpdate = true;

		}

		object.geometry.computeBoundingBox();

	}

	// update pickers on object

	function updatePickers( object ) {

		if ( object.editorData && object.editorData.pickers ) {

			var pickers = object.editorData.pickers;

			if( object.editorData.geometry !== object.geometry ) {

				// object geometry has changed in the mean time, stop vertex editing
				removePickers( object );
				object.editorData.vertexEdit = false;

				return;

			}

			if ( object.geometry instanceof THREE.Geometry ) {

				for ( var i = 0, l = pickers.length; i < l; ++i ) {

					var picker = pickers[i];

					picker.position.copy( picker.editorData.vertices[0] );
					picker.position.applyMatrix4( picker.editorData.object.matrixWorld );

				}

			} else if ( object.geometry instanceof THREE.BufferGeometry ) {

				var positionBuffer = object.geometry.getAttribute( 'position' );

				if ( !positionBuffer ) return;

				var positionArray = positionBuffer.array;

				for ( var i = 0, l = pickers.length; i < l; ++i ) {

					var picker = pickers[i];
					var index = picker.editorData.indices[0];

					var x = positionArray[ 3 * index ];
					var y = positionArray[ 3 * index + 1 ];
					var z = positionArray[ 3 * index + 2 ];

					picker.position.set( x, y, z );
					picker.position.applyMatrix4( picker.editorData.object.matrixWorld );

				}

			}

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

			return picker

		}

	})();

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
