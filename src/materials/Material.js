/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = Material;

var Constants = require( "../Constants" ),
	EventDispatcher = require( "../core/EventDispatcher" ),
	Color = require( "../math/Color" ),
	_Math = require( "../math/Math" ),
	Vector3 = require( "../math/Vector3" ),
	Texture = require( "../textures/Texture" );

function Material() {

	Object.defineProperty( this, "id", { value: Material.IdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = "";
	this.type = "Material";

	this.side = Constants.FrontSide;

	this.opacity = 1;
	this.transparent = false;

	this.blending = Constants.NormalBlending;

	this.blendSrc = Constants.SrcAlphaFactor;
	this.blendDst = Constants.OneMinusSrcAlphaFactor;
	this.blendEquation = Constants.AddEquation;
	this.blendSrcAlpha = null;
	this.blendDstAlpha = null;
	this.blendEquationAlpha = null;

	this.depthFunc = Constants.LessEqualDepth;
	this.depthTest = true;
	this.depthWrite = true;

	this.colorWrite = true;

	this.precision = null; // override the renderer's default precision for this material

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this._needsUpdate = true;

}

Material.prototype = {

	constructor: Material,

	get needsUpdate () {

		return this._needsUpdate;

	},

	set needsUpdate ( value ) {

		if ( value === true ) { this.update(); }

		this._needsUpdate = value;

	},

	setValues: function ( values ) {

		if ( values === undefined ) { return; }

		var newValue, currentValue, key;

		for ( key in values ) {

			newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "Material: \"" + key + "\" parameter is undefined." );
				continue;

			}

			currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( this.type + ": \"" + key + "\" is not a property of this material." );
				continue;

			}

			if ( currentValue instanceof Color ) {

				currentValue.set( newValue );

			} else if ( currentValue instanceof Vector3 && newValue instanceof Vector3 ) {

				currentValue.copy( newValue );

			} else if ( key === "overdraw" ) {

				// ensure overdraw is backwards-compatible with legacy boolean type
				this[ key ] = Number( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	},

	toJSON: function ( meta ) {

		var data = {
			metadata: {
				version: 4.4,
				type: "Material",
				generator: "Material.toJSON"
			}
		};

		// standard Material serialization
		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== "" ) { data.name = this.name; }

		if ( this.color instanceof Color ) { data.color = this.color.getHex(); }
		if ( this.emissive instanceof Color ) { data.emissive = this.emissive.getHex(); }
		if ( this.specular instanceof Color ) { data.specular = this.specular.getHex(); }
		if ( this.shininess !== undefined ) { data.shininess = this.shininess; }

		if ( this.map instanceof Texture ) { data.map = this.map.toJSON( meta ).uuid; }
		if ( this.alphaMap instanceof Texture ) { data.alphaMap = this.alphaMap.toJSON( meta ).uuid; }
		if ( this.lightMap instanceof Texture ) { data.lightMap = this.lightMap.toJSON( meta ).uuid; }
		if ( this.bumpMap instanceof Texture ) {

			data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
			data.bumpScale = this.bumpScale;

		}
		if ( this.normalMap instanceof Texture ) {

			data.normalMap = this.normalMap.toJSON( meta ).uuid;
			data.normalScale = this.normalScale; // Removed for now, causes issue in editor ui.js

		}
		if ( this.displacementMap instanceof Texture ) {

			data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;

		}
		if ( this.specularMap instanceof Texture ) { data.specularMap = this.specularMap.toJSON( meta ).uuid; }
		if ( this.envMap instanceof Texture ) {

			data.envMap = this.envMap.toJSON( meta ).uuid;
			data.reflectivity = this.reflectivity; // Scale behind envMap

		}

		if ( this.size !== undefined ) { data.size = this.size; }
		if ( this.sizeAttenuation !== undefined ) { data.sizeAttenuation = this.sizeAttenuation; }

		if ( this.vertexColors !== undefined && this.vertexColors !== Constants.NoColors ) { data.vertexColors = this.vertexColors; }
		if ( this.shading !== undefined && this.shading !== Constants.SmoothShading ) { data.shading = this.shading; }
		if ( this.blending !== undefined && this.blending !== Constants.NormalBlending ) { data.blending = this.blending; }
		if ( this.side !== undefined && this.side !== Constants.FrontSide ) { data.side = this.side; }

		if ( this.opacity < 1 ) { data.opacity = this.opacity; }
		if ( this.transparent === true ) { data.transparent = this.transparent; }
		if ( this.alphaTest > 0 ) { data.alphaTest = this.alphaTest; }
		if ( this.wireframe === true ) { data.wireframe = this.wireframe; }
		if ( this.wireframeLinewidth > 1 ) { data.wireframeLinewidth = this.wireframeLinewidth; }

		return data;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.name = source.name;

		this.side = source.side;

		this.opacity = source.opacity;
		this.transparent = source.transparent;

		this.blending = source.blending;

		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;

		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;

		this.precision = source.precision;

		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;

		this.alphaTest = source.alphaTest;

		this.overdraw = source.overdraw;

		this.visible = source.visible;

		return this;

	},

	update: function () {

		this.dispatchEvent( { type: "update" } );

	},

	dispose: function () {

		this.dispatchEvent( { type: "dispose" } );

	}

};

EventDispatcher.prototype.apply( Material.prototype );

Material.IdCount = 0;
