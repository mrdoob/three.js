(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	QUnit.module( "Editor", () => {

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param editorRef pointer to main editor object used to initialize
	 *        each command object with a reference to the editor
	 * @constructor
	 */

	var Command$1 = function ( editorRef ) {

		this.id = - 1;
		this.inMemory = false;
		this.updatable = false;
		this.type = '';
		this.name = '';

		if ( editorRef !== undefined ) {

			Command$1.editor = editorRef;

		}
		this.editor = Command$1.editor;


	};

	Command$1.prototype.toJSON = function () {

		var output = {};
		output.type = this.type;
		output.id = this.id;
		output.name = this.name;
		return output;

	};

	Command$1.prototype.fromJSON = function ( json ) {

		this.inMemory = true;
		this.type = json.type;
		this.id = json.id;
		this.name = json.name;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Command', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Config', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	var Editor = function () {

		this.DEFAULT_CAMERA = new THREE.PerspectiveCamera( 50, 1, 0.1, 10000 );
		this.DEFAULT_CAMERA.name = 'Camera';
		this.DEFAULT_CAMERA.position.set( 20, 10, 20 );
		this.DEFAULT_CAMERA.lookAt( new THREE.Vector3() );

		var Signal = signals.Signal;

		this.signals = {

			// script

			editScript: new Signal(),

			// player

			startPlayer: new Signal(),
			stopPlayer: new Signal(),

			// actions

			showModal: new Signal(),

			// notifications

			editorCleared: new Signal(),

			savingStarted: new Signal(),
			savingFinished: new Signal(),

			themeChanged: new Signal(),

			transformModeChanged: new Signal(),
			snapChanged: new Signal(),
			spaceChanged: new Signal(),
			rendererChanged: new Signal(),

			sceneBackgroundChanged: new Signal(),
			sceneFogChanged: new Signal(),
			sceneGraphChanged: new Signal(),

			cameraChanged: new Signal(),

			geometryChanged: new Signal(),

			objectSelected: new Signal(),
			objectFocused: new Signal(),

			objectAdded: new Signal(),
			objectChanged: new Signal(),
			objectRemoved: new Signal(),

			helperAdded: new Signal(),
			helperRemoved: new Signal(),

			materialChanged: new Signal(),

			scriptAdded: new Signal(),
			scriptChanged: new Signal(),
			scriptRemoved: new Signal(),

			windowResize: new Signal(),

			showGridChanged: new Signal(),
			refreshSidebarObject3D: new Signal(),
			historyChanged: new Signal()

		};

		this.config = new Config( 'threejs-editor' );
		this.history = new History( this );
		this.storage = new Storage();
		this.loader = new Loader( this );

		this.camera = this.DEFAULT_CAMERA.clone();

		this.scene = new THREE.Scene();
		this.scene.name = 'Scene';
		this.scene.background = new THREE.Color( 0xaaaaaa );

		this.sceneHelpers = new THREE.Scene();

		this.object = {};
		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.selected = null;
		this.helpers = {};

	};

	Editor.prototype = {

		setTheme: function ( value ) {

			document.getElementById( 'theme' ).href = value;

			this.signals.themeChanged.dispatch( value );

		},

		//

		setScene: function ( scene ) {

			this.scene.uuid = scene.uuid;
			this.scene.name = scene.name;

			if ( scene.background !== null ) this.scene.background = scene.background.clone();
			if ( scene.fog !== null ) this.scene.fog = scene.fog.clone();

			this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

			// avoid render per object

			this.signals.sceneGraphChanged.active = false;

			while ( scene.children.length > 0 ) {

				this.addObject( scene.children[ 0 ] );

			}

			this.signals.sceneGraphChanged.active = true;
			this.signals.sceneGraphChanged.dispatch();

		},

		//

		addObject: function ( object ) {

			var scope = this;

			object.traverse( function ( child ) {

				if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
				if ( child.material !== undefined ) scope.addMaterial( child.material );

				scope.addHelper( child );

			} );

			this.scene.add( object );

			this.signals.objectAdded.dispatch( object );
			this.signals.sceneGraphChanged.dispatch();

		},

		moveObject: function ( object, parent, before ) {

			if ( parent === undefined ) {

				parent = this.scene;

			}

			parent.add( object );

			// sort children array

			if ( before !== undefined ) {

				var index = parent.children.indexOf( before );
				parent.children.splice( index, 0, object );
				parent.children.pop();

			}

			this.signals.sceneGraphChanged.dispatch();

		},

		nameObject: function ( object, name ) {

			object.name = name;
			this.signals.sceneGraphChanged.dispatch();

		},

		removeObject: function ( object ) {

			if ( object.parent === null ) return; // avoid deleting the camera or scene

			var scope = this;

			object.traverse( function ( child ) {

				scope.removeHelper( child );

			} );

			object.parent.remove( object );

			this.signals.objectRemoved.dispatch( object );
			this.signals.sceneGraphChanged.dispatch();

		},

		addGeometry: function ( geometry ) {

			this.geometries[ geometry.uuid ] = geometry;

		},

		setGeometryName: function ( geometry, name ) {

			geometry.name = name;
			this.signals.sceneGraphChanged.dispatch();

		},

		addMaterial: function ( material ) {

			this.materials[ material.uuid ] = material;

		},

		setMaterialName: function ( material, name ) {

			material.name = name;
			this.signals.sceneGraphChanged.dispatch();

		},

		addTexture: function ( texture ) {

			this.textures[ texture.uuid ] = texture;

		},

		//

		addHelper: function () {

			var geometry = new THREE.SphereBufferGeometry( 2, 4, 2 );
			var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

			return function ( object ) {

				var helper;

				if ( object instanceof THREE.Camera ) {

					helper = new THREE.CameraHelper( object, 1 );

				} else if ( object instanceof THREE.PointLight ) {

					helper = new THREE.PointLightHelper( object, 1 );

				} else if ( object instanceof THREE.DirectionalLight ) {

					helper = new THREE.DirectionalLightHelper( object, 1 );

				} else if ( object instanceof THREE.SpotLight ) {

					helper = new THREE.SpotLightHelper( object, 1 );

				} else if ( object instanceof THREE.HemisphereLight ) {

					helper = new THREE.HemisphereLightHelper( object, 1 );

				} else if ( object instanceof THREE.SkinnedMesh ) {

					helper = new THREE.SkeletonHelper( object );

				} else {

					// no helper for this object type
					return;

				}

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				helper.add( picker );

				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			};

		}(),

		removeHelper: function ( object ) {

			if ( this.helpers[ object.id ] !== undefined ) {

				var helper = this.helpers[ object.id ];
				helper.parent.remove( helper );

				delete this.helpers[ object.id ];

				this.signals.helperRemoved.dispatch( helper );

			}

		},

		//

		addScript: function ( object, script ) {

			if ( this.scripts[ object.uuid ] === undefined ) {

				this.scripts[ object.uuid ] = [];

			}

			this.scripts[ object.uuid ].push( script );

			this.signals.scriptAdded.dispatch( script );

		},

		removeScript: function ( object, script ) {

			if ( this.scripts[ object.uuid ] === undefined ) return;

			var index = this.scripts[ object.uuid ].indexOf( script );

			if ( index !== - 1 ) {

				this.scripts[ object.uuid ].splice( index, 1 );

			}

			this.signals.scriptRemoved.dispatch( script );

		},

		getObjectMaterial: function ( object, slot ) {

			var material = object.material;

			if ( Array.isArray( material ) ) {

				material = material[ slot ];

			}

			return material;

		},

		setObjectMaterial: function ( object, slot, newMaterial ) {

			if ( Array.isArray( object.material ) ) {

				object.material[ slot ] = newMaterial;

			} else {

				object.material = newMaterial;

			}

		},

		//

		select: function ( object ) {

			if ( this.selected === object ) return;

			var uuid = null;

			if ( object !== null ) {

				uuid = object.uuid;

			}

			this.selected = object;

			this.config.setKey( 'selected', uuid );
			this.signals.objectSelected.dispatch( object );

		},

		selectById: function ( id ) {

			if ( id === this.camera.id ) {

				this.select( this.camera );
				return;

			}

			this.select( this.scene.getObjectById( id, true ) );

		},

		selectByUuid: function ( uuid ) {

			var scope = this;

			this.scene.traverse( function ( child ) {

				if ( child.uuid === uuid ) {

					scope.select( child );

				}

			} );

		},

		deselect: function () {

			this.select( null );

		},

		focus: function ( object ) {

			this.signals.objectFocused.dispatch( object );

		},

		focusById: function ( id ) {

			this.focus( this.scene.getObjectById( id, true ) );

		},

		clear: function () {

			this.history.clear();
			this.storage.clear();

			this.camera.copy( this.DEFAULT_CAMERA );
			this.scene.background.setHex( 0xaaaaaa );
			this.scene.fog = null;

			var objects = this.scene.children;

			while ( objects.length > 0 ) {

				this.removeObject( objects[ 0 ] );

			}

			this.geometries = {};
			this.materials = {};
			this.textures = {};
			this.scripts = {};

			this.deselect();

			this.signals.editorCleared.dispatch();

		},

		//

		fromJSON: function ( json ) {

			var loader = new THREE.ObjectLoader();

			// backwards

			if ( json.scene === undefined ) {

				this.setScene( loader.parse( json ) );
				return;

			}

			var camera = loader.parse( json.camera );

			this.camera.copy( camera );
			this.camera.aspect = this.DEFAULT_CAMERA.aspect;
			this.camera.updateProjectionMatrix();

			this.history.fromJSON( json.history );
			this.scripts = json.scripts;

			this.setScene( loader.parse( json.scene ) );

		},

		toJSON: function () {

			// scripts clean up

			var scene = this.scene;
			var scripts = this.scripts;

			for ( var key in scripts ) {

				var script = scripts[ key ];

				if ( script.length === 0 || scene.getObjectByProperty( 'uuid', key ) === undefined ) {

					delete scripts[ key ];

				}

			}

			//

			return {

				metadata: {},
				project: {
					gammaInput: this.config.getKey( 'project/renderer/gammaInput' ),
					gammaOutput: this.config.getKey( 'project/renderer/gammaOutput' ),
					shadows: this.config.getKey( 'project/renderer/shadows' ),
					vr: this.config.getKey( 'project/vr' )
				},
				camera: this.camera.toJSON(),
				scene: this.scene.toJSON(),
				scripts: this.scripts,
				history: this.history.toJSON()

			};

		},

		objectByUuid: function ( uuid ) {

			return this.scene.getObjectByProperty( 'uuid', uuid, true );

		},

		execute: function ( cmd, optionalName ) {

			this.history.execute( cmd, optionalName );

		},

		undo: function () {

			this.history.undo();

		},

		redo: function () {

			this.history.redo();

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Editor', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	History = function ( editor ) {

		this.editor = editor;
		this.undos = [];
		this.redos = [];
		this.lastCmdTime = new Date();
		this.idCounter = 0;

		this.historyDisabled = false;
		this.config = editor.config;

		//Set editor-reference in Command

		Command( editor );

		// signals

		var scope = this;

		this.editor.signals.startPlayer.add( function () {

			scope.historyDisabled = true;

		} );

		this.editor.signals.stopPlayer.add( function () {

			scope.historyDisabled = false;

		} );

	};

	History.prototype = {

		execute: function ( cmd, optionalName ) {

			var lastCmd = this.undos[ this.undos.length - 1 ];
			var timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

			var isUpdatableCmd = lastCmd &&
				lastCmd.updatable &&
				cmd.updatable &&
				lastCmd.object === cmd.object &&
				lastCmd.type === cmd.type &&
				lastCmd.script === cmd.script &&
				lastCmd.attributeName === cmd.attributeName;

			if ( isUpdatableCmd && cmd.type === "SetScriptValueCommand" ) {

				// When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

				lastCmd.update( cmd );
				cmd = lastCmd;

			} else if ( isUpdatableCmd && timeDifference < 500 ) {

				lastCmd.update( cmd );
				cmd = lastCmd;

			} else {

				// the command is not updatable and is added as a new part of the history

				this.undos.push( cmd );
				cmd.id = ++ this.idCounter;

			}
			cmd.name = ( optionalName !== undefined ) ? optionalName : cmd.name;
			cmd.execute();
			cmd.inMemory = true;

			if ( this.config.getKey( 'settings/history' ) ) {

				cmd.json = cmd.toJSON();	// serialize the cmd immediately after execution and append the json to the cmd

			}
			this.lastCmdTime = new Date();

			// clearing all the redo-commands

			this.redos = [];
			this.editor.signals.historyChanged.dispatch( cmd );

		},

		undo: function () {

			if ( this.historyDisabled ) {

				alert( "Undo/Redo disabled while scene is playing." );
				return;

			}

			var cmd = undefined;

			if ( this.undos.length > 0 ) {

				cmd = this.undos.pop();

				if ( cmd.inMemory === false ) {

					cmd.fromJSON( cmd.json );

				}

			}

			if ( cmd !== undefined ) {

				cmd.undo();
				this.redos.push( cmd );
				this.editor.signals.historyChanged.dispatch( cmd );

			}

			return cmd;

		},

		redo: function () {

			if ( this.historyDisabled ) {

				alert( "Undo/Redo disabled while scene is playing." );
				return;

			}

			var cmd = undefined;

			if ( this.redos.length > 0 ) {

				cmd = this.redos.pop();

				if ( cmd.inMemory === false ) {

					cmd.fromJSON( cmd.json );

				}

			}

			if ( cmd !== undefined ) {

				cmd.execute();
				this.undos.push( cmd );
				this.editor.signals.historyChanged.dispatch( cmd );

			}

			return cmd;

		},

		toJSON: function () {

			var history = {};
			history.undos = [];
			history.redos = [];

			if ( ! this.config.getKey( 'settings/history' ) ) {

				return history;

			}

			// Append Undos to History

			for ( var i = 0 ; i < this.undos.length; i ++ ) {

				if ( this.undos[ i ].hasOwnProperty( "json" ) ) {

					history.undos.push( this.undos[ i ].json );

				}

			}

			// Append Redos to History

			for ( var i = 0 ; i < this.redos.length; i ++ ) {

				if ( this.redos[ i ].hasOwnProperty( "json" ) ) {

					history.redos.push( this.redos[ i ].json );

				}

			}

			return history;

		},

		fromJSON: function ( json ) {

			if ( json === undefined ) return;

			for ( var i = 0; i < json.undos.length; i ++ ) {

				var cmdJSON = json.undos[ i ];
				var cmd = new window[ cmdJSON.type ]();	// creates a new object of type "json.type"
				cmd.json = cmdJSON;
				cmd.id = cmdJSON.id;
				cmd.name = cmdJSON.name;
				this.undos.push( cmd );
				this.idCounter = ( cmdJSON.id > this.idCounter ) ? cmdJSON.id : this.idCounter; // set last used idCounter

			}

			for ( var i = 0; i < json.redos.length; i ++ ) {

				var cmdJSON = json.redos[ i ];
				var cmd = new window[ cmdJSON.type ]();	// creates a new object of type "json.type"
				cmd.json = cmdJSON;
				cmd.id = cmdJSON.id;
				cmd.name = cmdJSON.name;
				this.redos.push( cmd );
				this.idCounter = ( cmdJSON.id > this.idCounter ) ? cmdJSON.id : this.idCounter; // set last used idCounter

			}

			// Select the last executed undo-command
			this.editor.signals.historyChanged.dispatch( this.undos[ this.undos.length - 1 ] );

		},

		clear: function () {

			this.undos = [];
			this.redos = [];
			this.idCounter = 0;

			this.editor.signals.historyChanged.dispatch();

		},

		goToState: function ( id ) {

			if ( this.historyDisabled ) {

				alert( "Undo/Redo disabled while scene is playing." );
				return;

			}

			this.editor.signals.sceneGraphChanged.active = false;
			this.editor.signals.historyChanged.active = false;

			var cmd = this.undos.length > 0 ? this.undos[ this.undos.length - 1 ] : undefined;	// next cmd to pop

			if ( cmd === undefined || id > cmd.id ) {

				cmd = this.redo();
				while ( cmd !== undefined && id > cmd.id ) {

					cmd = this.redo();

				}

			} else {

				while ( true ) {

					cmd = this.undos[ this.undos.length - 1 ];	// next cmd to pop

					if ( cmd === undefined || id === cmd.id ) break;

					this.undo();

				}

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.historyChanged.active = true;

			this.editor.signals.sceneGraphChanged.dispatch();
			this.editor.signals.historyChanged.dispatch( cmd );

		},

		enableSerialization: function ( id ) {

			/**
			 * because there might be commands in this.undos and this.redos
			 * which have not been serialized with .toJSON() we go back
			 * to the oldest command and redo one command after the other
			 * while also calling .toJSON() on them.
			 */

			this.goToState( - 1 );

			this.editor.signals.sceneGraphChanged.active = false;
			this.editor.signals.historyChanged.active = false;

			var cmd = this.redo();
			while ( cmd !== undefined ) {

				if ( ! cmd.hasOwnProperty( "json" ) ) {

					cmd.json = cmd.toJSON();

				}
				cmd = this.redo();

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.historyChanged.active = true;

			this.goToState( id );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'History', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Loader', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Player', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Script', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Add = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'Add' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		//

		var meshCount = 0;
		var lightCount = 0;
		var cameraCount = 0;

		editor.signals.editorCleared.add( function () {

			meshCount = 0;
			lightCount = 0;
			cameraCount = 0;

		} );

		// Group

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Group' );
		option.onClick( function () {

			var mesh = new THREE.Group();
			mesh.name = 'Group ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// Plane

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Plane' );
		option.onClick( function () {

			var geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );
			var material = new THREE.MeshStandardMaterial();
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'Plane ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Box

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Box' );
		option.onClick( function () {

			var geometry = new THREE.BoxBufferGeometry( 1, 1, 1, 1, 1, 1 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Box ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Circle

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Circle' );
		option.onClick( function () {

			var geometry = new THREE.CircleBufferGeometry( 1, 8, 0, Math.PI * 2 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Circle ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Cylinder

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Cylinder' );
		option.onClick( function () {

			var geometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 8, 1, false, 0, Math.PI * 2 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Cylinder ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Sphere

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Sphere' );
		option.onClick( function () {

			var geometry = new THREE.SphereBufferGeometry( 1, 8, 6, 0, Math.PI * 2, 0, Math.PI );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Sphere ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Icosahedron

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Icosahedron' );
		option.onClick( function () {

			var geometry = new THREE.IcosahedronGeometry( 1, 0 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Icosahedron ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Torus

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Torus' );
		option.onClick( function () {

			var geometry = new THREE.TorusBufferGeometry( 1, 0.4, 8, 6, Math.PI * 2 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'Torus ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// TorusKnot

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'TorusKnot' );
		option.onClick( function () {

			var geometry = new THREE.TorusKnotBufferGeometry( 1, 0.4, 64, 8, 2, 3 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
			mesh.name = 'TorusKnot ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		/*
		// Teapot

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Teapot' );
		option.onClick( function () {

			var size = 50;
			var segments = 10;
			var bottom = true;
			var lid = true;
			var body = true;
			var fitLid = false;
			var blinnScale = true;

			var material = new THREE.MeshStandardMaterial();

			var geometry = new THREE.TeapotBufferGeometry( size, segments, bottom, lid, body, fitLid, blinnScale );
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'Teapot ' + ( ++ meshCount );

			editor.addObject( mesh );
			editor.select( mesh );

		} );
		options.add( option );
		*/

		// Lathe

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Lathe' );
		option.onClick( function() {

			var points = [
				new THREE.Vector2( 0, 0 ),
				new THREE.Vector2( 0.4, 0 ),
				new THREE.Vector2( 0.35, 0.05 ),
				new THREE.Vector2( 0.1, 0.075 ),
				new THREE.Vector2( 0.08, 0.1 ),
				new THREE.Vector2( 0.08, 0.4 ),
				new THREE.Vector2( 0.1, 0.42 ),
				new THREE.Vector2( 0.14, 0.48 ),
				new THREE.Vector2( 0.2, 0.5 ),
				new THREE.Vector2( 0.25, 0.54 ),
				new THREE.Vector2( 0.3, 1.2 )
			];

			var geometry = new THREE.LatheBufferGeometry( points, 12, 0, Math.PI * 2 );
			var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
			mesh.name = 'Lathe ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( mesh ) );

		} );
		options.add( option );

		// Sprite

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Sprite' );
		option.onClick( function () {

			var sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
			sprite.name = 'Sprite ' + ( ++ meshCount );

			editor.execute( new AddObjectCommand( sprite ) );

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// PointLight

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'PointLight' );
		option.onClick( function () {

			var color = 0xffffff;
			var intensity = 1;
			var distance = 0;

			var light = new THREE.PointLight( color, intensity, distance );
			light.name = 'PointLight ' + ( ++ lightCount );

			editor.execute( new AddObjectCommand( light ) );

		} );
		options.add( option );

		// SpotLight

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'SpotLight' );
		option.onClick( function () {

			var color = 0xffffff;
			var intensity = 1;
			var distance = 0;
			var angle = Math.PI * 0.1;
			var penumbra = 0;

			var light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
			light.name = 'SpotLight ' + ( ++ lightCount );
			light.target.name = 'SpotLight ' + ( lightCount ) + ' Target';

			light.position.set( 5, 10, 7.5 );

			editor.execute( new AddObjectCommand( light ) );

		} );
		options.add( option );

		// DirectionalLight

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'DirectionalLight' );
		option.onClick( function () {

			var color = 0xffffff;
			var intensity = 1;

			var light = new THREE.DirectionalLight( color, intensity );
			light.name = 'DirectionalLight ' + ( ++ lightCount );
			light.target.name = 'DirectionalLight ' + ( lightCount ) + ' Target';

			light.position.set( 5, 10, 7.5 );

			editor.execute( new AddObjectCommand( light ) );

		} );
		options.add( option );

		// HemisphereLight

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'HemisphereLight' );
		option.onClick( function () {

			var skyColor = 0x00aaff;
			var groundColor = 0xffaa00;
			var intensity = 1;

			var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
			light.name = 'HemisphereLight ' + ( ++ lightCount );

			light.position.set( 0, 10, 0 );

			editor.execute( new AddObjectCommand( light ) );

		} );
		options.add( option );

		// AmbientLight

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'AmbientLight' );
		option.onClick( function() {

			var color = 0x222222;

			var light = new THREE.AmbientLight( color );
			light.name = 'AmbientLight ' + ( ++ lightCount );

			editor.execute( new AddObjectCommand( light ) );

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// PerspectiveCamera

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'PerspectiveCamera' );
		option.onClick( function() {

			var camera = new THREE.PerspectiveCamera( 50, 1, 1, 10000 );
			camera.name = 'PerspectiveCamera ' + ( ++ cameraCount );

			editor.execute( new AddObjectCommand( camera ) );

		} );
		options.add( option );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Add', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Edit = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'Edit' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// Undo

		var undo = new UI.Row();
		undo.setClass( 'option' );
		undo.setTextContent( 'Undo (Ctrl+Z)' );
		undo.onClick( function () {

			editor.undo();

		} );
		options.add( undo );

		// Redo

		var redo = new UI.Row();
		redo.setClass( 'option' );
		redo.setTextContent( 'Redo (Ctrl+Shift+Z)' );
		redo.onClick( function () {

			editor.redo();

		} );
		options.add( redo );

		// Clear History

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Clear History' );
		option.onClick( function () {

			if ( confirm( 'The Undo/Redo History will be cleared. Are you sure?' ) ) {

				editor.history.clear();

			}

		} );
		options.add( option );


		editor.signals.historyChanged.add( function () {

			var history = editor.history;

			undo.setClass( 'option' );
			redo.setClass( 'option' );

			if ( history.undos.length == 0 ) {

				undo.setClass( 'inactive' );

			}

			if ( history.redos.length == 0 ) {

				redo.setClass( 'inactive' );

			}

		} );

		// ---

		options.add( new UI.HorizontalRule() );

		// Clone

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Clone' );
		option.onClick( function () {

			var object = editor.selected;

			if ( object.parent === null ) return; // avoid cloning the camera or scene

			object = object.clone();

			editor.execute( new AddObjectCommand( object ) );

		} );
		options.add( option );

		// Delete

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Delete (Del)' );
		option.onClick( function () {

			var object = editor.selected;

			if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

			var parent = object.parent;
			if ( parent === undefined ) return; // avoid deleting the camera or scene

			editor.execute( new RemoveObjectCommand( object ) );

		} );
		options.add( option );

		// Minify shaders

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Minify Shaders' );
		option.onClick( function() {

			var root = editor.selected || editor.scene;

			var errors = [];
			var nMaterialsChanged = 0;

			var path = [];

			function getPath ( object ) {

				path.length = 0;

				var parent = object.parent;
				if ( parent !== undefined ) getPath( parent );

				path.push( object.name || object.uuid );

				return path;

			}

			var cmds = [];
			root.traverse( function ( object ) {

				var material = object.material;

				if ( material instanceof THREE.ShaderMaterial ) {

					try {

						var shader = glslprep.minifyGlsl( [
								material.vertexShader, material.fragmentShader ] );

						cmds.push( new SetMaterialValueCommand( object, 'vertexShader', shader[ 0 ] ) );
						cmds.push( new SetMaterialValueCommand( object, 'fragmentShader', shader[ 1 ] ) );

						++nMaterialsChanged;

					} catch ( e ) {

						var path = getPath( object ).join( "/" );

						if ( e instanceof glslprep.SyntaxError )

							errors.push( path + ":" +
									e.line + ":" + e.column + ": " + e.message );

						else {

							errors.push( path +
									": Unexpected error (see console for details)." );

							console.error( e.stack || e );

						}

					}

				}

			} );

			if ( nMaterialsChanged > 0 ) {

				editor.execute( new MultiCmdsCommand( cmds ), 'Minify Shaders' );

			}

			window.alert( nMaterialsChanged +
					" material(s) were changed.\n" + errors.join( "\n" ) );

		} );
		options.add( option );


		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Edit', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Examples = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'Examples' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// Examples

		var items = [
			{ title: 'Arkanoid', file: 'arkanoid.app.json' },
			{ title: 'Camera', file: 'camera.app.json' },
			{ title: 'Particles', file: 'particles.app.json' },
			{ title: 'Pong', file: 'pong.app.json' },
			{ title: 'Shaders', file: 'shaders.app.json' }
		];

		var loader = new THREE.FileLoader();

		for ( var i = 0; i < items.length; i ++ ) {

			( function ( i ) {

				var item = items[ i ];

				var option = new UI.Row();
				option.setClass( 'option' );
				option.setTextContent( item.title );
				option.onClick( function () {

					if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

						loader.load( 'examples/' + item.file, function ( text ) {

							editor.clear();
							editor.fromJSON( JSON.parse( text ) );

						} );

					}

				} );
				options.add( option );

			} )( i );

		}

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Examples', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.File = function ( editor ) {

		var NUMBER_PRECISION = 6;

		function parseNumber( key, value ) {

			return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

		}

		//

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'File' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// New

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'New' );
		option.onClick( function () {

			if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

				editor.clear();

			}

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// Import

		var form = document.createElement( 'form' );
		form.style.display = 'none';
		document.body.appendChild( form );

		var fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', function ( event ) {

			editor.loader.loadFile( fileInput.files[ 0 ] );
			form.reset();

		} );
		form.appendChild( fileInput );

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Import' );
		option.onClick( function () {

			fileInput.click();

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// Export Geometry

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export Geometry' );
		option.onClick( function () {

			var object = editor.selected;

			if ( object === null ) {

				alert( 'No object selected.' );
				return;

			}

			var geometry = object.geometry;

			if ( geometry === undefined ) {

				alert( 'The selected object doesn\'t have geometry.' );
				return;

			}

			var output = geometry.toJSON();

			try {

				output = JSON.stringify( output, parseNumber, '\t' );
				output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			} catch ( e ) {

				output = JSON.stringify( output );

			}

			saveString( output, 'geometry.json' );

		} );
		options.add( option );

		// Export Object

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export Object' );
		option.onClick( function () {

			var object = editor.selected;

			if ( object === null ) {

				alert( 'No object selected' );
				return;

			}

			var output = object.toJSON();

			try {

				output = JSON.stringify( output, parseNumber, '\t' );
				output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			} catch ( e ) {

				output = JSON.stringify( output );

			}

			saveString( output, 'model.json' );

		} );
		options.add( option );

		// Export Scene

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export Scene' );
		option.onClick( function () {

			var output = editor.scene.toJSON();

			try {

				output = JSON.stringify( output, parseNumber, '\t' );
				output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			} catch ( e ) {

				output = JSON.stringify( output );

			}

			saveString( output, 'scene.json' );

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// Export GLTF

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export GLTF' );
		option.onClick( function () {

			var exporter = new THREE.GLTFExporter();

			exporter.parse( editor.scene, function ( result ) {

				saveString( JSON.stringify( result, null, 2 ), 'scene.gltf' );

			} );


		} );
		options.add( option );

		// Export OBJ

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export OBJ' );
		option.onClick( function () {

			var object = editor.selected;

			if ( object === null ) {

				alert( 'No object selected.' );
				return;

			}

			var exporter = new THREE.OBJExporter();

			saveString( exporter.parse( object ), 'model.obj' );

		} );
		options.add( option );

		// Export STL

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Export STL' );
		option.onClick( function () {

			var exporter = new THREE.STLExporter();

			saveString( exporter.parse( editor.scene ), 'model.stl' );

		} );
		options.add( option );

		//

		options.add( new UI.HorizontalRule() );

		// Publish

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Publish' );
		option.onClick( function () {

			var zip = new JSZip();

			//

			var output = editor.toJSON();
			output.metadata.type = 'App';
			delete output.history;

			var vr = output.project.vr;

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

			zip.file( 'app.json', output );

			//

			var manager = new THREE.LoadingManager( function () {

				save( zip.generate( { type: 'blob' } ), 'download.zip' );

			} );

			var loader = new THREE.FileLoader( manager );
			loader.load( 'js/libs/app/index.html', function ( content ) {

				var includes = [];

				if ( vr ) {

					includes.push( '<script src="js/WebVR.js"></script>' );

				}

				content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );

				var editButton = '';

				if ( editor.config.getKey( 'project/editable' ) ) {

					editButton = `
			var button = document.createElement( 'a' );
			button.href = 'https://threejs.org/editor/#file=' + location.href.split( '/' ).slice( 0, - 1 ).join( '/' ) + '/app.json';
			button.style.cssText = 'position: absolute; bottom: 20px; right: 20px; padding: 7px 10px 6px 10px; color: #fff; border: 1px solid #fff; text-decoration: none;';
			button.target = '_blank';
			button.textContent = 'EDIT';
			document.body.appendChild( button );
				`;

				}

				content = content.replace( '/* edit button */', editButton );

				zip.file( 'index.html', content );

			} );
			loader.load( 'js/libs/app.js', function ( content ) {

				zip.file( 'js/app.js', content );

			} );
			loader.load( '../build/three.min.js', function ( content ) {

				zip.file( 'js/three.min.js', content );

			} );

			if ( vr ) {

				loader.load( '../examples/js/vr/WebVR.js', function ( content ) {

					zip.file( 'js/WebVR.js', content );

				} );

			}

		} );
		options.add( option );

		/*
		// Publish (Dropbox)

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Publish (Dropbox)' );
		option.onClick( function () {

			var parameters = {
				files: [
					{ 'url': 'data:text/plain;base64,' + window.btoa( "Hello, World" ), 'filename': 'app/test.txt' }
				]
			};

			Dropbox.save( parameters );

		} );
		options.add( option );
		*/


		//

		var link = document.createElement( 'a' );
		link.style.display = 'none';
		document.body.appendChild( link ); // Firefox workaround, see #6594

		function save( blob, filename ) {

			link.href = URL.createObjectURL( blob );
			link.download = filename || 'data.json';
			link.click();

			// URL.revokeObjectURL( url ); breaks Firefox...

		}

		function saveString( text, filename ) {

			save( new Blob( [ text ], { type: 'text/plain' } ), filename );

		}

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.File', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Help = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'Help' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// Source code

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Source code' );
		option.onClick( function () {

			window.open( 'https://github.com/mrdoob/three.js/tree/master/editor', '_blank' );

		} );
		options.add( option );

		// About

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'About' );
		option.onClick( function () {

			window.open( 'http://threejs.org', '_blank' );

		} );
		options.add( option );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Help', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Play = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var isPlaying = false;

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'Play' );
		title.onClick( function () {

			if ( isPlaying === false ) {

				isPlaying = true;
				title.setTextContent( 'Stop' );
				signals.startPlayer.dispatch();

			} else {

				isPlaying = false;
				title.setTextContent( 'Play' );
				signals.stopPlayer.dispatch();

			}

		} );
		container.add( title );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Play', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.Status = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu right' );

		var autosave = new UI.THREE.Boolean( editor.config.getKey( 'autosave' ), 'autosave' );
		autosave.text.setColor( '#888' );
		autosave.onChange( function () {

			var value = this.getValue();

			editor.config.setKey( 'autosave', value );

			if ( value === true ) {

				editor.signals.sceneGraphChanged.dispatch();

			}

		} );
		container.add( autosave );

		editor.signals.savingStarted.add( function () {

			autosave.text.setTextDecoration( 'underline' );

		} );

		editor.signals.savingFinished.add( function () {

			autosave.text.setTextDecoration( 'none' );

		} );

		var version = new UI.Text( 'r' + THREE.REVISION );
		version.setClass( 'title' );
		version.setOpacity( 0.5 );
		container.add( version );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.Status', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Menubar.View = function ( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'View' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// VR mode

		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'VR mode' );
		option.onClick( function () {

			if ( WEBVR.isAvailable() === true ) {

				editor.signals.enterVR.dispatch();

			} else {

				alert( 'WebVR not available' );

			}

		} );
		options.add( option );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Menubar.View', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Animation = function ( editor ) {

		var signals = editor.signals;

		var options = {};
		var possibleAnimations = {};

		var container = new UI.Panel();
		container.setDisplay( 'none' );

		container.add( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );
		container.add( new UI.Break() );
		container.add( new UI.Break() );

		var animationsRow = new UI.Row();
		container.add( animationsRow );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Animation', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );

		// Actions

		/*
		var objectActions = new UI.Select().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
		objectActions.setOptions( {

			'Actions': 'Actions',
			'Center': 'Center',
			'Convert': 'Convert',
			'Flatten': 'Flatten'

		} );
		objectActions.onClick( function ( event ) {

			event.stopPropagation(); // Avoid panel collapsing

		} );
		objectActions.onChange( function ( event ) {

			var action = this.getValue();

			var object = editor.selected;
			var geometry = object.geometry;

			if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

			switch ( action ) {

				case 'Center':

					var offset = geometry.center();

					var newPosition = object.position.clone();
					newPosition.sub( offset );
					editor.execute( new SetPositionCommand( object, newPosition ) );

					editor.signals.geometryChanged.dispatch( object );

					break;

				case 'Convert':

					if ( geometry instanceof THREE.Geometry ) {

						editor.execute( new SetGeometryCommand( object, new THREE.BufferGeometry().fromGeometry( geometry ) ) );

					}

					break;

				case 'Flatten':

					var newGeometry = geometry.clone();
					newGeometry.uuid = geometry.uuid;
					newGeometry.applyMatrix( object.matrix );

					var cmds = [ new SetGeometryCommand( object, newGeometry ),
						new SetPositionCommand( object, new THREE.Vector3( 0, 0, 0 ) ),
						new SetRotationCommand( object, new THREE.Euler( 0, 0, 0 ) ),
						new SetScaleCommand( object, new THREE.Vector3( 1, 1, 1 ) ) ];

					editor.execute( new MultiCmdsCommand( cmds ), 'Flatten Geometry' );

					break;

			}

			this.setValue( 'Actions' );

		} );
		container.addStatic( objectActions );
		*/

		// type

		var geometryTypeRow = new UI.Row();
		var geometryType = new UI.Text();

		geometryTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
		geometryTypeRow.add( geometryType );

		container.add( geometryTypeRow );

		// uuid

		var geometryUUIDRow = new UI.Row();
		var geometryUUID = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
		var geometryUUIDRenew = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick( function () {

			geometryUUID.setValue( THREE.Math.generateUUID() );

			editor.execute( new SetGeometryValueCommand( editor.selected, 'uuid', geometryUUID.getValue() ) );

		} );

		geometryUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
		geometryUUIDRow.add( geometryUUID );
		geometryUUIDRow.add( geometryUUIDRenew );

		container.add( geometryUUIDRow );

		// name

		var geometryNameRow = new UI.Row();
		var geometryName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			editor.execute( new SetGeometryValueCommand( editor.selected, 'name', geometryName.getValue() ) );

		} );

		geometryNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		geometryNameRow.add( geometryName );

		container.add( geometryNameRow );

		// geometry

		container.add( new Sidebar.Geometry.Geometry( editor ) );

		// buffergeometry

		container.add( new Sidebar.Geometry.BufferGeometry( editor ) );

		// parameters

		var parameters = new UI.Span();
		container.add( parameters );


		//

		function build() {

			var object = editor.selected;

			if ( object && object.geometry ) {

				var geometry = object.geometry;

				container.setDisplay( 'block' );

				geometryType.setValue( geometry.type );

				geometryUUID.setValue( geometry.uuid );
				geometryName.setValue( geometry.name );

				//

				parameters.clear();

				if ( geometry.type === 'BufferGeometry' || geometry.type === 'Geometry' ) {

					parameters.add( new Sidebar.Geometry.Modifiers( editor, object ) );

				} else if ( Sidebar.Geometry[ geometry.type ] !== undefined ) {

					parameters.add( new Sidebar.Geometry[ geometry.type ]( editor, object ) );

				}

			} else {

				container.setDisplay( 'none' );

			}

		}

		signals.objectSelected.add( build );
		signals.geometryChanged.add( build );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.BoxGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// width

		var widthRow = new UI.Row();
		var width = new UI.Number( parameters.width ).onChange( update );

		widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
		widthRow.add( width );

		container.add( widthRow );

		// height

		var heightRow = new UI.Row();
		var height = new UI.Number( parameters.height ).onChange( update );

		heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
		heightRow.add( height );

		container.add( heightRow );

		// depth

		var depthRow = new UI.Row();
		var depth = new UI.Number( parameters.depth ).onChange( update );

		depthRow.add( new UI.Text( 'Depth' ).setWidth( '90px' ) );
		depthRow.add( depth );

		container.add( depthRow );

		// widthSegments

		var widthSegmentsRow = new UI.Row();
		var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

		widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
		widthSegmentsRow.add( widthSegments );

		container.add( widthSegmentsRow );

		// heightSegments

		var heightSegmentsRow = new UI.Row();
		var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

		heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
		heightSegmentsRow.add( heightSegments );

		container.add( heightSegmentsRow );

		// depthSegments

		var depthSegmentsRow = new UI.Row();
		var depthSegments = new UI.Integer( parameters.depthSegments ).setRange( 1, Infinity ).onChange( update );

		depthSegmentsRow.add( new UI.Text( 'Depth segments' ).setWidth( '90px' ) );
		depthSegmentsRow.add( depthSegments );

		container.add( depthSegmentsRow );

		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				width.getValue(),
				height.getValue(),
				depth.getValue(),
				widthSegments.getValue(),
				heightSegments.getValue(),
				depthSegments.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.BoxBufferGeometry = Sidebar.Geometry.BoxGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.BoxGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.BufferGeometry = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Row();

		function update( object ) {

			if ( object === null ) return; // objectSelected.dispatch( null )
			if ( object === undefined ) return;

			var geometry = object.geometry;

			if ( geometry instanceof THREE.BufferGeometry ) {

				container.clear();
				container.setDisplay( 'block' );

				var index = geometry.index;

				if ( index !== null ) {

					var panel = new UI.Row();
					panel.add( new UI.Text( 'index' ).setWidth( '90px' ) );
					panel.add( new UI.Text( ( index.count ).format() ).setFontSize( '12px' ) );
					container.add( panel );

				}

				var attributes = geometry.attributes;

				for ( var name in attributes ) {

					var attribute = attributes[ name ];

					var panel = new UI.Row();
					panel.add( new UI.Text( name ).setWidth( '90px' ) );
					panel.add( new UI.Text( ( attribute.count ).format() + ' (' + attribute.itemSize + ')' ).setFontSize( '12px' ) );
					container.add( panel );

				}

			} else {

				container.setDisplay( 'none' );

			}

		}

		signals.objectSelected.add( update );
		signals.geometryChanged.add( update );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.BufferGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.CircleGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radius

		var radiusRow = new UI.Row();
		var radius = new UI.Number( parameters.radius ).onChange( update );

		radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
		radiusRow.add( radius );

		container.add( radiusRow );

		// segments

		var segmentsRow = new UI.Row();
		var segments = new UI.Integer( parameters.segments ).setRange( 3, Infinity ).onChange( update );

		segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

		// thetaStart

		var thetaStartRow = new UI.Row();
		var thetaStart = new UI.Number( parameters.thetaStart ).onChange( update );

		thetaStartRow.add( new UI.Text( 'Theta start' ).setWidth( '90px' ) );
		thetaStartRow.add( thetaStart );

		container.add( thetaStartRow );

		// thetaLength

		var thetaLengthRow = new UI.Row();
		var thetaLength = new UI.Number( parameters.thetaLength ).onChange( update );

		thetaLengthRow.add( new UI.Text( 'Theta length' ).setWidth( '90px' ) );
		thetaLengthRow.add( thetaLength );

		container.add( thetaLengthRow );

		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radius.getValue(),
				segments.getValue(),
				thetaStart.getValue(),
				thetaLength.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.CircleBufferGeometry = Sidebar.Geometry.CircleGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.CircleGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.CylinderGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radiusTop

		var radiusTopRow = new UI.Row();
		var radiusTop = new UI.Number( parameters.radiusTop ).onChange( update );

		radiusTopRow.add( new UI.Text( 'Radius top' ).setWidth( '90px' ) );
		radiusTopRow.add( radiusTop );

		container.add( radiusTopRow );

		// radiusBottom

		var radiusBottomRow = new UI.Row();
		var radiusBottom = new UI.Number( parameters.radiusBottom ).onChange( update );

		radiusBottomRow.add( new UI.Text( 'Radius bottom' ).setWidth( '90px' ) );
		radiusBottomRow.add( radiusBottom );

		container.add( radiusBottomRow );

		// height

		var heightRow = new UI.Row();
		var height = new UI.Number( parameters.height ).onChange( update );

		heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
		heightRow.add( height );

		container.add( heightRow );

		// radialSegments

		var radialSegmentsRow = new UI.Row();
		var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

		radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
		radialSegmentsRow.add( radialSegments );

		container.add( radialSegmentsRow );

		// heightSegments

		var heightSegmentsRow = new UI.Row();
		var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

		heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
		heightSegmentsRow.add( heightSegments );

		container.add( heightSegmentsRow );

		// openEnded

		var openEndedRow = new UI.Row();
		var openEnded = new UI.Checkbox( parameters.openEnded ).onChange( update );

		openEndedRow.add( new UI.Text( 'Open ended' ).setWidth( '90px' ) );
		openEndedRow.add( openEnded );

		container.add( openEndedRow );

		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radiusTop.getValue(),
				radiusBottom.getValue(),
				height.getValue(),
				radialSegments.getValue(),
				heightSegments.getValue(),
				openEnded.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.CylinderBufferGeometry = Sidebar.Geometry.CylinderGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.CylinderGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.IcosahedronGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radius

		var radiusRow = new UI.Row();
		var radius = new UI.Number( parameters.radius ).onChange( update );

		radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
		radiusRow.add( radius );

		container.add( radiusRow );

		// detail

		var detailRow = new UI.Row();
		var detail = new UI.Integer( parameters.detail ).setRange( 0, Infinity ).onChange( update );

		detailRow.add( new UI.Text( 'Detail' ).setWidth( '90px' ) );
		detailRow.add( detail );

		container.add( detailRow );


		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radius.getValue(),
				detail.getValue()
			) ) );

			signals.objectChanged.dispatch( object );

		}

		return container;

	};

	Sidebar.Geometry.IcosahedronBufferGeometry = Sidebar.Geometry.IcosahedronGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.IcosahedronGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author rfm1201
	 */

	Sidebar.Geometry.LatheGeometry = function( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// segments

		var segmentsRow = new UI.Row();
		var segments = new UI.Integer( parameters.segments ).onChange( update );

		segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

		// phiStart

		var phiStartRow = new UI.Row();
		var phiStart = new UI.Number( parameters.phiStart * 180 / Math.PI ).onChange( update );

		phiStartRow.add( new UI.Text( 'Phi start (°)' ).setWidth( '90px' ) );
		phiStartRow.add( phiStart );

		container.add( phiStartRow );

		// phiLength

		var phiLengthRow = new UI.Row();
		var phiLength = new UI.Number( parameters.phiLength * 180 / Math.PI ).onChange( update );

		phiLengthRow.add( new UI.Text( 'Phi length (°)' ).setWidth( '90px' ) );
		phiLengthRow.add( phiLength );

		container.add( phiLengthRow );

		// points

		var lastPointIdx = 0;
		var pointsUI = [];

		var pointsRow = new UI.Row();
		pointsRow.add( new UI.Text( 'Points' ).setWidth( '90px' ) );

		var points = new UI.Span().setDisplay( 'inline-block' );
		pointsRow.add( points );

		var pointsList = new UI.Div();
		points.add( pointsList );

		for ( var i = 0; i < parameters.points.length; i ++ ) {

			var point = parameters.points[ i ];
			pointsList.add( createPointRow( point.x, point.y ) );

		}

		var addPointButton = new UI.Button( '+' ).onClick( function() {

			if( pointsUI.length === 0 ){

				pointsList.add( createPointRow( 0, 0 ) );

			} else {

				var point = pointsUI[ pointsUI.length - 1 ];

				pointsList.add( createPointRow( point.x.getValue(), point.y.getValue() ) );

			}

			update();

		} );
		points.add( addPointButton );

		container.add( pointsRow );

		//

		function createPointRow( x, y ) {

			var pointRow = new UI.Div();
			var lbl = new UI.Text( lastPointIdx + 1 ).setWidth( '20px' );
			var txtX = new UI.Number( x ).setRange( 0, Infinity ).setWidth( '40px' ).onChange( update );
			var txtY = new UI.Number( y ).setWidth( '40px' ).onChange( update );
			var idx = lastPointIdx;
			var btn = new UI.Button( '-' ).onClick( function() {

				deletePointRow( idx );

			} );

			pointsUI.push( { row: pointRow, lbl: lbl, x: txtX, y: txtY } );
			lastPointIdx ++;
			pointRow.add( lbl, txtX, txtY, btn );

			return pointRow;

		}

		function deletePointRow( idx ) {

			if ( ! pointsUI[ idx ] ) return;

			pointsList.remove( pointsUI[ idx ].row );
			pointsUI[ idx ] = null;

			update();

		}

		function update() {

			var points = [];
			var count = 0;

			for ( var i = 0; i < pointsUI.length; i ++ ) {

				var pointUI = pointsUI[ i ];

				if ( ! pointUI ) continue;

				points.push( new THREE.Vector2( pointUI.x.getValue(), pointUI.y.getValue() ) );
				count ++;
				pointUI.lbl.setValue( count );

			}

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				points,
				segments.getValue(),
				phiStart.getValue() / 180 * Math.PI,
				phiLength.getValue() / 180 * Math.PI
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.LatheBufferGeometry = Sidebar.Geometry.LatheGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.LatheGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.Modifiers = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row().setPaddingLeft( '90px' );

		var geometry = object.geometry;

		// Compute Vertex Normals

		var button = new UI.Button( 'Compute Vertex Normals' );
		button.onClick( function () {

			geometry.computeVertexNormals();

			if ( geometry instanceof THREE.BufferGeometry ) {

				geometry.attributes.normal.needsUpdate = true;

			} else {

				geometry.normalsNeedUpdate = true;

			}

			signals.geometryChanged.dispatch( object );

		} );

		container.add( button );

		//

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.Modifiers', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.PlaneGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// width

		var widthRow = new UI.Row();
		var width = new UI.Number( parameters.width ).onChange( update );

		widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
		widthRow.add( width );

		container.add( widthRow );

		// height

		var heightRow = new UI.Row();
		var height = new UI.Number( parameters.height ).onChange( update );

		heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
		heightRow.add( height );

		container.add( heightRow );

		// widthSegments

		var widthSegmentsRow = new UI.Row();
		var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

		widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
		widthSegmentsRow.add( widthSegments );

		container.add( widthSegmentsRow );

		// heightSegments

		var heightSegmentsRow = new UI.Row();
		var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

		heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
		heightSegmentsRow.add( heightSegments );

		container.add( heightSegmentsRow );


		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				width.getValue(),
				height.getValue(),
				widthSegments.getValue(),
				heightSegments.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.PlaneBufferGeometry = Sidebar.Geometry.PlaneGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.PlaneGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.SphereGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radius

		var radiusRow = new UI.Row();
		var radius = new UI.Number( parameters.radius ).onChange( update );

		radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
		radiusRow.add( radius );

		container.add( radiusRow );

		// widthSegments

		var widthSegmentsRow = new UI.Row();
		var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

		widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
		widthSegmentsRow.add( widthSegments );

		container.add( widthSegmentsRow );

		// heightSegments

		var heightSegmentsRow = new UI.Row();
		var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

		heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
		heightSegmentsRow.add( heightSegments );

		container.add( heightSegmentsRow );

		// phiStart

		var phiStartRow = new UI.Row();
		var phiStart = new UI.Number( parameters.phiStart ).onChange( update );

		phiStartRow.add( new UI.Text( 'Phi start' ).setWidth( '90px' ) );
		phiStartRow.add( phiStart );

		container.add( phiStartRow );

		// phiLength

		var phiLengthRow = new UI.Row();
		var phiLength = new UI.Number( parameters.phiLength ).onChange( update );

		phiLengthRow.add( new UI.Text( 'Phi length' ).setWidth( '90px' ) );
		phiLengthRow.add( phiLength );

		container.add( phiLengthRow );

		// thetaStart

		var thetaStartRow = new UI.Row();
		var thetaStart = new UI.Number( parameters.thetaStart ).onChange( update );

		thetaStartRow.add( new UI.Text( 'Theta start' ).setWidth( '90px' ) );
		thetaStartRow.add( thetaStart );

		container.add( thetaStartRow );

		// thetaLength

		var thetaLengthRow = new UI.Row();
		var thetaLength = new UI.Number( parameters.thetaLength ).onChange( update );

		thetaLengthRow.add( new UI.Text( 'Theta length' ).setWidth( '90px' ) );
		thetaLengthRow.add( thetaLength );

		container.add( thetaLengthRow );


		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radius.getValue(),
				widthSegments.getValue(),
				heightSegments.getValue(),
				phiStart.getValue(),
				phiLength.getValue(),
				thetaStart.getValue(),
				thetaLength.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.SphereBufferGeometry = Sidebar.Geometry.SphereGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.SphereGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author tschw
	 */

	Sidebar.Geometry.TeapotBufferGeometry = function ( signals, object ) {

		var container = new UI.Row();

		var parameters = object.geometry.parameters;

		// size

		var sizeRow = new UI.Row();
		var size = new UI.Number( parameters.size ).onChange( update );

		sizeRow.add( new UI.Text( 'Size' ).setWidth( '90px' ) );
		sizeRow.add( size );

		container.add( sizeRow );

		// segments

		var segmentsRow = new UI.Row();
		var segments = new UI.Integer( parameters.segments ).setRange( 1, Infinity ).onChange( update );

		segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
		segmentsRow.add( segments );

		container.add( segmentsRow );

		// bottom

		var bottomRow = new UI.Row();
		var bottom = new UI.Checkbox( parameters.bottom ).onChange( update );

		bottomRow.add( new UI.Text( 'Bottom' ).setWidth( '90px' ) );
		bottomRow.add( bottom );

		container.add( bottomRow );

		// lid

		var lidRow = new UI.Row();
		var lid = new UI.Checkbox( parameters.lid ).onChange( update );

		lidRow.add( new UI.Text( 'Lid' ).setWidth( '90px' ) );
		lidRow.add( lid );

		container.add( lidRow );

		// body

		var bodyRow = new UI.Row();
		var body = new UI.Checkbox( parameters.body ).onChange( update );

		bodyRow.add( new UI.Text( 'Body' ).setWidth( '90px' ) );
		bodyRow.add( body );

		container.add( bodyRow );

		// fitted lid

		var fitLidRow = new UI.Row();
		var fitLid = new UI.Checkbox( parameters.fitLid ).onChange( update );

		fitLidRow.add( new UI.Text( 'Fitted Lid' ).setWidth( '90px' ) );
		fitLidRow.add( fitLid );

		container.add( fitLidRow );

		// blinn-sized

		var blinnRow = new UI.Row();
		var blinn = new UI.Checkbox( parameters.blinn ).onChange( update );

		blinnRow.add( new UI.Text( 'Blinn-scaled' ).setWidth( '90px' ) );
		blinnRow.add( blinn );

		container.add( blinnRow );

		function update() {

			object.geometry.dispose();

			object.geometry = new THREE.TeapotBufferGeometry(
				size.getValue(),
				segments.getValue(),
				bottom.getValue(),
				lid.getValue(),
				body.getValue(),
				fitLid.getValue(),
				blinn.getValue()
			);

			object.geometry.computeBoundingSphere();

			signals.geometryChanged.dispatch( object );

		}

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.TeapotBufferGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.TorusGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radius

		var radiusRow = new UI.Row();
		var radius = new UI.Number( parameters.radius ).onChange( update );

		radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
		radiusRow.add( radius );

		container.add( radiusRow );

		// tube

		var tubeRow = new UI.Row();
		var tube = new UI.Number( parameters.tube ).onChange( update );

		tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ) );
		tubeRow.add( tube );

		container.add( tubeRow );

		// radialSegments

		var radialSegmentsRow = new UI.Row();
		var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

		radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
		radialSegmentsRow.add( radialSegments );

		container.add( radialSegmentsRow );

		// tubularSegments

		var tubularSegmentsRow = new UI.Row();
		var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

		tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ) );
		tubularSegmentsRow.add( tubularSegments );

		container.add( tubularSegmentsRow );

		// arc

		var arcRow = new UI.Row();
		var arc = new UI.Number( parameters.arc ).onChange( update );

		arcRow.add( new UI.Text( 'Arc' ).setWidth( '90px' ) );
		arcRow.add( arc );

		container.add( arcRow );


		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radius.getValue(),
				tube.getValue(),
				radialSegments.getValue(),
				tubularSegments.getValue(),
				arc.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.TorusBufferGeometry = Sidebar.Geometry.TorusGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.TorusGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Geometry.TorusKnotGeometry = function ( editor, object ) {

		var signals = editor.signals;

		var container = new UI.Row();

		var geometry = object.geometry;
		var parameters = geometry.parameters;

		// radius

		var radiusRow = new UI.Row();
		var radius = new UI.Number( parameters.radius ).onChange( update );

		radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
		radiusRow.add( radius );

		container.add( radiusRow );

		// tube

		var tubeRow = new UI.Row();
		var tube = new UI.Number( parameters.tube ).onChange( update );

		tubeRow.add( new UI.Text( 'Tube' ).setWidth( '90px' ) );
		tubeRow.add( tube );

		container.add( tubeRow );

		// tubularSegments

		var tubularSegmentsRow = new UI.Row();
		var tubularSegments = new UI.Integer( parameters.tubularSegments ).setRange( 1, Infinity ).onChange( update );

		tubularSegmentsRow.add( new UI.Text( 'Tubular segments' ).setWidth( '90px' ) );
		tubularSegmentsRow.add( tubularSegments );

		container.add( tubularSegmentsRow );

		// radialSegments

		var radialSegmentsRow = new UI.Row();
		var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

		radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
		radialSegmentsRow.add( radialSegments );

		container.add( radialSegmentsRow );

		// p

		var pRow = new UI.Row();
		var p = new UI.Number( parameters.p ).onChange( update );

		pRow.add( new UI.Text( 'P' ).setWidth( '90px' ) );
		pRow.add( p );

		container.add( pRow );

		// q

		var qRow = new UI.Row();
		var q = new UI.Number( parameters.q ).onChange( update );

		pRow.add( new UI.Text( 'Q' ).setWidth( '90px' ) );
		pRow.add( q );

		container.add( qRow );


		//

		function update() {

			editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
				radius.getValue(),
				tube.getValue(),
				tubularSegments.getValue(),
				radialSegments.getValue(),
				p.getValue(),
				q.getValue()
			) ) );

		}

		return container;

	};

	Sidebar.Geometry.TorusKnotBufferGeometry = Sidebar.Geometry.TorusKnotGeometry;

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Geometry.TorusKnotGeometry', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	Sidebar.History = function ( editor ) {

		var signals = editor.signals;

		var config = editor.config;

		var history = editor.history;

		var container = new UI.Panel();

		container.add( new UI.Text( 'HISTORY' ) );

		//

		var persistent = new UI.THREE.Boolean( config.getKey( 'settings/history' ), 'persistent' );
		persistent.setPosition( 'absolute' ).setRight( '8px' );
		persistent.onChange( function () {

			var value = this.getValue();

			config.setKey( 'settings/history', value );

			if ( value ) {

				alert( 'The history will be preserved across sessions.\nThis can have an impact on performance when working with textures.' );

				var lastUndoCmd = history.undos[ history.undos.length - 1 ];
				var lastUndoId = ( lastUndoCmd !== undefined ) ? lastUndoCmd.id : 0;
				editor.history.enableSerialization( lastUndoId );

			} else {

				signals.historyChanged.dispatch();

			}

		} );
		container.add( persistent );

		container.add( new UI.Break(), new UI.Break() );

		var ignoreObjectSelectedSignal = false;

		var outliner = new UI.Outliner( editor );
		outliner.onChange( function () {

			ignoreObjectSelectedSignal = true;

			editor.history.goToState( parseInt( outliner.getValue() ) );

			ignoreObjectSelectedSignal = false;

		} );
		container.add( outliner );

		//

		var refreshUI = function () {

			var options = [];
			var enumerator = 1;

			function buildOption( object ) {

				var option = document.createElement( 'div' );
				option.value = object.id;

				return option;

			}

			( function addObjects( objects ) {

				for ( var i = 0, l = objects.length; i < l; i ++ ) {

					var object = objects[ i ];

					var option = buildOption( object );
					option.innerHTML = '&nbsp;' + object.name;

					options.push( option );

				}

			} )( history.undos );


			( function addObjects( objects, pad ) {

				for ( var i = objects.length - 1; i >= 0; i -- ) {

					var object = objects[ i ];

					var option = buildOption( object );
					option.innerHTML = '&nbsp;' + object.name;
					option.style.opacity = 0.3;

					options.push( option );

				}

			} )( history.redos, '&nbsp;' );

			outliner.setOptions( options );

		};

		refreshUI();

		// events

		signals.editorCleared.add( refreshUI );

		signals.historyChanged.add( refreshUI );
		signals.historyChanged.add( function ( cmd ) {

			outliner.setValue( cmd !== undefined ? cmd.id : null );

		} );


		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.History', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Material = function ( editor ) {

		var signals = editor.signals;

		var currentObject;

		var currentMaterialSlot = 0;

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );

		// New / Copy / Paste

		var copiedMaterial;

		var managerRow = new UI.Row();

		// Current material slot

		var materialSlotRow = new UI.Row();

		materialSlotRow.add( new UI.Text( 'Slot' ).setWidth( '90px' ) );

		var materialSlotSelect = new UI.Select().setWidth( '170px' ).setFontSize( '12px' ).onChange( update );
		materialSlotSelect.setOptions( { 0: '' } ).setValue( 0 );
		materialSlotRow.add( materialSlotSelect );

		container.add( materialSlotRow );

		managerRow.add( new UI.Text( '' ).setWidth( '90px' ) );

		managerRow.add( new UI.Button( 'New' ).onClick( function () {

			var material = new THREE[ materialClass.getValue() ]();
			editor.execute( new SetMaterialCommand( currentObject, material, currentMaterialSlot ), 'New Material: ' + materialClass.getValue() );
			update();

		} ) );

		managerRow.add( new UI.Button( 'Copy' ).setMarginLeft( '4px' ).onClick( function () {

			copiedMaterial = currentObject.material;

			if ( Array.isArray( copiedMaterial ) ) {

				if ( copiedMaterial.length === 0 ) return;

				copiedMaterial = copiedMaterial[ currentMaterialSlot ];

			}

		} ) );

		managerRow.add( new UI.Button( 'Paste' ).setMarginLeft( '4px' ).onClick( function () {

			if ( copiedMaterial === undefined ) return;

			editor.execute( new SetMaterialCommand( currentObject, copiedMaterial, currentMaterialSlot ), 'Pasted Material: ' + materialClass.getValue() );
			refreshUI();
			update();

		} ) );

		container.add( managerRow );


		// type

		var materialClassRow = new UI.Row();
		var materialClass = new UI.Select().setOptions( {

			'LineBasicMaterial': 'LineBasicMaterial',
			'LineDashedMaterial': 'LineDashedMaterial',
			'MeshBasicMaterial': 'MeshBasicMaterial',
			'MeshDepthMaterial': 'MeshDepthMaterial',
			'MeshNormalMaterial': 'MeshNormalMaterial',
			'MeshLambertMaterial': 'MeshLambertMaterial',
			'MeshPhongMaterial': 'MeshPhongMaterial',
			'MeshStandardMaterial': 'MeshStandardMaterial',
			'MeshPhysicalMaterial': 'MeshPhysicalMaterial',
			'ShaderMaterial': 'ShaderMaterial',
			'SpriteMaterial': 'SpriteMaterial'

		} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

		materialClassRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
		materialClassRow.add( materialClass );

		container.add( materialClassRow );

		// uuid

		var materialUUIDRow = new UI.Row();
		var materialUUID = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
		var materialUUIDRenew = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick( function () {

			materialUUID.setValue( THREE.Math.generateUUID() );
			update();

		} );

		materialUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
		materialUUIDRow.add( materialUUID );
		materialUUIDRow.add( materialUUIDRenew );

		container.add( materialUUIDRow );

		// name

		var materialNameRow = new UI.Row();
		var materialName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			editor.execute( new SetMaterialValueCommand( editor.selected, 'name', materialName.getValue(), currentMaterialSlot ) );

		} );

		materialNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		materialNameRow.add( materialName );

		container.add( materialNameRow );

		// program

		var materialProgramRow = new UI.Row();
		materialProgramRow.add( new UI.Text( 'Program' ).setWidth( '90px' ) );

		var materialProgramInfo = new UI.Button( 'Info' );
		materialProgramInfo.setMarginLeft( '4px' );
		materialProgramInfo.onClick( function () {

			signals.editScript.dispatch( currentObject, 'programInfo' );

		} );
		materialProgramRow.add( materialProgramInfo );

		var materialProgramVertex = new UI.Button( 'Vertex' );
		materialProgramVertex.setMarginLeft( '4px' );
		materialProgramVertex.onClick( function () {

			signals.editScript.dispatch( currentObject, 'vertexShader' );

		} );
		materialProgramRow.add( materialProgramVertex );

		var materialProgramFragment = new UI.Button( 'Fragment' );
		materialProgramFragment.setMarginLeft( '4px' );
		materialProgramFragment.onClick( function () {

			signals.editScript.dispatch( currentObject, 'fragmentShader' );

		} );
		materialProgramRow.add( materialProgramFragment );

		container.add( materialProgramRow );

		// color

		var materialColorRow = new UI.Row();
		var materialColor = new UI.Color().onChange( update );

		materialColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
		materialColorRow.add( materialColor );

		container.add( materialColorRow );

		// roughness

		var materialRoughnessRow = new UI.Row();
		var materialRoughness = new UI.Number( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialRoughnessRow.add( new UI.Text( 'Roughness' ).setWidth( '90px' ) );
		materialRoughnessRow.add( materialRoughness );

		container.add( materialRoughnessRow );

		// metalness

		var materialMetalnessRow = new UI.Row();
		var materialMetalness = new UI.Number( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialMetalnessRow.add( new UI.Text( 'Metalness' ).setWidth( '90px' ) );
		materialMetalnessRow.add( materialMetalness );

		container.add( materialMetalnessRow );

		// emissive

		var materialEmissiveRow = new UI.Row();
		var materialEmissive = new UI.Color().setHexValue( 0x000000 ).onChange( update );

		materialEmissiveRow.add( new UI.Text( 'Emissive' ).setWidth( '90px' ) );
		materialEmissiveRow.add( materialEmissive );

		container.add( materialEmissiveRow );

		// specular

		var materialSpecularRow = new UI.Row();
		var materialSpecular = new UI.Color().setHexValue( 0x111111 ).onChange( update );

		materialSpecularRow.add( new UI.Text( 'Specular' ).setWidth( '90px' ) );
		materialSpecularRow.add( materialSpecular );

		container.add( materialSpecularRow );

		// shininess

		var materialShininessRow = new UI.Row();
		var materialShininess = new UI.Number( 30 ).onChange( update );

		materialShininessRow.add( new UI.Text( 'Shininess' ).setWidth( '90px' ) );
		materialShininessRow.add( materialShininess );

		container.add( materialShininessRow );

		// clearCoat

		var materialClearCoatRow = new UI.Row();
		var materialClearCoat = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialClearCoatRow.add( new UI.Text( 'ClearCoat' ).setWidth( '90px' ) );
		materialClearCoatRow.add( materialClearCoat );

		container.add( materialClearCoatRow );

		// clearCoatRoughness

		var materialClearCoatRoughnessRow = new UI.Row();
		var materialClearCoatRoughness = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialClearCoatRoughnessRow.add( new UI.Text( 'ClearCoat Roughness' ).setWidth( '90px' ) );
		materialClearCoatRoughnessRow.add( materialClearCoatRoughness );

		container.add( materialClearCoatRoughnessRow );

		// vertex colors

		var materialVertexColorsRow = new UI.Row();
		var materialVertexColors = new UI.Select().setOptions( {

			0: 'No',
			1: 'Face',
			2: 'Vertex'

		} ).onChange( update );

		materialVertexColorsRow.add( new UI.Text( 'Vertex Colors' ).setWidth( '90px' ) );
		materialVertexColorsRow.add( materialVertexColors );

		container.add( materialVertexColorsRow );

		// skinning

		var materialSkinningRow = new UI.Row();
		var materialSkinning = new UI.Checkbox( false ).onChange( update );

		materialSkinningRow.add( new UI.Text( 'Skinning' ).setWidth( '90px' ) );
		materialSkinningRow.add( materialSkinning );

		container.add( materialSkinningRow );

		// map

		var materialMapRow = new UI.Row();
		var materialMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialMap = new UI.Texture().onChange( update );

		materialMapRow.add( new UI.Text( 'Map' ).setWidth( '90px' ) );
		materialMapRow.add( materialMapEnabled );
		materialMapRow.add( materialMap );

		container.add( materialMapRow );

		// alpha map

		var materialAlphaMapRow = new UI.Row();
		var materialAlphaMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialAlphaMap = new UI.Texture().onChange( update );

		materialAlphaMapRow.add( new UI.Text( 'Alpha Map' ).setWidth( '90px' ) );
		materialAlphaMapRow.add( materialAlphaMapEnabled );
		materialAlphaMapRow.add( materialAlphaMap );

		container.add( materialAlphaMapRow );

		// bump map

		var materialBumpMapRow = new UI.Row();
		var materialBumpMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialBumpMap = new UI.Texture().onChange( update );
		var materialBumpScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

		materialBumpMapRow.add( new UI.Text( 'Bump Map' ).setWidth( '90px' ) );
		materialBumpMapRow.add( materialBumpMapEnabled );
		materialBumpMapRow.add( materialBumpMap );
		materialBumpMapRow.add( materialBumpScale );

		container.add( materialBumpMapRow );

		// normal map

		var materialNormalMapRow = new UI.Row();
		var materialNormalMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialNormalMap = new UI.Texture().onChange( update );

		materialNormalMapRow.add( new UI.Text( 'Normal Map' ).setWidth( '90px' ) );
		materialNormalMapRow.add( materialNormalMapEnabled );
		materialNormalMapRow.add( materialNormalMap );

		container.add( materialNormalMapRow );

		// displacement map

		var materialDisplacementMapRow = new UI.Row();
		var materialDisplacementMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialDisplacementMap = new UI.Texture().onChange( update );
		var materialDisplacementScale = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

		materialDisplacementMapRow.add( new UI.Text( 'Displace Map' ).setWidth( '90px' ) );
		materialDisplacementMapRow.add( materialDisplacementMapEnabled );
		materialDisplacementMapRow.add( materialDisplacementMap );
		materialDisplacementMapRow.add( materialDisplacementScale );

		container.add( materialDisplacementMapRow );

		// roughness map

		var materialRoughnessMapRow = new UI.Row();
		var materialRoughnessMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialRoughnessMap = new UI.Texture().onChange( update );

		materialRoughnessMapRow.add( new UI.Text( 'Rough. Map' ).setWidth( '90px' ) );
		materialRoughnessMapRow.add( materialRoughnessMapEnabled );
		materialRoughnessMapRow.add( materialRoughnessMap );

		container.add( materialRoughnessMapRow );

		// metalness map

		var materialMetalnessMapRow = new UI.Row();
		var materialMetalnessMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialMetalnessMap = new UI.Texture().onChange( update );

		materialMetalnessMapRow.add( new UI.Text( 'Metal. Map' ).setWidth( '90px' ) );
		materialMetalnessMapRow.add( materialMetalnessMapEnabled );
		materialMetalnessMapRow.add( materialMetalnessMap );

		container.add( materialMetalnessMapRow );

		// specular map

		var materialSpecularMapRow = new UI.Row();
		var materialSpecularMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialSpecularMap = new UI.Texture().onChange( update );

		materialSpecularMapRow.add( new UI.Text( 'Specular Map' ).setWidth( '90px' ) );
		materialSpecularMapRow.add( materialSpecularMapEnabled );
		materialSpecularMapRow.add( materialSpecularMap );

		container.add( materialSpecularMapRow );

		// env map

		var materialEnvMapRow = new UI.Row();
		var materialEnvMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialEnvMap = new UI.Texture( THREE.SphericalReflectionMapping ).onChange( update );
		var materialReflectivity = new UI.Number( 1 ).setWidth( '30px' ).onChange( update );

		materialEnvMapRow.add( new UI.Text( 'Env Map' ).setWidth( '90px' ) );
		materialEnvMapRow.add( materialEnvMapEnabled );
		materialEnvMapRow.add( materialEnvMap );
		materialEnvMapRow.add( materialReflectivity );

		container.add( materialEnvMapRow );

		// light map

		var materialLightMapRow = new UI.Row();
		var materialLightMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialLightMap = new UI.Texture().onChange( update );

		materialLightMapRow.add( new UI.Text( 'Light Map' ).setWidth( '90px' ) );
		materialLightMapRow.add( materialLightMapEnabled );
		materialLightMapRow.add( materialLightMap );

		container.add( materialLightMapRow );

		// ambient occlusion map

		var materialAOMapRow = new UI.Row();
		var materialAOMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialAOMap = new UI.Texture().onChange( update );
		var materialAOScale = new UI.Number( 1 ).setRange( 0, 1 ).setWidth( '30px' ).onChange( update );

		materialAOMapRow.add( new UI.Text( 'AO Map' ).setWidth( '90px' ) );
		materialAOMapRow.add( materialAOMapEnabled );
		materialAOMapRow.add( materialAOMap );
		materialAOMapRow.add( materialAOScale );

		container.add( materialAOMapRow );

		// emissive map

		var materialEmissiveMapRow = new UI.Row();
		var materialEmissiveMapEnabled = new UI.Checkbox( false ).onChange( update );
		var materialEmissiveMap = new UI.Texture().onChange( update );

		materialEmissiveMapRow.add( new UI.Text( 'Emissive Map' ).setWidth( '90px' ) );
		materialEmissiveMapRow.add( materialEmissiveMapEnabled );
		materialEmissiveMapRow.add( materialEmissiveMap );

		container.add( materialEmissiveMapRow );

		// side

		var materialSideRow = new UI.Row();
		var materialSide = new UI.Select().setOptions( {

			0: 'Front',
			1: 'Back',
			2: 'Double'

		} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

		materialSideRow.add( new UI.Text( 'Side' ).setWidth( '90px' ) );
		materialSideRow.add( materialSide );

		container.add( materialSideRow );

		// shading

		var materialShadingRow = new UI.Row();
		var materialShading = new UI.Checkbox(false).setLeft( '100px' ).onChange( update );

		materialShadingRow.add( new UI.Text( 'Flat Shaded' ).setWidth( '90px' ) );
		materialShadingRow.add( materialShading );

		container.add( materialShadingRow );

		// blending

		var materialBlendingRow = new UI.Row();
		var materialBlending = new UI.Select().setOptions( {

			0: 'No',
			1: 'Normal',
			2: 'Additive',
			3: 'Subtractive',
			4: 'Multiply',
			5: 'Custom'

		} ).setWidth( '150px' ).setFontSize( '12px' ).onChange( update );

		materialBlendingRow.add( new UI.Text( 'Blending' ).setWidth( '90px' ) );
		materialBlendingRow.add( materialBlending );

		container.add( materialBlendingRow );

		// opacity

		var materialOpacityRow = new UI.Row();
		var materialOpacity = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialOpacityRow.add( new UI.Text( 'Opacity' ).setWidth( '90px' ) );
		materialOpacityRow.add( materialOpacity );

		container.add( materialOpacityRow );

		// transparent

		var materialTransparentRow = new UI.Row();
		var materialTransparent = new UI.Checkbox().setLeft( '100px' ).onChange( update );

		materialTransparentRow.add( new UI.Text( 'Transparent' ).setWidth( '90px' ) );
		materialTransparentRow.add( materialTransparent );

		container.add( materialTransparentRow );

		// alpha test

		var materialAlphaTestRow = new UI.Row();
		var materialAlphaTest = new UI.Number().setWidth( '60px' ).setRange( 0, 1 ).onChange( update );

		materialAlphaTestRow.add( new UI.Text( 'Alpha Test' ).setWidth( '90px' ) );
		materialAlphaTestRow.add( materialAlphaTest );

		container.add( materialAlphaTestRow );

		// wireframe

		var materialWireframeRow = new UI.Row();
		var materialWireframe = new UI.Checkbox( false ).onChange( update );
		var materialWireframeLinewidth = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, 100 ).onChange( update );

		materialWireframeRow.add( new UI.Text( 'Wireframe' ).setWidth( '90px' ) );
		materialWireframeRow.add( materialWireframe );
		materialWireframeRow.add( materialWireframeLinewidth );

		container.add( materialWireframeRow );

		//

		function update() {

			var object = currentObject;

			var geometry = object.geometry;

			var previousSelectedSlot = currentMaterialSlot;

			currentMaterialSlot = parseInt( materialSlotSelect.getValue() );

			if ( currentMaterialSlot !== previousSelectedSlot ) refreshUI( true );

			var material = editor.getObjectMaterial( currentObject, currentMaterialSlot );

			var textureWarning = false;
			var objectHasUvs = false;

			if ( object instanceof THREE.Sprite ) objectHasUvs = true;
			if ( geometry instanceof THREE.Geometry && geometry.faceVertexUvs[ 0 ].length > 0 ) objectHasUvs = true;
			if ( geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined ) objectHasUvs = true;

			if ( material ) {

				if ( material.uuid !== undefined && material.uuid !== materialUUID.getValue() ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'uuid', materialUUID.getValue(), currentMaterialSlot ) );

				}

				if ( material instanceof THREE[ materialClass.getValue() ] === false ) {

					material = new THREE[ materialClass.getValue() ]();

					editor.execute( new SetMaterialCommand( currentObject, material, currentMaterialSlot ), 'New Material: ' + materialClass.getValue() );
					// TODO Copy other references in the scene graph
					// keeping name and UUID then.
					// Also there should be means to create a unique
					// copy for the current object explicitly and to
					// attach the current material to other objects.

				}

				if ( material.color !== undefined && material.color.getHex() !== materialColor.getHexValue() ) {

					editor.execute( new SetMaterialColorCommand( currentObject, 'color', materialColor.getHexValue(), currentMaterialSlot ) );

				}

				if ( material.roughness !== undefined && Math.abs( material.roughness - materialRoughness.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'roughness', materialRoughness.getValue(), currentMaterialSlot ) );

				}

				if ( material.metalness !== undefined && Math.abs( material.metalness - materialMetalness.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'metalness', materialMetalness.getValue(), currentMaterialSlot ) );

				}

				if ( material.emissive !== undefined && material.emissive.getHex() !== materialEmissive.getHexValue() ) {

					editor.execute( new SetMaterialColorCommand( currentObject, 'emissive', materialEmissive.getHexValue(), currentMaterialSlot ) );

				}

				if ( material.specular !== undefined && material.specular.getHex() !== materialSpecular.getHexValue() ) {

					editor.execute( new SetMaterialColorCommand( currentObject, 'specular', materialSpecular.getHexValue(), currentMaterialSlot ) );

				}

				if ( material.shininess !== undefined && Math.abs( material.shininess - materialShininess.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'shininess', materialShininess.getValue(), currentMaterialSlot ) );

				}

				if ( material.clearCoat !== undefined && Math.abs( material.clearCoat - materialClearCoat.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'clearCoat', materialClearCoat.getValue(), currentMaterialSlot ) );

				}

				if ( material.clearCoatRoughness !== undefined && Math.abs( material.clearCoatRoughness - materialClearCoatRoughness.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'clearCoatRoughness', materialClearCoatRoughness.getValue(), currentMaterialSlot ) );

				}

				if ( material.vertexColors !== undefined ) {

					var vertexColors = parseInt( materialVertexColors.getValue() );

					if ( material.vertexColors !== vertexColors ) {

						editor.execute( new SetMaterialValueCommand( currentObject, 'vertexColors', vertexColors, currentMaterialSlot ) );

					}

				}

				if ( material.skinning !== undefined && material.skinning !== materialSkinning.getValue() ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'skinning', materialSkinning.getValue(), currentMaterialSlot ) );

				}

				if ( material.map !== undefined ) {

					var mapEnabled = materialMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var map = mapEnabled ? materialMap.getValue() : null;
						if ( material.map !== map ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'map', map, currentMaterialSlot ) );

						}

					} else {

						if ( mapEnabled ) textureWarning = true;

					}

				}

				if ( material.alphaMap !== undefined ) {

					var mapEnabled = materialAlphaMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var alphaMap = mapEnabled ? materialAlphaMap.getValue() : null;
						if ( material.alphaMap !== alphaMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'alphaMap', alphaMap, currentMaterialSlot ) );

						}

					} else {

						if ( mapEnabled ) textureWarning = true;

					}

				}

				if ( material.bumpMap !== undefined ) {

					var bumpMapEnabled = materialBumpMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var bumpMap = bumpMapEnabled ? materialBumpMap.getValue() : null;
						if ( material.bumpMap !== bumpMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'bumpMap', bumpMap, currentMaterialSlot ) );

						}

						if ( material.bumpScale !== materialBumpScale.getValue() ) {

							editor.execute( new SetMaterialValueCommand( currentObject, 'bumpScale', materialBumpScale.getValue(), currentMaterialSlot ) );

						}

					} else {

						if ( bumpMapEnabled ) textureWarning = true;

					}

				}

				if ( material.normalMap !== undefined ) {

					var normalMapEnabled = materialNormalMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var normalMap = normalMapEnabled ? materialNormalMap.getValue() : null;
						if ( material.normalMap !== normalMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'normalMap', normalMap, currentMaterialSlot ) );

						}

					} else {

						if ( normalMapEnabled ) textureWarning = true;

					}

				}

				if ( material.displacementMap !== undefined ) {

					var displacementMapEnabled = materialDisplacementMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var displacementMap = displacementMapEnabled ? materialDisplacementMap.getValue() : null;
						if ( material.displacementMap !== displacementMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'displacementMap', displacementMap, currentMaterialSlot ) );

						}

						if ( material.displacementScale !== materialDisplacementScale.getValue() ) {

							editor.execute( new SetMaterialValueCommand( currentObject, 'displacementScale', materialDisplacementScale.getValue(), currentMaterialSlot ) );

						}

					} else {

						if ( displacementMapEnabled ) textureWarning = true;

					}

				}

				if ( material.roughnessMap !== undefined ) {

					var roughnessMapEnabled = materialRoughnessMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var roughnessMap = roughnessMapEnabled ? materialRoughnessMap.getValue() : null;
						if ( material.roughnessMap !== roughnessMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'roughnessMap', roughnessMap, currentMaterialSlot ) );

						}

					} else {

						if ( roughnessMapEnabled ) textureWarning = true;

					}

				}

				if ( material.metalnessMap !== undefined ) {

					var metalnessMapEnabled = materialMetalnessMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var metalnessMap = metalnessMapEnabled ? materialMetalnessMap.getValue() : null;
						if ( material.metalnessMap !== metalnessMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'metalnessMap', metalnessMap, currentMaterialSlot ) );

						}

					} else {

						if ( metalnessMapEnabled ) textureWarning = true;

					}

				}

				if ( material.specularMap !== undefined ) {

					var specularMapEnabled = materialSpecularMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var specularMap = specularMapEnabled ? materialSpecularMap.getValue() : null;
						if ( material.specularMap !== specularMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'specularMap', specularMap, currentMaterialSlot ) );

						}

					} else {

						if ( specularMapEnabled ) textureWarning = true;

					}

				}

				if ( material.envMap !== undefined ) {

					var envMapEnabled = materialEnvMapEnabled.getValue() === true;

					var envMap = envMapEnabled ? materialEnvMap.getValue() : null;

					if ( material.envMap !== envMap ) {

						editor.execute( new SetMaterialMapCommand( currentObject, 'envMap', envMap, currentMaterialSlot ) );

					}

				}

				if ( material.reflectivity !== undefined ) {

					var reflectivity = materialReflectivity.getValue();

					if ( material.reflectivity !== reflectivity ) {

						editor.execute( new SetMaterialValueCommand( currentObject, 'reflectivity', reflectivity, currentMaterialSlot ) );

					}

				}

				if ( material.lightMap !== undefined ) {

					var lightMapEnabled = materialLightMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var lightMap = lightMapEnabled ? materialLightMap.getValue() : null;
						if ( material.lightMap !== lightMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'lightMap', lightMap, currentMaterialSlot ) );

						}

					} else {

						if ( lightMapEnabled ) textureWarning = true;

					}

				}

				if ( material.aoMap !== undefined ) {

					var aoMapEnabled = materialAOMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var aoMap = aoMapEnabled ? materialAOMap.getValue() : null;
						if ( material.aoMap !== aoMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'aoMap', aoMap, currentMaterialSlot ) );

						}

						if ( material.aoMapIntensity !== materialAOScale.getValue() ) {

							editor.execute( new SetMaterialValueCommand( currentObject, 'aoMapIntensity', materialAOScale.getValue(), currentMaterialSlot ) );

						}

					} else {

						if ( aoMapEnabled ) textureWarning = true;

					}

				}

				if ( material.emissiveMap !== undefined ) {

					var emissiveMapEnabled = materialEmissiveMapEnabled.getValue() === true;

					if ( objectHasUvs ) {

						var emissiveMap = emissiveMapEnabled ? materialEmissiveMap.getValue() : null;
						if ( material.emissiveMap !== emissiveMap ) {

							editor.execute( new SetMaterialMapCommand( currentObject, 'emissiveMap', emissiveMap, currentMaterialSlot ) );

						}

					} else {

						if ( emissiveMapEnabled ) textureWarning = true;

					}

				}

				if ( material.side !== undefined ) {

					var side = parseInt( materialSide.getValue() );
					if ( material.side !== side ) {

						editor.execute( new SetMaterialValueCommand( currentObject, 'side', side, currentMaterialSlot ) );

					}


				}

				if ( material.flatShading !== undefined ) {

					var flatShading = materialShading.getValue();
					if ( material.flatShading != flatShading ) {

						editor.execute( new SetMaterialValueCommand( currentObject, 'flatShading', flatShading, currentMaterialSlot ) );

					}

				}

				if ( material.blending !== undefined ) {

					var blending = parseInt( materialBlending.getValue() );
					if ( material.blending !== blending ) {

						editor.execute( new SetMaterialValueCommand( currentObject, 'blending', blending, currentMaterialSlot ) );

					}

				}

				if ( material.opacity !== undefined && Math.abs( material.opacity - materialOpacity.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'opacity', materialOpacity.getValue(), currentMaterialSlot ) );

				}

				if ( material.transparent !== undefined && material.transparent !== materialTransparent.getValue() ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'transparent', materialTransparent.getValue(), currentMaterialSlot ) );

				}

				if ( material.alphaTest !== undefined && Math.abs( material.alphaTest - materialAlphaTest.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'alphaTest', materialAlphaTest.getValue(), currentMaterialSlot ) );

				}

				if ( material.wireframe !== undefined && material.wireframe !== materialWireframe.getValue() ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'wireframe', materialWireframe.getValue(), currentMaterialSlot) );

				}

				if ( material.wireframeLinewidth !== undefined && Math.abs( material.wireframeLinewidth - materialWireframeLinewidth.getValue() ) >= 0.01 ) {

					editor.execute( new SetMaterialValueCommand( currentObject, 'wireframeLinewidth', materialWireframeLinewidth.getValue(), currentMaterialSlot ) );

				}

				refreshUI();

			}

			if ( textureWarning ) {

				console.warn( "Can't set texture, model doesn't have texture coordinates" );

			}

		}

		//

		function setRowVisibility() {

			var properties = {
				'name': materialNameRow,
				'color': materialColorRow,
				'roughness': materialRoughnessRow,
				'metalness': materialMetalnessRow,
				'emissive': materialEmissiveRow,
				'specular': materialSpecularRow,
				'shininess': materialShininessRow,
				'clearCoat': materialClearCoatRow,
				'clearCoatRoughness': materialClearCoatRoughnessRow,
				'vertexShader': materialProgramRow,
				'vertexColors': materialVertexColorsRow,
				'skinning': materialSkinningRow,
				'map': materialMapRow,
				'alphaMap': materialAlphaMapRow,
				'bumpMap': materialBumpMapRow,
				'normalMap': materialNormalMapRow,
				'displacementMap': materialDisplacementMapRow,
				'roughnessMap': materialRoughnessMapRow,
				'metalnessMap': materialMetalnessMapRow,
				'specularMap': materialSpecularMapRow,
				'envMap': materialEnvMapRow,
				'lightMap': materialLightMapRow,
				'aoMap': materialAOMapRow,
				'emissiveMap': materialEmissiveMapRow,
				'side': materialSideRow,
				'flatShading': materialShadingRow,
				'blending': materialBlendingRow,
				'opacity': materialOpacityRow,
				'transparent': materialTransparentRow,
				'alphaTest': materialAlphaTestRow,
				'wireframe': materialWireframeRow
			};

			var material = currentObject.material;

			if ( Array.isArray( material ) ) {

				materialSlotRow.setDisplay( '' );

				if ( material.length === 0 ) return;

				material = material[ currentMaterialSlot ];

			} else {

				materialSlotRow.setDisplay( 'none' );

			}

			for ( var property in properties ) {

				properties[ property ].setDisplay( material[ property ] !== undefined ? '' : 'none' );

			}

		}


		function refreshUI( resetTextureSelectors ) {

			if ( ! currentObject ) return;

			var material = currentObject.material;

			if ( Array.isArray( material ) ) {

				var slotOptions = {};

				currentMaterialSlot = Math.max( 0, Math.min( material.length, currentMaterialSlot ) );

				for ( var i = 0; i < material.length; i ++ ) {

					slotOptions[ i ] = String( i + 1 ) + ': ' + material[ i ].name;

				}

				materialSlotSelect.setOptions( slotOptions ).setValue( currentMaterialSlot );

			}

			material = editor.getObjectMaterial( currentObject, currentMaterialSlot );

			if ( material.uuid !== undefined ) {

				materialUUID.setValue( material.uuid );

			}

			if ( material.name !== undefined ) {

				materialName.setValue( material.name );

			}

			materialClass.setValue( material.type );

			if ( material.color !== undefined ) {

				materialColor.setHexValue( material.color.getHexString() );

			}

			if ( material.roughness !== undefined ) {

				materialRoughness.setValue( material.roughness );

			}

			if ( material.metalness !== undefined ) {

				materialMetalness.setValue( material.metalness );

			}

			if ( material.emissive !== undefined ) {

				materialEmissive.setHexValue( material.emissive.getHexString() );

			}

			if ( material.specular !== undefined ) {

				materialSpecular.setHexValue( material.specular.getHexString() );

			}

			if ( material.shininess !== undefined ) {

				materialShininess.setValue( material.shininess );

			}

			if ( material.clearCoat !== undefined ) {

				materialClearCoat.setValue( material.clearCoat );

			}

			if ( material.clearCoatRoughness !== undefined ) {

				materialClearCoatRoughness.setValue( material.clearCoatRoughness );

			}

			if ( material.vertexColors !== undefined ) {

				materialVertexColors.setValue( material.vertexColors );

			}

			if ( material.skinning !== undefined ) {

				materialSkinning.setValue( material.skinning );

			}

			if ( material.map !== undefined ) {

				materialMapEnabled.setValue( material.map !== null );

				if ( material.map !== null || resetTextureSelectors ) {

					materialMap.setValue( material.map );

				}

			}

			if ( material.alphaMap !== undefined ) {

				materialAlphaMapEnabled.setValue( material.alphaMap !== null );

				if ( material.alphaMap !== null || resetTextureSelectors ) {

					materialAlphaMap.setValue( material.alphaMap );

				}

			}

			if ( material.bumpMap !== undefined ) {

				materialBumpMapEnabled.setValue( material.bumpMap !== null );

				if ( material.bumpMap !== null || resetTextureSelectors ) {

					materialBumpMap.setValue( material.bumpMap );

				}

				materialBumpScale.setValue( material.bumpScale );

			}

			if ( material.normalMap !== undefined ) {

				materialNormalMapEnabled.setValue( material.normalMap !== null );

				if ( material.normalMap !== null || resetTextureSelectors ) {

					materialNormalMap.setValue( material.normalMap );

				}

			}

			if ( material.displacementMap !== undefined ) {

				materialDisplacementMapEnabled.setValue( material.displacementMap !== null );

				if ( material.displacementMap !== null || resetTextureSelectors ) {

					materialDisplacementMap.setValue( material.displacementMap );

				}

				materialDisplacementScale.setValue( material.displacementScale );

			}

			if ( material.roughnessMap !== undefined ) {

				materialRoughnessMapEnabled.setValue( material.roughnessMap !== null );

				if ( material.roughnessMap !== null || resetTextureSelectors ) {

					materialRoughnessMap.setValue( material.roughnessMap );

				}

			}

			if ( material.metalnessMap !== undefined ) {

				materialMetalnessMapEnabled.setValue( material.metalnessMap !== null );

				if ( material.metalnessMap !== null || resetTextureSelectors ) {

					materialMetalnessMap.setValue( material.metalnessMap );

				}

			}

			if ( material.specularMap !== undefined ) {

				materialSpecularMapEnabled.setValue( material.specularMap !== null );

				if ( material.specularMap !== null || resetTextureSelectors ) {

					materialSpecularMap.setValue( material.specularMap );

				}

			}

			if ( material.envMap !== undefined ) {

				materialEnvMapEnabled.setValue( material.envMap !== null );

				if ( material.envMap !== null || resetTextureSelectors ) {

					materialEnvMap.setValue( material.envMap );

				}

			}

			if ( material.reflectivity !== undefined ) {

				materialReflectivity.setValue( material.reflectivity );

			}

			if ( material.lightMap !== undefined ) {

				materialLightMapEnabled.setValue( material.lightMap !== null );

				if ( material.lightMap !== null || resetTextureSelectors ) {

					materialLightMap.setValue( material.lightMap );

				}

			}

			if ( material.aoMap !== undefined ) {

				materialAOMapEnabled.setValue( material.aoMap !== null );

				if ( material.aoMap !== null || resetTextureSelectors ) {

					materialAOMap.setValue( material.aoMap );

				}

				materialAOScale.setValue( material.aoMapIntensity );

			}

			if ( material.emissiveMap !== undefined ) {

				materialEmissiveMapEnabled.setValue( material.emissiveMap !== null );

				if ( material.emissiveMap !== null || resetTextureSelectors ) {

					materialEmissiveMap.setValue( material.emissiveMap );

				}

			}

			if ( material.side !== undefined ) {

				materialSide.setValue( material.side );

			}

			if ( material.flatShading !== undefined ) {

				materialShading.setValue( material.flatShading );

			}

			if ( material.blending !== undefined ) {

				materialBlending.setValue( material.blending );

			}

			if ( material.opacity !== undefined ) {

				materialOpacity.setValue( material.opacity );

			}

			if ( material.transparent !== undefined ) {

				materialTransparent.setValue( material.transparent );

			}

			if ( material.alphaTest !== undefined ) {

				materialAlphaTest.setValue( material.alphaTest );

			}

			if ( material.wireframe !== undefined ) {

				materialWireframe.setValue( material.wireframe );

			}

			if ( material.wireframeLinewidth !== undefined ) {

				materialWireframeLinewidth.setValue( material.wireframeLinewidth );

			}

			setRowVisibility();

		}

		// events

		signals.objectSelected.add( function ( object ) {

			var hasMaterial = false;

			if ( object && object.material ) {

				hasMaterial = true;

				if ( Array.isArray( object.material ) && object.material.length === 0 ) {

					hasMaterial = false;

				}

			}

			if ( hasMaterial ) {

				var objectChanged = object !== currentObject;

				currentObject = object;
				refreshUI( objectChanged );
				container.setDisplay( '' );

			} else {

				currentObject = null;
				container.setDisplay( 'none' );

			}

		} );

		signals.materialChanged.add( function () {

			refreshUI();

		} );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Material', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Object = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );
		container.setDisplay( 'none' );

		// Actions

		var objectActions = new UI.Select().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
		objectActions.setOptions( {

			'Actions': 'Actions',
			'Reset Position': 'Reset Position',
			'Reset Rotation': 'Reset Rotation',
			'Reset Scale': 'Reset Scale'

		} );
		objectActions.onClick( function ( event ) {

			event.stopPropagation(); // Avoid panel collapsing

		} );
		objectActions.onChange( function ( event ) {

			var object = editor.selected;

			switch ( this.getValue() ) {

				case 'Reset Position':
					editor.execute( new SetPositionCommand( object, new THREE.Vector3( 0, 0, 0 ) ) );
					break;

				case 'Reset Rotation':
					editor.execute( new SetRotationCommand( object, new THREE.Euler( 0, 0, 0 ) ) );
					break;

				case 'Reset Scale':
					editor.execute( new SetScaleCommand( object, new THREE.Vector3( 1, 1, 1 ) ) );
					break;

			}

			this.setValue( 'Actions' );

		} );
		// container.addStatic( objectActions );

		// type

		var objectTypeRow = new UI.Row();
		var objectType = new UI.Text();

		objectTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
		objectTypeRow.add( objectType );

		container.add( objectTypeRow );

		// uuid

		var objectUUIDRow = new UI.Row();
		var objectUUID = new UI.Input().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
		var objectUUIDRenew = new UI.Button( 'New' ).setMarginLeft( '7px' ).onClick( function () {

			objectUUID.setValue( THREE.Math.generateUUID() );

			editor.execute( new SetUuidCommand( editor.selected, objectUUID.getValue() ) );

		} );

		objectUUIDRow.add( new UI.Text( 'UUID' ).setWidth( '90px' ) );
		objectUUIDRow.add( objectUUID );
		objectUUIDRow.add( objectUUIDRenew );

		container.add( objectUUIDRow );

		// name

		var objectNameRow = new UI.Row();
		var objectName = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			editor.execute( new SetValueCommand( editor.selected, 'name', objectName.getValue() ) );

		} );

		objectNameRow.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		objectNameRow.add( objectName );

		container.add( objectNameRow );

		// position

		var objectPositionRow = new UI.Row();
		var objectPositionX = new UI.Number().setWidth( '50px' ).onChange( update );
		var objectPositionY = new UI.Number().setWidth( '50px' ).onChange( update );
		var objectPositionZ = new UI.Number().setWidth( '50px' ).onChange( update );

		objectPositionRow.add( new UI.Text( 'Position' ).setWidth( '90px' ) );
		objectPositionRow.add( objectPositionX, objectPositionY, objectPositionZ );

		container.add( objectPositionRow );

		// rotation

		var objectRotationRow = new UI.Row();
		var objectRotationX = new UI.Number().setStep( 10 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );
		var objectRotationY = new UI.Number().setStep( 10 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );
		var objectRotationZ = new UI.Number().setStep( 10 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );

		objectRotationRow.add( new UI.Text( 'Rotation' ).setWidth( '90px' ) );
		objectRotationRow.add( objectRotationX, objectRotationY, objectRotationZ );

		container.add( objectRotationRow );

		// scale

		var objectScaleRow = new UI.Row();
		var objectScaleLock = new UI.Checkbox( true ).setPosition( 'absolute' ).setLeft( '75px' );
		var objectScaleX = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleX );
		var objectScaleY = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleY );
		var objectScaleZ = new UI.Number( 1 ).setRange( 0.01, Infinity ).setWidth( '50px' ).onChange( updateScaleZ );

		objectScaleRow.add( new UI.Text( 'Scale' ).setWidth( '90px' ) );
		objectScaleRow.add( objectScaleLock );
		objectScaleRow.add( objectScaleX, objectScaleY, objectScaleZ );

		container.add( objectScaleRow );

		// fov

		var objectFovRow = new UI.Row();
		var objectFov = new UI.Number().onChange( update );

		objectFovRow.add( new UI.Text( 'Fov' ).setWidth( '90px' ) );
		objectFovRow.add( objectFov );

		container.add( objectFovRow );

		// near

		var objectNearRow = new UI.Row();
		var objectNear = new UI.Number().onChange( update );

		objectNearRow.add( new UI.Text( 'Near' ).setWidth( '90px' ) );
		objectNearRow.add( objectNear );

		container.add( objectNearRow );

		// far

		var objectFarRow = new UI.Row();
		var objectFar = new UI.Number().onChange( update );

		objectFarRow.add( new UI.Text( 'Far' ).setWidth( '90px' ) );
		objectFarRow.add( objectFar );

		container.add( objectFarRow );

		// intensity

		var objectIntensityRow = new UI.Row();
		var objectIntensity = new UI.Number().setRange( 0, Infinity ).onChange( update );

		objectIntensityRow.add( new UI.Text( 'Intensity' ).setWidth( '90px' ) );
		objectIntensityRow.add( objectIntensity );

		container.add( objectIntensityRow );

		// color

		var objectColorRow = new UI.Row();
		var objectColor = new UI.Color().onChange( update );

		objectColorRow.add( new UI.Text( 'Color' ).setWidth( '90px' ) );
		objectColorRow.add( objectColor );

		container.add( objectColorRow );

		// ground color

		var objectGroundColorRow = new UI.Row();
		var objectGroundColor = new UI.Color().onChange( update );

		objectGroundColorRow.add( new UI.Text( 'Ground color' ).setWidth( '90px' ) );
		objectGroundColorRow.add( objectGroundColor );

		container.add( objectGroundColorRow );

		// distance

		var objectDistanceRow = new UI.Row();
		var objectDistance = new UI.Number().setRange( 0, Infinity ).onChange( update );

		objectDistanceRow.add( new UI.Text( 'Distance' ).setWidth( '90px' ) );
		objectDistanceRow.add( objectDistance );

		container.add( objectDistanceRow );

		// angle

		var objectAngleRow = new UI.Row();
		var objectAngle = new UI.Number().setPrecision( 3 ).setRange( 0, Math.PI / 2 ).onChange( update );

		objectAngleRow.add( new UI.Text( 'Angle' ).setWidth( '90px' ) );
		objectAngleRow.add( objectAngle );

		container.add( objectAngleRow );

		// penumbra

		var objectPenumbraRow = new UI.Row();
		var objectPenumbra = new UI.Number().setRange( 0, 1 ).onChange( update );

		objectPenumbraRow.add( new UI.Text( 'Penumbra' ).setWidth( '90px' ) );
		objectPenumbraRow.add( objectPenumbra );

		container.add( objectPenumbraRow );

		// decay

		var objectDecayRow = new UI.Row();
		var objectDecay = new UI.Number().setRange( 0, Infinity ).onChange( update );

		objectDecayRow.add( new UI.Text( 'Decay' ).setWidth( '90px' ) );
		objectDecayRow.add( objectDecay );

		container.add( objectDecayRow );

		// shadow

		var objectShadowRow = new UI.Row();

		objectShadowRow.add( new UI.Text( 'Shadow' ).setWidth( '90px' ) );

		var objectCastShadow = new UI.THREE.Boolean( false, 'cast' ).onChange( update );
		objectShadowRow.add( objectCastShadow );

		var objectReceiveShadow = new UI.THREE.Boolean( false, 'receive' ).onChange( update );
		objectShadowRow.add( objectReceiveShadow );

		var objectShadowRadius = new UI.Number( 1 ).onChange( update );
		objectShadowRow.add( objectShadowRadius );

		container.add( objectShadowRow );

		// visible

		var objectVisibleRow = new UI.Row();
		var objectVisible = new UI.Checkbox().onChange( update );

		objectVisibleRow.add( new UI.Text( 'Visible' ).setWidth( '90px' ) );
		objectVisibleRow.add( objectVisible );

		container.add( objectVisibleRow );

		// user data

		var timeout;

		var objectUserDataRow = new UI.Row();
		var objectUserData = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setFontSize( '12px' ).onChange( update );
		objectUserData.onKeyUp( function () {

			try {

				JSON.parse( objectUserData.getValue() );

				objectUserData.dom.classList.add( 'success' );
				objectUserData.dom.classList.remove( 'fail' );

			} catch ( error ) {

				objectUserData.dom.classList.remove( 'success' );
				objectUserData.dom.classList.add( 'fail' );

			}

		} );

		objectUserDataRow.add( new UI.Text( 'User data' ).setWidth( '90px' ) );
		objectUserDataRow.add( objectUserData );

		container.add( objectUserDataRow );


		//

		function updateScaleX() {

			var object = editor.selected;

			if ( objectScaleLock.getValue() === true ) {

				var scale = objectScaleX.getValue() / object.scale.x;

				objectScaleY.setValue( objectScaleY.getValue() * scale );
				objectScaleZ.setValue( objectScaleZ.getValue() * scale );

			}

			update();

		}

		function updateScaleY() {

			var object = editor.selected;

			if ( objectScaleLock.getValue() === true ) {

				var scale = objectScaleY.getValue() / object.scale.y;

				objectScaleX.setValue( objectScaleX.getValue() * scale );
				objectScaleZ.setValue( objectScaleZ.getValue() * scale );

			}

			update();

		}

		function updateScaleZ() {

			var object = editor.selected;

			if ( objectScaleLock.getValue() === true ) {

				var scale = objectScaleZ.getValue() / object.scale.z;

				objectScaleX.setValue( objectScaleX.getValue() * scale );
				objectScaleY.setValue( objectScaleY.getValue() * scale );

			}

			update();

		}

		function update() {

			var object = editor.selected;

			if ( object !== null ) {

				var newPosition = new THREE.Vector3( objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue() );
				if ( object.position.distanceTo( newPosition ) >= 0.01 ) {

					editor.execute( new SetPositionCommand( object, newPosition ) );

				}

				var newRotation = new THREE.Euler( objectRotationX.getValue() * THREE.Math.DEG2RAD, objectRotationY.getValue() * THREE.Math.DEG2RAD, objectRotationZ.getValue() * THREE.Math.DEG2RAD );
				if ( object.rotation.toVector3().distanceTo( newRotation.toVector3() ) >= 0.01 ) {

					editor.execute( new SetRotationCommand( object, newRotation ) );

				}

				var newScale = new THREE.Vector3( objectScaleX.getValue(), objectScaleY.getValue(), objectScaleZ.getValue() );
				if ( object.scale.distanceTo( newScale ) >= 0.01 ) {

					editor.execute( new SetScaleCommand( object, newScale ) );

				}

				if ( object.fov !== undefined && Math.abs( object.fov - objectFov.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'fov', objectFov.getValue() ) );
					object.updateProjectionMatrix();

				}

				if ( object.near !== undefined && Math.abs( object.near - objectNear.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'near', objectNear.getValue() ) );

				}

				if ( object.far !== undefined && Math.abs( object.far - objectFar.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'far', objectFar.getValue() ) );

				}

				if ( object.intensity !== undefined && Math.abs( object.intensity - objectIntensity.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'intensity', objectIntensity.getValue() ) );

				}

				if ( object.color !== undefined && object.color.getHex() !== objectColor.getHexValue() ) {

					editor.execute( new SetColorCommand( object, 'color', objectColor.getHexValue() ) );

				}

				if ( object.groundColor !== undefined && object.groundColor.getHex() !== objectGroundColor.getHexValue() ) {

					editor.execute( new SetColorCommand( object, 'groundColor', objectGroundColor.getHexValue() ) );

				}

				if ( object.distance !== undefined && Math.abs( object.distance - objectDistance.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'distance', objectDistance.getValue() ) );

				}

				if ( object.angle !== undefined && Math.abs( object.angle - objectAngle.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'angle', objectAngle.getValue() ) );

				}

				if ( object.penumbra !== undefined && Math.abs( object.penumbra - objectPenumbra.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'penumbra', objectPenumbra.getValue() ) );

				}

				if ( object.decay !== undefined && Math.abs( object.decay - objectDecay.getValue() ) >= 0.01 ) {

					editor.execute( new SetValueCommand( object, 'decay', objectDecay.getValue() ) );

				}

				if ( object.visible !== objectVisible.getValue() ) {

					editor.execute( new SetValueCommand( object, 'visible', objectVisible.getValue() ) );

				}

				if ( object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue() ) {

					editor.execute( new SetValueCommand( object, 'castShadow', objectCastShadow.getValue() ) );

				}

				if ( object.receiveShadow !== undefined && object.receiveShadow !== objectReceiveShadow.getValue() ) {

					editor.execute( new SetValueCommand( object, 'receiveShadow', objectReceiveShadow.getValue() ) );
					object.material.needsUpdate = true;

				}

				if ( object.shadow !== undefined ) {

					if ( object.shadow.radius !== objectShadowRadius.getValue() ) {

						editor.execute( new SetValueCommand( object.shadow, 'radius', objectShadowRadius.getValue() ) );

					}

				}

				try {

					var userData = JSON.parse( objectUserData.getValue() );
					if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {

						editor.execute( new SetValueCommand( object, 'userData', userData ) );

					}

				} catch ( exception ) {

					console.warn( exception );

				}

			}

		}

		function updateRows( object ) {

			var properties = {
				'fov': objectFovRow,
				'near': objectNearRow,
				'far': objectFarRow,
				'intensity': objectIntensityRow,
				'color': objectColorRow,
				'groundColor': objectGroundColorRow,
				'distance' : objectDistanceRow,
				'angle' : objectAngleRow,
				'penumbra' : objectPenumbraRow,
				'decay' : objectDecayRow,
				'castShadow' : objectShadowRow,
				'receiveShadow' : objectReceiveShadow,
				'shadow': objectShadowRadius
			};

			for ( var property in properties ) {

				properties[ property ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

			}

		}

		function updateTransformRows( object ) {

			if ( object instanceof THREE.Light ||
			   ( object instanceof THREE.Object3D && object.userData.targetInverse ) ) {

				objectRotationRow.setDisplay( 'none' );
				objectScaleRow.setDisplay( 'none' );

			} else {

				objectRotationRow.setDisplay( '' );
				objectScaleRow.setDisplay( '' );

			}

		}

		// events

		signals.objectSelected.add( function ( object ) {

			if ( object !== null ) {

				container.setDisplay( 'block' );

				updateRows( object );
				updateUI( object );

			} else {

				container.setDisplay( 'none' );

			}

		} );

		signals.objectChanged.add( function ( object ) {

			if ( object !== editor.selected ) return;

			updateUI( object );

		} );

		signals.refreshSidebarObject3D.add( function ( object ) {

			if ( object !== editor.selected ) return;

			updateUI( object );

		} );

		function updateUI( object ) {

			objectType.setValue( object.type );

			objectUUID.setValue( object.uuid );
			objectName.setValue( object.name );

			objectPositionX.setValue( object.position.x );
			objectPositionY.setValue( object.position.y );
			objectPositionZ.setValue( object.position.z );

			objectRotationX.setValue( object.rotation.x * THREE.Math.RAD2DEG );
			objectRotationY.setValue( object.rotation.y * THREE.Math.RAD2DEG );
			objectRotationZ.setValue( object.rotation.z * THREE.Math.RAD2DEG );

			objectScaleX.setValue( object.scale.x );
			objectScaleY.setValue( object.scale.y );
			objectScaleZ.setValue( object.scale.z );

			if ( object.fov !== undefined ) {

				objectFov.setValue( object.fov );

			}

			if ( object.near !== undefined ) {

				objectNear.setValue( object.near );

			}

			if ( object.far !== undefined ) {

				objectFar.setValue( object.far );

			}

			if ( object.intensity !== undefined ) {

				objectIntensity.setValue( object.intensity );

			}

			if ( object.color !== undefined ) {

				objectColor.setHexValue( object.color.getHexString() );

			}

			if ( object.groundColor !== undefined ) {

				objectGroundColor.setHexValue( object.groundColor.getHexString() );

			}

			if ( object.distance !== undefined ) {

				objectDistance.setValue( object.distance );

			}

			if ( object.angle !== undefined ) {

				objectAngle.setValue( object.angle );

			}

			if ( object.penumbra !== undefined ) {

				objectPenumbra.setValue( object.penumbra );

			}

			if ( object.decay !== undefined ) {

				objectDecay.setValue( object.decay );

			}

			if ( object.castShadow !== undefined ) {

				objectCastShadow.setValue( object.castShadow );

			}

			if ( object.receiveShadow !== undefined ) {

				objectReceiveShadow.setValue( object.receiveShadow );

			}

			if ( object.shadow !== undefined ) {

				objectShadowRadius.setValue( object.shadow.radius );

			}

			objectVisible.setValue( object.visible );

			try {

				objectUserData.setValue( JSON.stringify( object.userData, null, '  ' ) );

			} catch ( error ) {

				console.log( error );

			}

			objectUserData.setBorderColor( 'transparent' );
			objectUserData.setBackgroundColor( '' );

			updateTransformRows( object );

		}

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Object', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Project = function ( editor ) {

		var config = editor.config;
		var signals = editor.signals;

		var rendererTypes = {

			'WebGLRenderer': THREE.WebGLRenderer,
			'CanvasRenderer': THREE.CanvasRenderer,
			'SVGRenderer': THREE.SVGRenderer,
			'SoftwareRenderer': THREE.SoftwareRenderer,
			'RaytracingRenderer': THREE.RaytracingRenderer

		};

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );

		// class

		var options = {};

		for ( var key in rendererTypes ) {

			if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

			options[ key ] = key;

		}

		var rendererTypeRow = new UI.Row();
		var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

			var value = this.getValue();

			config.setKey( 'project/renderer', value );

			updateRenderer();

		} );

		rendererTypeRow.add( new UI.Text( 'Renderer' ).setWidth( '90px' ) );
		rendererTypeRow.add( rendererType );

		container.add( rendererTypeRow );

		if ( config.getKey( 'project/renderer' ) !== undefined ) {

			rendererType.setValue( config.getKey( 'project/renderer' ) );

		}

		// antialiasing

		var rendererPropertiesRow = new UI.Row().setMarginLeft( '90px' );

		var rendererAntialias = new UI.THREE.Boolean( config.getKey( 'project/renderer/antialias' ), 'antialias' ).onChange( function () {

			config.setKey( 'project/renderer/antialias', this.getValue() );
			updateRenderer();

		} );
		rendererPropertiesRow.add( rendererAntialias );

		// shadow

		var rendererShadows = new UI.THREE.Boolean( config.getKey( 'project/renderer/shadows' ), 'shadows' ).onChange( function () {

			config.setKey( 'project/renderer/shadows', this.getValue() );
			updateRenderer();

		} );
		rendererPropertiesRow.add( rendererShadows );

		rendererPropertiesRow.add( new UI.Break() );

		// gamma input

		var rendererGammaInput = new UI.THREE.Boolean( config.getKey( 'project/renderer/gammaInput' ), 'γ input' ).onChange( function () {

			config.setKey( 'project/renderer/gammaInput', this.getValue() );
			updateRenderer();

		} );
		rendererPropertiesRow.add( rendererGammaInput );

		// gamma output

		var rendererGammaOutput = new UI.THREE.Boolean( config.getKey( 'project/renderer/gammaOutput' ), 'γ output' ).onChange( function () {

			config.setKey( 'project/renderer/gammaOutput', this.getValue() );
			updateRenderer();

		} );
		rendererPropertiesRow.add( rendererGammaOutput );

		container.add( rendererPropertiesRow );

		// Editable

		var editableRow = new UI.Row();
		var editable = new UI.Checkbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

			config.setKey( 'project/editable', this.getValue() );

		} );

		editableRow.add( new UI.Text( 'Editable' ).setWidth( '90px' ) );
		editableRow.add( editable );

		container.add( editableRow );

		// VR

		var vrRow = new UI.Row();
		var vr = new UI.Checkbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

			config.setKey( 'project/vr', this.getValue() );

		} );

		vrRow.add( new UI.Text( 'VR' ).setWidth( '90px' ) );
		vrRow.add( vr );

		container.add( vrRow );

		//

		function updateRenderer() {

			createRenderer( rendererType.getValue(), rendererAntialias.getValue(), rendererShadows.getValue(), rendererGammaInput.getValue(), rendererGammaOutput.getValue() );

		}

		function createRenderer( type, antialias, shadows, gammaIn, gammaOut ) {

			if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

				type = 'CanvasRenderer';

			}

			rendererPropertiesRow.setDisplay( type === 'WebGLRenderer' ? '' : 'none' );

			var renderer = new rendererTypes[ type ]( { antialias: antialias} );
			renderer.gammaInput = gammaIn;
			renderer.gammaOutput = gammaOut;
			if ( shadows && renderer.shadowMap ) {

				renderer.shadowMap.enabled = true;
				// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			}

			signals.rendererChanged.dispatch( renderer );

		}

		createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ), config.getKey( 'project/renderer/gammaInput' ), config.getKey( 'project/renderer/gammaOutput' ) );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Project', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Properties = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Span();

		var objectTab = new UI.Text( 'OBJECT' ).onClick( onClick );
		var geometryTab = new UI.Text( 'GEOMETRY' ).onClick( onClick );
		var materialTab = new UI.Text( 'MATERIAL' ).onClick( onClick );

		var tabs = new UI.Div();
		tabs.setId( 'tabs' );
		tabs.add( objectTab, geometryTab, materialTab );
		container.add( tabs );

		function onClick( event ) {

			select( event.target.textContent );

		}

		//

		var object = new UI.Span().add(
			new Sidebar.Object( editor )
		);
		container.add( object );

		var geometry = new UI.Span().add(
			new Sidebar.Geometry( editor )
		);
		container.add( geometry );

		var material = new UI.Span().add(
			new Sidebar.Material( editor )
		);
		container.add( material );

		//

		function select( section ) {

			objectTab.setClass( '' );
			geometryTab.setClass( '' );
			materialTab.setClass( '' );

			object.setDisplay( 'none' );
			geometry.setDisplay( 'none' );
			material.setDisplay( 'none' );

			switch ( section ) {
				case 'OBJECT':
					objectTab.setClass( 'selected' );
					object.setDisplay( '' );
					break;
				case 'GEOMETRY':
					geometryTab.setClass( 'selected' );
					geometry.setDisplay( '' );
					break;
				case 'MATERIAL':
					materialTab.setClass( 'selected' );
					material.setDisplay( '' );
					break;
			}

		}

		select( 'OBJECT' );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Properties', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Scene = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );

		// outliner

		function buildOption( object, draggable ) {

			var option = document.createElement( 'div' );
			option.draggable = draggable;
			option.innerHTML = buildHTML( object );
			option.value = object.id;

			return option;

		}

		function getMaterialName( material ) {

			if ( Array.isArray( material ) ) {

				var array = [];

				for ( var i = 0; i < material.length; i ++ ) {

					array.push( material[ i ].name );

				}

				return array.join( ',' );

			}

			return material.name;

		}

		function buildHTML( object ) {

			var html = '<span class="type ' + object.type + '"></span> ' + object.name;

			if ( object instanceof THREE.Mesh ) {

				var geometry = object.geometry;
				var material = object.material;

				html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
				html += ' <span class="type ' + material.type + '"></span> ' + getMaterialName( material );

			}

			html += getScript( object.uuid );

			return html;

		}

		function getScript( uuid ) {

			if ( editor.scripts[ uuid ] !== undefined ) {

				return ' <span class="type Script"></span>';

			}

			return '';

		}

		var ignoreObjectSelectedSignal = false;

		var outliner = new UI.Outliner( editor );
		outliner.setId( 'outliner' );
		outliner.onChange( function () {

			ignoreObjectSelectedSignal = true;

			editor.selectById( parseInt( outliner.getValue() ) );

			ignoreObjectSelectedSignal = false;

		} );
		outliner.onDblClick( function () {

			editor.focusById( parseInt( outliner.getValue() ) );

		} );
		container.add( outliner );
		container.add( new UI.Break() );

		// background

		function onBackgroundChanged() {

			signals.sceneBackgroundChanged.dispatch( backgroundColor.getHexValue() );

		}

		var backgroundRow = new UI.Row();

		var backgroundColor = new UI.Color().setValue( '#aaaaaa' ).onChange( onBackgroundChanged );

		backgroundRow.add( new UI.Text( 'Background' ).setWidth( '90px' ) );
		backgroundRow.add( backgroundColor );

		container.add( backgroundRow );

		// fog

		function onFogChanged() {

			signals.sceneFogChanged.dispatch(
				fogType.getValue(),
				fogColor.getHexValue(),
				fogNear.getValue(),
				fogFar.getValue(),
				fogDensity.getValue()
			);

		}

		var fogTypeRow = new UI.Row();
		var fogType = new UI.Select().setOptions( {

			'None': 'None',
			'Fog': 'Linear',
			'FogExp2': 'Exponential'

		} ).setWidth( '150px' );
		fogType.onChange( function () {

			onFogChanged();
			refreshFogUI();

		} );

		fogTypeRow.add( new UI.Text( 'Fog' ).setWidth( '90px' ) );
		fogTypeRow.add( fogType );

		container.add( fogTypeRow );

		// fog color

		var fogPropertiesRow = new UI.Row();
		fogPropertiesRow.setDisplay( 'none' );
		fogPropertiesRow.setMarginLeft( '90px' );
		container.add( fogPropertiesRow );

		var fogColor = new UI.Color().setValue( '#aaaaaa' );
		fogColor.onChange( onFogChanged );
		fogPropertiesRow.add( fogColor );

		// fog near

		var fogNear = new UI.Number( 0.1 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
		fogPropertiesRow.add( fogNear );

		// fog far

		var fogFar = new UI.Number( 50 ).setWidth( '40px' ).setRange( 0, Infinity ).onChange( onFogChanged );
		fogPropertiesRow.add( fogFar );

		// fog density

		var fogDensity = new UI.Number( 0.05 ).setWidth( '40px' ).setRange( 0, 0.1 ).setPrecision( 3 ).onChange( onFogChanged );
		fogPropertiesRow.add( fogDensity );

		//

		function refreshUI() {

			var camera = editor.camera;
			var scene = editor.scene;

			var options = [];

			options.push( buildOption( camera, false ) );
			options.push( buildOption( scene, false ) );

			( function addObjects( objects, pad ) {

				for ( var i = 0, l = objects.length; i < l; i ++ ) {

					var object = objects[ i ];

					var option = buildOption( object, true );
					option.style.paddingLeft = ( pad * 10 ) + 'px';
					options.push( option );

					addObjects( object.children, pad + 1 );

				}

			} )( scene.children, 1 );

			outliner.setOptions( options );

			if ( editor.selected !== null ) {

				outliner.setValue( editor.selected.id );

			}

			if ( scene.background ) {

				backgroundColor.setHexValue( scene.background.getHex() );

			}

			if ( scene.fog ) {

				fogColor.setHexValue( scene.fog.color.getHex() );

				if ( scene.fog instanceof THREE.Fog ) {

					fogType.setValue( "Fog" );
					fogNear.setValue( scene.fog.near );
					fogFar.setValue( scene.fog.far );

				} else if ( scene.fog instanceof THREE.FogExp2 ) {

					fogType.setValue( "FogExp2" );
					fogDensity.setValue( scene.fog.density );

				}

			} else {

				fogType.setValue( "None" );

			}

			refreshFogUI();

		}

		function refreshFogUI() {

			var type = fogType.getValue();

			fogPropertiesRow.setDisplay( type === 'None' ? 'none' : '' );
			fogNear.setDisplay( type === 'Fog' ? '' : 'none' );
			fogFar.setDisplay( type === 'Fog' ? '' : 'none' );
			fogDensity.setDisplay( type === 'FogExp2' ? '' : 'none' );

		}

		refreshUI();

		// events

		signals.editorCleared.add( refreshUI );

		signals.sceneGraphChanged.add( refreshUI );

		signals.objectChanged.add( function ( object ) {

			var options = outliner.options;

			for ( var i = 0; i < options.length; i ++ ) {

				var option = options[ i ];

				if ( option.value === object.id ) {

					option.innerHTML = buildHTML( object );
					return;

				}

			}

		} );

		signals.objectSelected.add( function ( object ) {

			if ( ignoreObjectSelectedSignal === true ) return;

			outliner.setValue( object !== null ? object.id : null );

		} );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Scene', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Script = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setDisplay( 'none' );

		container.add( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
		container.add( new UI.Break() );
		container.add( new UI.Break() );

		//

		var scriptsContainer = new UI.Row();
		container.add( scriptsContainer );

		var newScript = new UI.Button( 'New' );
		newScript.onClick( function () {

			var script = { name: '', source: 'function update( event ) {}' };
			editor.execute( new AddScriptCommand( editor.selected, script ) );

		} );
		container.add( newScript );

		/*
		var loadScript = new UI.Button( 'Load' );
		loadScript.setMarginLeft( '4px' );
		container.add( loadScript );
		*/

		//

		function update() {

			scriptsContainer.clear();
			scriptsContainer.setDisplay( 'none' );

			var object = editor.selected;

			if ( object === null ) {

				return;

			}

			var scripts = editor.scripts[ object.uuid ];

			if ( scripts !== undefined ) {

				scriptsContainer.setDisplay( 'block' );

				for ( var i = 0; i < scripts.length; i ++ ) {

					( function ( object, script ) {

						var name = new UI.Input( script.name ).setWidth( '130px' ).setFontSize( '12px' );
						name.onChange( function () {

							editor.execute( new SetScriptValueCommand( editor.selected, script, 'name', this.getValue() ) );

						} );
						scriptsContainer.add( name );

						var edit = new UI.Button( 'Edit' );
						edit.setMarginLeft( '4px' );
						edit.onClick( function () {

							signals.editScript.dispatch( object, script );

						} );
						scriptsContainer.add( edit );

						var remove = new UI.Button( 'Remove' );
						remove.setMarginLeft( '4px' );
						remove.onClick( function () {

							if ( confirm( 'Are you sure?' ) ) {

								editor.execute( new RemoveScriptCommand( editor.selected, script ) );

							}

						} );
						scriptsContainer.add( remove );

						scriptsContainer.add( new UI.Break() );

					} )( object, scripts[ i ] );

				}

			}

		}

		// signals

		signals.objectSelected.add( function ( object ) {

			if ( object !== null && editor.camera !== object ) {

				container.setDisplay( 'block' );

				update();

			} else {

				container.setDisplay( 'none' );

			}

		} );

		signals.scriptAdded.add( update );
		signals.scriptRemoved.add( update );
		signals.scriptChanged.add( update );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Script', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Sidebar.Settings = function ( editor ) {

		var config = editor.config;
		var signals = editor.signals;

		var container = new UI.Panel();
		container.setBorderTop( '0' );
		container.setPaddingTop( '20px' );

		// class

		var options = {
			'css/light.css': 'light',
			'css/dark.css': 'dark'
		};

		var themeRow = new UI.Row();
		var theme = new UI.Select().setWidth( '150px' );
		theme.setOptions( options );

		if ( config.getKey( 'theme' ) !== undefined ) {

			theme.setValue( config.getKey( 'theme' ) );

		}

		theme.onChange( function () {

			var value = this.getValue();

			editor.setTheme( value );
			editor.config.setKey( 'theme', value );

		} );

		themeRow.add( new UI.Text( 'Theme' ).setWidth( '90px' ) );
		themeRow.add( theme );

		container.add( themeRow );

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Sidebar.Settings', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Storage', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Toolbar', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Viewport', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author mrdoob / http://mrdoob.com/
	 */

	Viewport.Info = function ( editor ) {

		var signals = editor.signals;

		var container = new UI.Panel();
		container.setId( 'info' );
		container.setPosition( 'absolute' );
		container.setLeft( '10px' );
		container.setBottom( '10px' );
		container.setFontSize( '12px' );
		container.setColor( '#fff' );

		var objectsText = new UI.Text( '0' ).setMarginLeft( '6px' );
		var verticesText = new UI.Text( '0' ).setMarginLeft( '6px' );
		var trianglesText = new UI.Text( '0' ).setMarginLeft( '6px' );

		container.add( new UI.Text( 'objects' ), objectsText, new UI.Break() );
		container.add( new UI.Text( 'vertices' ), verticesText, new UI.Break() );
		container.add( new UI.Text( 'triangles' ), trianglesText, new UI.Break() );

		signals.objectAdded.add( update );
		signals.objectRemoved.add( update );
		signals.geometryChanged.add( update );

		//

		function update() {

			var scene = editor.scene;

			var objects = 0, vertices = 0, triangles = 0;

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var object = scene.children[ i ];

				object.traverseVisible( function ( object ) {

					objects ++;

					if ( object instanceof THREE.Mesh ) {

						var geometry = object.geometry;

						if ( geometry instanceof THREE.Geometry ) {

							vertices += geometry.vertices.length;
							triangles += geometry.faces.length;

						} else if ( geometry instanceof THREE.BufferGeometry ) {

							if ( geometry.index !== null ) {

								vertices += geometry.index.count * 3;
								triangles += geometry.index.count;

							} else {

								vertices += geometry.attributes.position.count;
								triangles += geometry.attributes.position.count / 3;

							}

						}

					}

				} );

			}

			objectsText.setValue( objects.format() );
			verticesText.setValue( vertices.format() );
			trianglesText.setValue( triangles.format() );

		}

		return container;

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module.todo( 'Viewport.Info', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @constructor
	 */

	var AddObjectCommand$1 = function ( object ) {

		Command.call( this );

		this.type = 'AddObjectCommand';

		this.object = object;
		if ( object !== undefined ) {

			this.name = 'Add Object: ' + object.name;

		}

	};

	AddObjectCommand$1.prototype = {

		execute: function () {

			this.editor.addObject( this.object );
			this.editor.select( this.object );

		},

		undo: function () {

			this.editor.removeObject( this.object );
			this.editor.deselect();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );
			output.object = this.object.toJSON();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.object.object.uuid );

			if ( this.object === undefined ) {

				var loader = new THREE.ObjectLoader();
				this.object = loader.parse( json.object );

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'AddObjectCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param script javascript object
	 * @constructor
	 */

	var AddScriptCommand$1 = function ( object, script ) {

		Command.call( this );

		this.type = 'AddScriptCommand';
		this.name = 'Add Script';

		this.object = object;
		this.script = script;

	};

	AddScriptCommand$1.prototype = {

		execute: function () {

			if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

				this.editor.scripts[ this.object.uuid ] = [];

			}

			this.editor.scripts[ this.object.uuid ].push( this.script );

			this.editor.signals.scriptAdded.dispatch( this.script );

		},

		undo: function () {

			if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

			var index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

			if ( index !== - 1 ) {

				this.editor.scripts[ this.object.uuid ].splice( index, 1 );

			}

			this.editor.signals.scriptRemoved.dispatch( this.script );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.script = this.script;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.script = json.script;
			this.object = this.editor.objectByUuid( json.objectUuid );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'AddScriptCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newParent THREE.Object3D
	 * @param newBefore THREE.Object3D
	 * @constructor
	 */

	var MoveObjectCommand = function ( object, newParent, newBefore ) {

		Command.call( this );

		this.type = 'MoveObjectCommand';
		this.name = 'Move Object';

		this.object = object;
		this.oldParent = ( object !== undefined ) ? object.parent : undefined;
		this.oldIndex = ( this.oldParent !== undefined ) ? this.oldParent.children.indexOf( this.object ) : undefined;
		this.newParent = newParent;

		if ( newBefore !== undefined ) {

			this.newIndex = ( newParent !== undefined ) ? newParent.children.indexOf( newBefore ) : undefined;

		} else {

			this.newIndex = ( newParent !== undefined ) ? newParent.children.length : undefined;

		}

		if ( this.oldParent === this.newParent && this.newIndex > this.oldIndex ) {

			this.newIndex --;

		}

		this.newBefore = newBefore;

	};

	MoveObjectCommand.prototype = {

		execute: function () {

			this.oldParent.remove( this.object );

			var children = this.newParent.children;
			children.splice( this.newIndex, 0, this.object );
			this.object.parent = this.newParent;

			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.newParent.remove( this.object );

			var children = this.oldParent.children;
			children.splice( this.oldIndex, 0, this.object );
			this.object.parent = this.oldParent;

			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.newParentUuid = this.newParent.uuid;
			output.oldParentUuid = this.oldParent.uuid;
			output.newIndex = this.newIndex;
			output.oldIndex = this.oldIndex;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.oldParent = this.editor.objectByUuid( json.oldParentUuid );
			if ( this.oldParent === undefined ) {

				this.oldParent = this.editor.scene;

			}
			this.newParent = this.editor.objectByUuid( json.newParentUuid );
			if ( this.newParent === undefined ) {

				this.newParent = this.editor.scene;

			}
			this.newIndex = json.newIndex;
			this.oldIndex = json.oldIndex;

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'MoveObjectCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param cmdArray array containing command objects
	 * @constructor
	 */

	var MultiCmdsCommand$1 = function ( cmdArray ) {

		Command.call( this );

		this.type = 'MultiCmdsCommand';
		this.name = 'Multiple Changes';

		this.cmdArray = ( cmdArray !== undefined ) ? cmdArray : [];

	};

	MultiCmdsCommand$1.prototype = {

		execute: function () {

			this.editor.signals.sceneGraphChanged.active = false;

			for ( var i = 0; i < this.cmdArray.length; i ++ ) {

				this.cmdArray[ i ].execute();

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.editor.signals.sceneGraphChanged.active = false;

			for ( var i = this.cmdArray.length - 1; i >= 0; i -- ) {

				this.cmdArray[ i ].undo();

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			var cmds = [];
			for ( var i = 0; i < this.cmdArray.length; i ++ ) {

				cmds.push( this.cmdArray[ i ].toJSON() );

			}
			output.cmds = cmds;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			var cmds = json.cmds;
			for ( var i = 0; i < cmds.length; i ++ ) {

				var cmd = new window[ cmds[ i ].type ]();	// creates a new object of type "json.type"
				cmd.fromJSON( cmds[ i ] );
				this.cmdArray.push( cmd );

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'MultiCmdsCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @constructor
	 */

	var RemoveObjectCommand$1 = function ( object ) {

		Command.call( this );

		this.type = 'RemoveObjectCommand';
		this.name = 'Remove Object';

		this.object = object;
		this.parent = ( object !== undefined ) ? object.parent : undefined;
		if ( this.parent !== undefined ) {

			this.index = this.parent.children.indexOf( this.object );

		}

	};

	RemoveObjectCommand$1.prototype = {

		execute: function () {

			var scope = this.editor;
			this.object.traverse( function ( child ) {

				scope.removeHelper( child );

			} );

			this.parent.remove( this.object );
			this.editor.select( this.parent );

			this.editor.signals.objectRemoved.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			var scope = this.editor;

			this.object.traverse( function ( child ) {

				if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
				if ( child.material !== undefined ) scope.addMaterial( child.material );

				scope.addHelper( child );

			} );

			this.parent.children.splice( this.index, 0, this.object );
			this.object.parent = this.parent;
			this.editor.select( this.object );

			this.editor.signals.objectAdded.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );
			output.object = this.object.toJSON();
			output.index = this.index;
			output.parentUuid = this.parent.uuid;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.parent = this.editor.objectByUuid( json.parentUuid );
			if ( this.parent === undefined ) {

				this.parent = this.editor.scene;

			}

			this.index = json.index;

			this.object = this.editor.objectByUuid( json.object.object.uuid );
			if ( this.object === undefined ) {

				var loader = new THREE.ObjectLoader();
				this.object = loader.parse( json.object );

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'RemoveObjectCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param script javascript object
	 * @constructor
	 */

	var RemoveScriptCommand$1 = function ( object, script ) {

		Command.call( this );

		this.type = 'RemoveScriptCommand';
		this.name = 'Remove Script';

		this.object = object;
		this.script = script;
		if ( this.object && this.script ) {

			this.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		}

	};

	RemoveScriptCommand$1.prototype = {

		execute: function () {

			if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

			if ( this.index !== - 1 ) {

				this.editor.scripts[ this.object.uuid ].splice( this.index, 1 );

			}

			this.editor.signals.scriptRemoved.dispatch( this.script );

		},

		undo: function () {

			if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

				this.editor.scripts[ this.object.uuid ] = [];

			}

			this.editor.scripts[ this.object.uuid ].splice( this.index, 0, this.script );

			this.editor.signals.scriptAdded.dispatch( this.script );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.script = this.script;
			output.index = this.index;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.script = json.script;
			this.index = json.index;
			this.object = this.editor.objectByUuid( json.objectUuid );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'RemoveScriptCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue integer representing a hex color value
	 * @constructor
	 */

	var SetColorCommand$1 = function ( object, attributeName, newValue ) {

		Command.call( this );

		this.type = 'SetColorCommand';
		this.name = 'Set ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== undefined ) ? this.object[ this.attributeName ].getHex() : undefined;
		this.newValue = newValue;

	};

	SetColorCommand$1.prototype = {

		execute: function () {

			this.object[ this.attributeName ].setHex( this.newValue );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		undo: function () {

			this.object[ this.attributeName ].setHex( this.oldValue );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		update: function ( cmd ) {

			this.newValue = cmd.newValue;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetColorCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newGeometry THREE.Geometry
	 * @constructor
	 */

	var SetGeometryCommand$1 = function ( object, newGeometry ) {

		Command.call( this );

		this.type = 'SetGeometryCommand';
		this.name = 'Set Geometry';
		this.updatable = true;

		this.object = object;
		this.oldGeometry = ( object !== undefined ) ? object.geometry : undefined;
		this.newGeometry = newGeometry;

	};

	SetGeometryCommand$1.prototype = {

		execute: function () {

			this.object.geometry.dispose();
			this.object.geometry = this.newGeometry;
			this.object.geometry.computeBoundingSphere();

			this.editor.signals.geometryChanged.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.object.geometry.dispose();
			this.object.geometry = this.oldGeometry;
			this.object.geometry.computeBoundingSphere();

			this.editor.signals.geometryChanged.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		update: function ( cmd ) {

			this.newGeometry = cmd.newGeometry;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.oldGeometry = this.object.geometry.toJSON();
			output.newGeometry = this.newGeometry.toJSON();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );

			this.oldGeometry = parseGeometry( json.oldGeometry );
			this.newGeometry = parseGeometry( json.newGeometry );

			function parseGeometry ( data ) {

				var loader = new THREE.ObjectLoader();
				return loader.parseGeometries( [ data ] )[ data.uuid ];

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetGeometryCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue number, string, boolean or object
	 * @constructor
	 */

	var SetGeometryValueCommand$1 = function ( object, attributeName, newValue ) {

		Command.call( this );

		this.type = 'SetGeometryValueCommand';
		this.name = 'Set Geometry.' + attributeName;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== undefined ) ? object.geometry[ attributeName ] : undefined;
		this.newValue = newValue;

	};

	SetGeometryValueCommand$1.prototype = {

		execute: function () {

			this.object.geometry[ this.attributeName ] = this.newValue;
			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.geometryChanged.dispatch();
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.object.geometry[ this.attributeName ] = this.oldValue;
			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.geometryChanged.dispatch();
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetGeometryValueCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue integer representing a hex color value
	 * @constructor
	 */

	var SetMaterialColorCommand$1 = function ( object, attributeName, newValue, materialSlot ) {

		Command.call( this );

		this.type = 'SetMaterialColorCommand';
		this.name = 'Set Material.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.material = this.editor.getObjectMaterial( object, materialSlot );

		this.oldValue = ( this.material !== undefined ) ? this.material[ attributeName ].getHex() : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;

	};

	SetMaterialColorCommand$1.prototype = {

		execute: function () {

			this.material[ this.attributeName ].setHex( this.newValue );

			this.editor.signals.materialChanged.dispatch( this.material );

		},

		undo: function () {

			this.material[ this.attributeName ].setHex( this.oldValue );

			this.editor.signals.materialChanged.dispatch( this.material );

		},

		update: function ( cmd ) {

			this.newValue = cmd.newValue;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetMaterialColorCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newMaterial THREE.Material
	 * @constructor
	 */


	var SetMaterialCommand$1 = function ( object, newMaterial, materialSlot ) {

		Command.call( this );

		this.type = 'SetMaterialCommand';
		this.name = 'New Material';

		this.object = object;
		this.materialSlot = materialSlot;

		this.oldMaterial = this.editor.getObjectMaterial( object, materialSlot );
		this.newMaterial = newMaterial;

	};

	SetMaterialCommand$1.prototype = {

		execute: function () {

			this.editor.setObjectMaterial( this.object, this.materialSlot, this.newMaterial );
			this.editor.signals.materialChanged.dispatch( this.newMaterial );

		},

		undo: function () {

			this.editor.setObjectMaterial( this.object, this.materialSlot, this.oldMaterial );
			this.editor.signals.materialChanged.dispatch( this.oldMaterial );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.oldMaterial = this.oldMaterial.toJSON();
			output.newMaterial = this.newMaterial.toJSON();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.oldMaterial = parseMaterial( json.oldMaterial );
			this.newMaterial = parseMaterial( json.newMaterial );

			function parseMaterial ( json ) {

				var loader = new THREE.ObjectLoader();
				var images = loader.parseImages( json.images );
				var textures  = loader.parseTextures( json.textures, images );
				var materials = loader.parseMaterials( [ json ], textures );
				return materials[ json.uuid ];

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetMaterialCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param mapName string
	 * @param newMap THREE.Texture
	 * @constructor
	 */

	var SetMaterialMapCommand$1 = function ( object, mapName, newMap, materialSlot ) {

		Command.call( this );

		this.type = 'SetMaterialMapCommand';
		this.name = 'Set Material.' + mapName;

		this.object = object;
		this.material = this.editor.getObjectMaterial( object, materialSlot );

		this.oldMap = ( object !== undefined ) ? this.material[ mapName ] : undefined;
		this.newMap = newMap;

		this.mapName = mapName;

	};

	SetMaterialMapCommand$1.prototype = {

		execute: function () {

			this.material[ this.mapName ] = this.newMap;
			this.material.needsUpdate = true;

			this.editor.signals.materialChanged.dispatch( this.material );

		},

		undo: function () {

			this.material[ this.mapName ] = this.oldMap;
			this.material.needsUpdate = true;

			this.editor.signals.materialChanged.dispatch( this.material );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.mapName = this.mapName;
			output.newMap = serializeMap( this.newMap );
			output.oldMap = serializeMap( this.oldMap );

			return output;

			// serializes a map (THREE.Texture)

			function serializeMap ( map ) {

				if ( map === null || map === undefined ) return null;

				var meta = {
					geometries: {},
					materials: {},
					textures: {},
					images: {}
				};

				var json = map.toJSON( meta );
				var images = extractFromCache( meta.images );
				if ( images.length > 0 ) json.images = images;
				json.sourceFile = map.sourceFile;

				return json;

			}

			// Note: The function 'extractFromCache' is copied from Object3D.toJSON()

			// extract data from the cache hash
			// remove metadata on each item
			// and return as array
			function extractFromCache ( cache ) {

				var values = [];
				for ( var key in cache ) {

					var data = cache[ key ];
					delete data.metadata;
					values.push( data );

				}
				return values;

			}

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.mapName = json.mapName;
			this.oldMap = parseTexture( json.oldMap );
			this.newMap = parseTexture( json.newMap );

			function parseTexture ( json ) {

				var map = null;
				if ( json !== null ) {

					var loader = new THREE.ObjectLoader();
					var images = loader.parseImages( json.images );
					var textures  = loader.parseTextures( [ json ], images );
					map = textures[ json.uuid ];
					map.sourceFile = json.sourceFile;

				}
				return map;

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetMaterialMapCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue number, string, boolean or object
	 * @constructor
	 */

	var SetMaterialValueCommand$1 = function ( object, attributeName, newValue, materialSlot ) {

		Command.call( this );

		this.type = 'SetMaterialValueCommand';
		this.name = 'Set Material.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.material = this.editor.getObjectMaterial( object, materialSlot );

		this.oldValue = ( this.material !== undefined ) ? this.material[ attributeName ] : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;

	};

	SetMaterialValueCommand$1.prototype = {

		execute: function () {

			this.material[ this.attributeName ] = this.newValue;
			this.material.needsUpdate = true;

			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.materialChanged.dispatch( this.material );

		},

		undo: function () {

			this.material[ this.attributeName ] = this.oldValue;
			this.material.needsUpdate = true;

			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.materialChanged.dispatch( this.material );

		},

		update: function ( cmd ) {

			this.newValue = cmd.newValue;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.object = this.editor.objectByUuid( json.objectUuid );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetMaterialValueCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newPosition THREE.Vector3
	 * @param optionalOldPosition THREE.Vector3
	 * @constructor
	 */

	var SetPositionCommand$1 = function ( object, newPosition, optionalOldPosition ) {

		Command.call( this );

		this.type = 'SetPositionCommand';
		this.name = 'Set Position';
		this.updatable = true;

		this.object = object;

		if ( object !== undefined && newPosition !== undefined ) {

			this.oldPosition = object.position.clone();
			this.newPosition = newPosition.clone();

		}

		if ( optionalOldPosition !== undefined ) {

			this.oldPosition = optionalOldPosition.clone();

		}

	};
	SetPositionCommand$1.prototype = {

		execute: function () {

			this.object.position.copy( this.newPosition );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		undo: function () {

			this.object.position.copy( this.oldPosition );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		update: function ( command ) {

			this.newPosition.copy( command.newPosition );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.oldPosition = this.oldPosition.toArray();
			output.newPosition = this.newPosition.toArray();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.oldPosition = new THREE.Vector3().fromArray( json.oldPosition );
			this.newPosition = new THREE.Vector3().fromArray( json.newPosition );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetPositionCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newRotation THREE.Euler
	 * @param optionalOldRotation THREE.Euler
	 * @constructor
	 */

	var SetRotationCommand$1 = function ( object, newRotation, optionalOldRotation ) {

		Command.call( this );

		this.type = 'SetRotationCommand';
		this.name = 'Set Rotation';
		this.updatable = true;

		this.object = object;

		if ( object !== undefined && newRotation !== undefined ) {

			this.oldRotation = object.rotation.clone();
			this.newRotation = newRotation.clone();

		}

		if ( optionalOldRotation !== undefined ) {

			this.oldRotation = optionalOldRotation.clone();

		}

	};

	SetRotationCommand$1.prototype = {

		execute: function () {

			this.object.rotation.copy( this.newRotation );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		undo: function () {

			this.object.rotation.copy( this.oldRotation );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		update: function ( command ) {

			this.newRotation.copy( command.newRotation );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.oldRotation = this.oldRotation.toArray();
			output.newRotation = this.newRotation.toArray();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.oldRotation = new THREE.Euler().fromArray( json.oldRotation );
			this.newRotation = new THREE.Euler().fromArray( json.newRotation );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetRotationCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newScale THREE.Vector3
	 * @param optionalOldScale THREE.Vector3
	 * @constructor
	 */

	var SetScaleCommand$1 = function ( object, newScale, optionalOldScale ) {

		Command.call( this );

		this.type = 'SetScaleCommand';
		this.name = 'Set Scale';
		this.updatable = true;

		this.object = object;

		if ( object !== undefined && newScale !== undefined ) {

			this.oldScale = object.scale.clone();
			this.newScale = newScale.clone();

		}

		if ( optionalOldScale !== undefined ) {

			this.oldScale = optionalOldScale.clone();

		}

	};

	SetScaleCommand$1.prototype = {

		execute: function () {

			this.object.scale.copy( this.newScale );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		undo: function () {

			this.object.scale.copy( this.oldScale );
			this.object.updateMatrixWorld( true );
			this.editor.signals.objectChanged.dispatch( this.object );

		},

		update: function ( command ) {

			this.newScale.copy( command.newScale );

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.oldScale = this.oldScale.toArray();
			output.newScale = this.newScale.toArray();

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.object = this.editor.objectByUuid( json.objectUuid );
			this.oldScale = new THREE.Vector3().fromArray( json.oldScale );
			this.newScale = new THREE.Vector3().fromArray( json.newScale );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetScaleCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param scene containing children to import
	 * @constructor
	 */

	var SetSceneCommand$1 = function ( scene ) {

		Command.call( this );

		this.type = 'SetSceneCommand';
		this.name = 'Set Scene';

		this.cmdArray = [];

		if ( scene !== undefined ) {

			this.cmdArray.push( new SetUuidCommand( this.editor.scene, scene.uuid ) );
			this.cmdArray.push( new SetValueCommand( this.editor.scene, 'name', scene.name ) );
			this.cmdArray.push( new SetValueCommand( this.editor.scene, 'userData', JSON.parse( JSON.stringify( scene.userData ) ) ) );

			while ( scene.children.length > 0 ) {

				var child = scene.children.pop();
				this.cmdArray.push( new AddObjectCommand( child ) );

			}

		}

	};

	SetSceneCommand$1.prototype = {

		execute: function () {

			this.editor.signals.sceneGraphChanged.active = false;

			for ( var i = 0; i < this.cmdArray.length; i ++ ) {

				this.cmdArray[ i ].execute();

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.editor.signals.sceneGraphChanged.active = false;

			for ( var i = this.cmdArray.length - 1; i >= 0; i -- ) {

				this.cmdArray[ i ].undo();

			}

			this.editor.signals.sceneGraphChanged.active = true;
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			var cmds = [];
			for ( var i = 0; i < this.cmdArray.length; i ++ ) {

				cmds.push( this.cmdArray[ i ].toJSON() );

			}
			output.cmds = cmds;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			var cmds = json.cmds;
			for ( var i = 0; i < cmds.length; i ++ ) {

				var cmd = new window[ cmds[ i ].type ]();	// creates a new object of type "json.type"
				cmd.fromJSON( cmds[ i ] );
				this.cmdArray.push( cmd );

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetSceneCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param script javascript object
	 * @param attributeName string
	 * @param newValue string, object
	 * @constructor
	 */

	var SetScriptValueCommand$1 = function ( object, script, attributeName, newValue ) {

		Command.call( this );

		this.type = 'SetScriptValueCommand';
		this.name = 'Set Script.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.script = script;

		this.attributeName = attributeName;
		this.oldValue = ( script !== undefined ) ? script[ this.attributeName ] : undefined;
		this.newValue = newValue;

	};

	SetScriptValueCommand$1.prototype = {

		execute: function () {

			this.script[ this.attributeName ] = this.newValue;

			this.editor.signals.scriptChanged.dispatch();

		},

		undo: function () {

			this.script[ this.attributeName ] = this.oldValue;

			this.editor.signals.scriptChanged.dispatch();

		},

		update: function ( cmd ) {

			this.newValue = cmd.newValue;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.attributeName = json.attributeName;
			this.object = this.editor.objectByUuid( json.objectUuid );
			this.script = this.editor.scripts[ json.objectUuid ][ json.index ];

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetScriptValueCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param newUuid string
	 * @constructor
	 */

	var SetUuidCommand$1 = function ( object, newUuid ) {

		Command.call( this );

		this.type = 'SetUuidCommand';
		this.name = 'Update UUID';

		this.object = object;

		this.oldUuid = ( object !== undefined ) ? object.uuid : undefined;
		this.newUuid = newUuid;

	};

	SetUuidCommand$1.prototype = {

		execute: function () {

			this.object.uuid = this.newUuid;
			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.object.uuid = this.oldUuid;
			this.editor.signals.objectChanged.dispatch( this.object );
			this.editor.signals.sceneGraphChanged.dispatch();

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.oldUuid = this.oldUuid;
			output.newUuid = this.newUuid;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.oldUuid = json.oldUuid;
			this.newUuid = json.newUuid;
			this.object = this.editor.objectByUuid( json.oldUuid );

			if ( this.object === undefined ) {

				this.object = this.editor.objectByUuid( json.newUuid );

			}

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetUuidCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */

	/**
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue number, string, boolean or object
	 * @constructor
	 */

	var SetValueCommand$1 = function ( object, attributeName, newValue ) {

		Command.call( this );

		this.type = 'SetValueCommand';
		this.name = 'Set ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== undefined ) ? object[ attributeName ] : undefined;
		this.newValue = newValue;

	};

	SetValueCommand$1.prototype = {

		execute: function () {

			this.object[ this.attributeName ] = this.newValue;
			this.editor.signals.objectChanged.dispatch( this.object );
			// this.editor.signals.sceneGraphChanged.dispatch();

		},

		undo: function () {

			this.object[ this.attributeName ] = this.oldValue;
			this.editor.signals.objectChanged.dispatch( this.object );
			// this.editor.signals.sceneGraphChanged.dispatch();

		},

		update: function ( cmd ) {

			this.newValue = cmd.newValue;

		},

		toJSON: function () {

			var output = Command.prototype.toJSON.call( this );

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;

		},

		fromJSON: function ( json ) {

			Command.prototype.fromJSON.call( this, json );

			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.object = this.editor.objectByUuid( json.objectUuid );

		}

	};

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */
	/* global QUnit */

	QUnit.module( 'Editor', () => {

		QUnit.module( 'Commands', () => {

			QUnit.module.todo( 'SetValueCommand', () => {

				QUnit.test( 'write me !', ( assert ) => {

					assert.ok( false, "everything's gonna be alright" );

				} );

			} );

		} );

	} );

	/**
	 * @author TristanVALCKE / https://github.com/Itee
	 */

	// TODO (Itee) Editor is not es6 module so care to include order !!!
	// TODO: all views could not be testable, waiting modular code before implement units tests on them

	//editor
	//editor/commands


	//editor/others

	} );

})));
