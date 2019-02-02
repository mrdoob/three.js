/**
 * @author Temdog007 / https://github.com/Temdog007
 */


/**
 * @param texture THREE.Texture
 * @param attributeNames Array of strings
 * @param newValue number, string, boolean or object
 * @constructor
 */

var SetTextureValueCommand = function ( texture, attributeNames, newValue ) {

	Command.call( this );

	this.type = 'SetTextureValueCommand';
	this.updatable = true;

	this.texture = texture;

	if ( Array.isArray( attributeNames ) === false ) {

		this.attributeNames = [ attributeNames ];

	} else {

		this.attributeNames = attributeNames;

	}
	this.name = 'Set Texture.' + attributeNames;

	this.oldValue = ( this.texture !== undefined ) ? this.getRootObject()[ this.getKey() ] : undefined;
	this.newValue = newValue;

};

SetTextureValueCommand.prototype = {

	getRootObject: function () {

		var obj = this.texture;
		for ( var i = 0; i < this.attributeNames.length - 1; ++ i ) {

			obj = obj[ this.attributeNames[ i ] ];

		}
		return obj;

	},

	getKey: function () {

		return this.attributeNames[ this.attributeNames.length - 1 ];

	},

	setValue: function ( value ) {

		var root = this.getRootObject();
		var key = this.getKey();
		root[ key ] = value;

	},

	execute: function () {

		this.setValue( this.newValue );
		this.texture.needsUpdate = true;

		this.editor.signals.textureChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.setValue( this.oldValue );
		this.texture.needsUpdate = true;

		this.editor.signals.textureChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.texture = this.object.toJSON( output );
		output.attributeNames = this.attributeNames;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.attributeNames = json.attributeNames;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

		var loader = new THREE.ObjectLoader();
		var images = loader.parseImages( json.images );
		var textures = loader.parseTextures( [ json.texture ], images );
		for ( var i in textures ) {

			this.texture = textures[ i ];
			break;

		}

	}

};
