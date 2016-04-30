/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Material = function ( parameters ) {

	THREE.Asset.call( this );
	this._needsUpdate = true;

	if ( parameters !== undefined ) this.setValues( parameters );

};

THREE.Asset.assignPrototype( THREE.Material, THREE.Asset, {

	type: 'Material',
	AssetCategory: 'materials',

	DefaultState: {

		fog: true,
		lights: true,

		blending: THREE.NormalBlending,
		side: THREE.FrontSide,
		shading: THREE.SmoothShading, // THREE.FlatShading, THREE.SmoothShading
		vertexColors: THREE.NoColors, // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

		opacity: 1,
		transparent: false,

		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,
		blendEquation: THREE.AddEquation,
		blendSrcAlpha: null,
		blendDstAlpha: null,
		blendEquationAlpha: null,

		depthFunc: THREE.LessEqualDepth,
		depthTest: true,
		depthWrite: true,

		clippingPlanes: null,
		clipShadows: false,

		colorWrite: true,

		precision: null, // override the renderer's default precision for this material

		polygonOffset: false,
		polygonOffsetFactor: 0,
		polygonOffsetUnits: 0,

		alphaTest: 0,
		premultipliedAlpha: false,

		overdraw: 0, // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

		visible: true

	},

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

	update: function () {

		this.dispatchEvent( { type: 'update' } );

	}

};
