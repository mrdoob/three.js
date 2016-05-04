/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Material = function () {

	Object.defineProperty( this, 'id', { value: THREE.MaterialIdCount ++ } );

	this.uuid = THREE.Math.generateUUID();

	this.name = '';
	this.type = 'Material';

	this.fog = true;
	this.lights = true;

	this.blending = THREE.NormalBlending;
	this.side = THREE.FrontSide;
	this.shading = THREE.SmoothShading; // THREE.FlatShading, THREE.SmoothShading
	this.vertexColors = THREE.NoColors; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

	this.opacity = 1;
	this.transparent = false;

	this.blendSrc = THREE.SrcAlphaFactor;
	this.blendDst = THREE.OneMinusSrcAlphaFactor;
	this.blendEquation = THREE.AddEquation;
	this.blendSrcAlpha = null;
	this.blendDstAlpha = null;
	this.blendEquationAlpha = null;

	this.depthFunc = THREE.LessEqualDepth;
	this.depthTest = true;
	this.depthWrite = true;

	this.clippingPlanes = null;
	this.clipShadows = false;

	this.colorWrite = true;

	this.precision = null; // override the renderer's default precision for this material

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;
	this.premultipliedAlpha = false;

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this._needsUpdate = true;

};

THREE.Material.prototype = {

	constructor: THREE.Material,

	get needsUpdate() {

		return this._needsUpdate;

	},

	set needsUpdate( value ) {

		if ( value === true ) this.update();
		this._needsUpdate = value;

	},

	setValues: function ( values ) {

		if ( values === undefined ) return;

		for ( var key in values ) {

			var newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( "THREE.Material: '" + key + "' parameter is undefined." );
				continue;

			}

			var currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( "THREE." + this.type + ": '" + key + "' is not a property of this material." );
				continue;

			}

			if ( currentValue instanceof THREE.Color ) {

				currentValue.set( newValue );

			} else if ( currentValue instanceof THREE.Vector3 && newValue instanceof THREE.Vector3 ) {

				currentValue.copy( newValue );

			} else if ( key === 'overdraw' ) {

				// ensure overdraw is backwards-compatible with legacy boolean type
				this[ key ] = Number( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	},

	toJSON: function ( meta ) {

		var isRoot = meta === undefined;

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {}
			};

		}

		var data = {
			metadata: {
				version: 4.4,
				type: 'Material',
				generator: 'Material.toJSON'
			}
		};

		// standard Material serialization
		data.uuid = this.uuid;
		data.type = this.type;

		if ( this.name !== '' ) data.name = this.name;

		if ( this.color instanceof THREE.Color ) data.color = this.color.getHex();

		if ( this.roughness !== 0.5 ) data.roughness = this.roughness;
		if ( this.metalness !== 0.5 ) data.metalness = this.metalness;

		if ( this.emissive instanceof THREE.Color ) data.emissive = this.emissive.getHex();
		if ( this.specular instanceof THREE.Color ) data.specular = this.specular.getHex();
		if ( this.shininess !== undefined ) data.shininess = this.shininess;

		if ( this.map instanceof THREE.Texture ) data.map = this.map.toJSON( meta ).uuid;
		if ( this.alphaMap instanceof THREE.Texture ) data.alphaMap = this.alphaMap.toJSON( meta ).uuid;
		if ( this.lightMap instanceof THREE.Texture ) data.lightMap = this.lightMap.toJSON( meta ).uuid;
		if ( this.bumpMap instanceof THREE.Texture ) {

			data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
			data.bumpScale = this.bumpScale;

		}
		if ( this.normalMap instanceof THREE.Texture ) {

			data.normalMap = this.normalMap.toJSON( meta ).uuid;
			data.normalScale = this.normalScale.toArray();

		}
		if ( this.displacementMap instanceof THREE.Texture ) {

			data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;

		}
		if ( this.roughnessMap instanceof THREE.Texture ) data.roughnessMap = this.roughnessMap.toJSON( meta ).uuid;
		if ( this.metalnessMap instanceof THREE.Texture ) data.metalnessMap = this.metalnessMap.toJSON( meta ).uuid;

		if ( this.emissiveMap instanceof THREE.Texture ) data.emissiveMap = this.emissiveMap.toJSON( meta ).uuid;
		if ( this.specularMap instanceof THREE.Texture ) data.specularMap = this.specularMap.toJSON( meta ).uuid;

		if ( this.envMap instanceof THREE.Texture ) {

			data.envMap = this.envMap.toJSON( meta ).uuid;
			data.reflectivity = this.reflectivity; // Scale behind envMap

		}

		if ( this.size !== undefined ) data.size = this.size;
		if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

		if ( this.blending !== THREE.NormalBlending ) data.blending = this.blending;
		if ( this.shading !== THREE.SmoothShading ) data.shading = this.shading;
		if ( this.side !== THREE.FrontSide ) data.side = this.side;
		if ( this.vertexColors !== THREE.NoColors ) data.vertexColors = this.vertexColors;

		if ( this.opacity < 1 ) data.opacity = this.opacity;
		if ( this.transparent === true ) data.transparent = this.transparent;
		if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
		if ( this.premultipliedAlpha === true ) data.premultipliedAlpha = this.premultipliedAlpha;
		if ( this.wireframe === true ) data.wireframe = this.wireframe;
		if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;

		// TODO: Copied from Object3D.toJSON

		function extractFromCache ( cache ) {

			var values = [];

			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;

		}

		return data;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.name = source.name;

		this.fog = source.fog;
		this.lights = source.lights;

		this.blending = source.blending;
		this.side = source.side;
		this.vertexColors = source.vertexColors;

		this.opacity = source.opacity;
		this.transparent = source.transparent;

		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;

		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;

		this.colorWrite = source.colorWrite;

		this.precision = source.precision;

		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;

		this.alphaTest = source.alphaTest;

		this.premultipliedAlpha = source.premultipliedAlpha;

		this.overdraw = source.overdraw;

		this.visible = source.visible;
		this.clipShadows = source.clipShadows;

		var srcPlanes = source.clippingPlanes,
			dstPlanes = null;

		if ( srcPlanes !== null ) {

			var n = srcPlanes.length;
			dstPlanes = new Array( n );

			for ( var i = 0; i !== n; ++ i )
				dstPlanes[ i ] = srcPlanes[ i ].clone();

		}

		this.clippingPlanes = dstPlanes;

		return this;

	},

	update: function () {

		this.dispatchEvent( { type: 'update' } );

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

Object.assign( THREE.Material.prototype, THREE.EventDispatcher.prototype );

THREE.MaterialIdCount = 0;
