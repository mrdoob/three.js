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

		// convert to Geometry
		
		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			if ( object.parent === undefined ) return; // avoid flattening the camera or scene

			if ( confirm( 'Convert ' + object.name + ' to Geometry?' ) === false ) return;

			var original = object.geometry;
			
			var geometry = new THREE.Geometry();

			geometry.name = original.name;

			geometry.vertices = original.vertices;
			geometry.colors = original.colors;

			geometry.faces =  original.faces;

			geometry.faceVertexUvs =  original.faceVertexUvs;

			geometry.morphTargets =  original.morphTargets;
			geometry.morphColors =  original.morphColors;
			geometry.morphNormals =  original.morphNormals;

			geometry.skinWeights = original.skinWeights;
			geometry.skinIndices = original.skinIndices;

			geometry.lineDistances = original.lineDistances;

			geometry.boundingBox = original.boundingBox;
			geometry.boundingSphere = original.boundingSphere;

			geometry.hasTangents = original.hasTangents;

			geometry.dynamic = original.dynamic;
			
			editor.scene.traverse( function(obj) {
				if ( obj.geometry === original ) {
					obj.geometry = geometry;
					editor.signals.objectChanged.dispatch( obj );
				}
			} );

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

			object.geometry = new THREE.BufferGeometry().fromGeometry( object.geometry );

			editor.signals.objectChanged.dispatch( object );

		}

	} );
	options.add( option );

	// Flatten

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Flatten' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid flattening the camera or scene

		if ( confirm( 'Flatten ' + object.name + '?' ) === false ) return;

		var geometry = object.geometry.clone();
		geometry.applyMatrix( object.matrix );

		object.geometry = geometry;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );
		
		object.geometry.buffersNeedUpdate = true;
		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );

	// Compute face normals

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Compute Face Normals' );
	option.onClick( function () {

		var object = editor.selected;

		if( object && object.geometry ) {
			
			var geometry = object.geometry;
			var faces = geometry.faces;
			
			// remove vertex normals
			
			for ( var i = 0, l = faces.length; i < l; ++i ) {
				faces[i].vertexNormals = [];
			}
			
			geometry.computeFaceNormals();
			geometry.normalsNeedUpdate = true;
			
			editor.signals.objectChanged.dispatch( object );
		}
	} );
	options.add( option );

	// Compute vertex normals

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Compute Vertex Normals' );
	option.onClick( function () {

		var object = editor.selected;

		if( object && object.geometry ) {
			
			var geometry = object.geometry;
			
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			geometry.normalsNeedUpdate = true;
			
			editor.signals.objectChanged.dispatch( object );
		}
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

	// change geometry whenever a picker is changed

	editor.signals.objectChanged.add( function( picker ) {

		if ( !picker.editorData ) return;

		if ( picker.editorData.vertex ) {

			var vertex = picker.editorData.vertex;
			var object = picker.editorData.object;

			var inverse = (new THREE.Matrix4).getInverse( object.matrixWorld );

			vertex.copy( picker.position );
			vertex.applyMatrix4( inverse );

			object.geometry.verticesNeedUpdate = true;
			object.geometry.computeBoundingBox();
			
		}

	} );

	// update pickers whenever the object is changed

	editor.signals.objectChanged.add( function( object ) {
		
		updatePickers( object );
		
	} );

	// remove pickers on remove

	editor.signals.objectRemoved.add( function( object ) {
		
		removePickers( object );
		
	} );

	// scale pickers depending on camera distance
	
	editor.signals.cameraChanged.add( function( camera ) {

		if( !camera ) return;

		editor.sceneHelpers.traverse( function( object ) {

			if ( object.editorData && object.editorData.scales ) {
				
				var factor = 0.01 * object.position.distanceTo( camera.position );
				object.scale.set( factor, factor, factor );
				
			}
		} );
		
	} );
	
	// functions
	
	// toggle vertex edit
	
	function vertexEdit( object ) {
		
		if ( !object ) return;
		
		var editorData = object.editorData = object.editorData || {};
		
		removePickers( object );

		if ( editorData.vertexEdit ) {
			
			editorData.vertexEdit = false;
			
			return;
		}
		
		if ( object.geometry instanceof THREE.Geometry ) {
			
			editorData.pickers = [];
			
			var geometry = object.geometry;
			var vertices = geometry.vertices;
			
			for ( var i = 0, l = vertices.length; i < l; ++i ) {
				
				var vertex = vertices[i];
				
				var picker = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 1), material );
				
				picker.editorData = {
					helper: true,
					selectFirst: true,
					scales: true,
					vertex: vertex,
					object: object
				};
				
				picker.material.depthTest = false;
				picker.material.transparent = true;
				picker.visible = true;
				
				editor.signals.objectAdded.dispatch( picker );
				
				editor.sceneHelpers.add( picker );
				
				editorData.pickers.push( picker );
			}
			
			updatePickers( object );
			
			editorData.vertexEdit = true;
			
			editor.signals.cameraChanged.dispatch( editor.camera );
		}
	}
	
	// update pickers on object
	
	function updatePickers( object ) {
		
		if ( object.editorData && object.editorData.pickers ) {
			
			var pickers = object.editorData.pickers;
			
			for ( var i = 0, l = pickers.length; i < l; ++i ) {
				
				var picker = pickers[i];
				
				if ( picker.editorData.vertex ) {
					
					picker.position.copy( picker.editorData.vertex );
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
			
			object.editorData.pickers = [];
		}
	}
	
	// material
	
	var material = new THREE.MeshBasicMaterial( { color: 0xff9900 } );

	return container;

};