/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  defines: { "label" : "value" },
 *  uniforms: { "parameter1": { type: "1f", value: 1.0 }, "parameter2": { type: "1i" value2: 2 } },
 *
 *  fragmentShader: <string>,
 *  vertexShader: <string>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  lights: <bool>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */

THREE.ShaderMaterial = function ( parameters ) {

	if ( parameters !== undefined ) {

		if ( parameters.attributes !== undefined ) {

			console.error( 'THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.' );

		}

	}

	THREE.Material.call( this, parameters );
	this.index0AttributeName: undefined; // TODO: really transient?

};

THREE.Asset.assignPrototype( THREE.ShaderMaterial, THREE.Material, {

	type: 'ShaderMaterial',

	DefaultState: {

		defines: {},
		uniforms: {},

		this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
		this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';

		linewidth: 1,

		wireframe: false,
		wireframeLinewidth: 1,

		fog: false, // set to use scene fog
		lights: false, // set to use scene lights
		clipping: false, // set to use user-defined clipping planes

		skinning: false, // set to use skinning attribute streams
		morphTargets: false, // set to use morph targets
		morphNormals: false, // set to use morph normals

		this.extensions = {
			derivatives: false, // set to use derivatives
			fragDepth: false, // set to use fragment depth values
			drawBuffers: false, // set to use draw buffers
			shaderTextureLOD: false // set to use shader texture LOD
		},

		// When rendered geometry doesn't include these attributes but the material does,
		// use these default values in WebGL. This avoids errors when buffer data is missing.
		this.defaultAttributeValues = {
			'color': [ 1, 1, 1 ],
			'uv': [ 0, 0 ],
			'uv2': [ 0, 0 ]
		}

	},

	copy: function ( source ) {

		THREE.Material.prototype.copy.call( this, source );
		this.uniforms = THREE.UniformsUtils.clone( source.uniforms ); // TODO make this unnecessray

	}

} );
