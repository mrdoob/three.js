/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.StandardNode = function() {

	THREE.GLNode.call( this );

	this.color = new THREE.ColorNode( 0xEEEEEE );
	this.roughness = new THREE.FloatNode( 0.5 );
	this.metalness = new THREE.FloatNode( 0.5 );

};

THREE.StandardNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.StandardNode.prototype.constructor = THREE.StandardNode;

THREE.StandardNode.prototype.build = function( builder ) {

	var material = builder.material;
	var code;

	material.define( 'PHYSICAL' );
	material.define( 'ALPHATEST', '0.0' );

	material.requestAttrib.light = true;

	if ( builder.isShader( 'vertex' ) ) {

		var transform = this.transform ? this.transform.parseAndBuildCode( builder, 'v3', 'transform' ) : undefined;

		material.mergeUniform( THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "ambient" ],
			THREE.UniformsLib[ "lights" ]

		] ) );

		material.addVertexPars( [
			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],
			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
			THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ]

		].join( "\n" ) );

		var output = [
				THREE.ShaderChunk[ "beginnormal_vertex" ],
				THREE.ShaderChunk[ "morphnormal_vertex" ],
				THREE.ShaderChunk[ "skinbase_vertex" ],
				THREE.ShaderChunk[ "skinnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],

			"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

			"	vNormal = normalize( transformedNormal );",

			"#endif",

				THREE.ShaderChunk[ "begin_vertex" ]
		];

		if ( transform ) {

			output.push(
				transform.code,
				"transformed = " + transform.result + ";"
			);

		}

		output.push(
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "project_vertex" ],
				THREE.ShaderChunk[ "logdepthbuf_vertex" ],

			"	vViewPosition = - mvPosition.xyz;",

				THREE.ShaderChunk[ "worldpos_vertex" ],
				THREE.ShaderChunk[ "shadowmap_vertex" ]
		);

		code = output.join( "\n" );

	}
	else {

		// blur textures for PBR effect

		var requires = {
			bias : new THREE.RoughnessToBlinnExponentNode(),
			offsetU : 0,
			offsetV : 0
		};

		// parse all nodes to reuse generate codes

		this.color.parse( builder );
		this.roughness.parse( builder );
		this.metalness.parse( builder );

		if ( this.alpha ) this.alpha.parse( builder );

		if ( this.light ) this.light.parse( builder, 'light' );

		if ( this.ao ) this.ao.parse( builder );
		if ( this.ambient ) this.ambient.parse( builder );
		if ( this.shadow ) this.shadow.parse( builder );
		if ( this.emissive ) this.emissive.parse( builder );

		if ( this.normal ) this.normal.parse( builder );
		if ( this.normalScale && this.normal ) this.normalScale.parse( builder );

		if ( this.environment ) this.environment.parse( builder, 'env', requires ); // isolate environment from others inputs ( see TextureNode, CubeTextureNode )

		// build code

		var color = this.color.buildCode( builder, 'c' );
		var roughness = this.roughness.buildCode( builder, 'fv1' );
		var metalness = this.metalness.buildCode( builder, 'fv1' );

		var reflectivity = this.reflectivity ? this.reflectivity.buildCode( builder, 'fv1' ) : undefined;

		var alpha = this.alpha ? this.alpha.buildCode( builder, 'fv1' ) : undefined;

		var light = this.light ? this.light.buildCode( builder, 'v3', 'light' ) : undefined;

		var ao = this.ao ? this.ao.buildCode( builder, 'fv1' ) : undefined;
		var ambient = this.ambient ? this.ambient.buildCode( builder, 'c' ) : undefined;
		var shadow = this.shadow ? this.shadow.buildCode( builder, 'c' ) : undefined;
		var emissive = this.emissive ? this.emissive.buildCode( builder, 'c' ) : undefined;

		var normal = this.normal ? this.normal.buildCode( builder, 'v3' ) : undefined;
		var normalScale = this.normalScale && this.normal ? this.normalScale.buildCode( builder, 'v2' ) : undefined;

		var environment = this.environment ? this.environment.buildCode( builder, 'c', 'env', requires ) : undefined;

		material.requestAttrib.transparent = alpha != undefined;

		material.addFragmentPars( [

			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],
			THREE.ShaderChunk[ "bsdfs" ],
			THREE.ShaderChunk[ "lights_pars" ],
			THREE.ShaderChunk[ "lights_physical_pars_fragment" ],
			THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
			THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],
		].join( "\n" ) );

		var output = [
				// prevent undeclared normal
				THREE.ShaderChunk[ "normal_flip" ],
				THREE.ShaderChunk[ "normal_fragment" ],

				// prevent undeclared material
			"	PhysicalMaterial material;",
			"	material.diffuseColor = vec3( 1.0 );",

				color.code,
			"	vec3 diffuseColor = " + color.result + ";",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",

				THREE.ShaderChunk[ "logdepthbuf_fragment" ],

			roughness.code,
			"	float roughnessFactor = " + roughness.result + ";",

			metalness.code,
			"	float metalnessFactor = " + metalness.result + ";"
		];

		if ( alpha ) {

			output.push(
				alpha.code,
				'if ( ' + alpha.result + ' <= ALPHATEST ) discard;'
			);

		}

		if ( normal ) {

			builder.include( 'perturbNormal2Arb' );

			output.push( normal.code );

			if ( normalScale ) output.push( normalScale.code );

			output.push(
				'normal = perturbNormal2Arb(-vViewPosition,normal,' +
				normal.result + ',' +
				new THREE.UVNode().build( builder, 'v2' ) + ',' +
				( normalScale ? normalScale.result : 'vec2( 1.0 )' ) + ');'
			);

		}

		// optimization for now

		output.push( 'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor * (1.0 - metalnessFactor)' ) + ';' );

		output.push(
			// accumulation
			'material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );' // disney's remapping of [ 0, 1 ] roughness to [ 0.001, 1 ]
		);

		if ( reflectivity ) {

			output.push(
				'material.specularColor = mix( vec3( 0.16 * pow2( ' + reflectivity.builder( builder, 'fv1' ) + ' ) ), diffuseColor, metalnessFactor );'
			);

		}
		else {

			output.push(
				'material.specularColor = mix( vec3( 0.04 ), diffuseColor, metalnessFactor );'
			);

		}

		output.push(
			THREE.ShaderChunk[ "lights_template" ]
		);

		if ( light ) {

			output.push(
				light.code,
				"reflectedLight.directDiffuse = " + light.result + ";"
			);

			// apply color

			output.push(
				"diffuseColor *= 1.0 - metalnessFactor;",

				"reflectedLight.directDiffuse *= diffuseColor;",
				"reflectedLight.indirectDiffuse *= diffuseColor;"
			);

		}

		if ( ao ) {

			output.push(
				ao.code,
				"reflectedLight.indirectDiffuse *= " + ao.result + ";"
			);

		}

		if ( ambient ) {

			output.push(
				ambient.code,
				"reflectedLight.indirectDiffuse += " + ambient.result + ";"
			);

		}

		if ( shadow ) {

			output.push(
				shadow.code,
				"reflectedLight.directDiffuse *= " + shadow.result + ";",
				"reflectedLight.directSpecular *= " + shadow.result + ";"
			);

		}

		if ( emissive ) {

			output.push(
				emissive.code,
				"reflectedLight.directDiffuse += " + emissive.result + ";"
			);

		}

		if ( environment ) {

			output.push(
				environment.code,
				"RE_IndirectSpecular(" + environment.result + ", geometry, material, reflectedLight );"
			);

		}

		output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;" );

		output.push(
			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
			THREE.ShaderChunk[ "fog_fragment" ]
		);

		if ( alpha ) {

			output.push( "gl_FragColor = vec4( outgoingLight, " + alpha.result + " );" );

		}
		else {

			output.push( "gl_FragColor = vec4( outgoingLight, 1.0 );" );

		}

		code = output.join( "\n" );

	}

	return code;

};
