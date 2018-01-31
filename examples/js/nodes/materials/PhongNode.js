/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.PhongNode = function () {

	THREE.GLNode.call( this );

	this.color = new THREE.ColorNode( 0xEEEEEE );
	this.specular = new THREE.ColorNode( 0x111111 );
	this.shininess = new THREE.FloatNode( 30 );

};

THREE.PhongNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.PhongNode.prototype.constructor = THREE.PhongNode;
THREE.PhongNode.prototype.nodeType = "Phong";

THREE.PhongNode.prototype.build = function ( builder ) {

	var material = builder.material;
	var code;

	material.define( 'PHONG' );
	material.define( 'ALPHATEST', '0.0' );

	material.requires.lights = true;

	if ( builder.isShader( 'vertex' ) ) {

		var transform = this.transform ? this.transform.parseAndBuildCode( builder, 'v3', { cache: 'transform' } ) : undefined;

		material.mergeUniform( THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ]

		] ) );

		material.addVertexPars( [
			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			"#include <common>",
			"#include <fog_pars_vertex>",
			"#include <morphtarget_pars_vertex>",
			"#include <skinning_pars_vertex>",
			"#include <shadowmap_pars_vertex>",
			"#include <logdepthbuf_pars_vertex>"
		].join( "\n" ) );

		var output = [
			"#include <beginnormal_vertex>",
			"#include <morphnormal_vertex>",
			"#include <skinbase_vertex>",
			"#include <skinnormal_vertex>",
			"#include <defaultnormal_vertex>",

			"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

			"	vNormal = normalize( transformedNormal );",

			"#endif",

			"#include <begin_vertex>"
		];

		if ( transform ) {

			output.push(
				transform.code,
				"transformed = " + transform.result + ";"
			);

		}

		output.push(
			"	#include <morphtarget_vertex>",
			"	#include <skinning_vertex>",
			"	#include <project_vertex>",
			"	#include <fog_vertex>",
			"	#include <logdepthbuf_vertex>",

			"	vViewPosition = - mvPosition.xyz;",

			"	#include <worldpos_vertex>",
			"	#include <shadowmap_vertex>"
		);

		code = output.join( "\n" );

	} else {

		// parse all nodes to reuse generate codes

		this.color.parse( builder, { slot: 'color' } );
		this.specular.parse( builder );
		this.shininess.parse( builder );

		if ( this.alpha ) this.alpha.parse( builder );

		if ( this.normal ) this.normal.parse( builder );
		if ( this.normalScale && this.normal ) this.normalScale.parse( builder );

		if ( this.light ) this.light.parse( builder, { cache: 'light' } );

		if ( this.ao ) this.ao.parse( builder );
		if ( this.ambient ) this.ambient.parse( builder );
		if ( this.shadow ) this.shadow.parse( builder );
		if ( this.emissive ) this.emissive.parse( builder, { slot: 'emissive' } );

		if ( this.environment ) this.environment.parse( builder, { slot: 'environment' } );
		if ( this.environmentAlpha && this.environment ) this.environmentAlpha.parse( builder );

		// build code

		var color = this.color.buildCode( builder, 'c', { slot: 'color' } );
		var specular = this.specular.buildCode( builder, 'c' );
		var shininess = this.shininess.buildCode( builder, 'fv1' );

		var alpha = this.alpha ? this.alpha.buildCode( builder, 'fv1' ) : undefined;

		var normal = this.normal ? this.normal.buildCode( builder, 'v3' ) : undefined;
		var normalScale = this.normalScale && this.normal ? this.normalScale.buildCode( builder, 'v2' ) : undefined;

		var light = this.light ? this.light.buildCode( builder, 'v3', { cache: 'light' } ) : undefined;

		var ao = this.ao ? this.ao.buildCode( builder, 'fv1' ) : undefined;
		var ambient = this.ambient ? this.ambient.buildCode( builder, 'c' ) : undefined;
		var shadow = this.shadow ? this.shadow.buildCode( builder, 'c' ) : undefined;
		var emissive = this.emissive ? this.emissive.buildCode( builder, 'c', { slot: 'emissive' } ) : undefined;

		var environment = this.environment ? this.environment.buildCode( builder, 'c', { slot: 'environment' } ) : undefined;
		var environmentAlpha = this.environmentAlpha && this.environment ? this.environmentAlpha.buildCode( builder, 'fv1' ) : undefined;

		material.requires.transparent = alpha != undefined;

		material.addFragmentPars( [
			"#include <common>",
			"#include <fog_pars_fragment>",
			"#include <bsdfs>",
			"#include <lights_pars>",
			"#include <lights_phong_pars_fragment>",
			"#include <shadowmap_pars_fragment>",
			"#include <logdepthbuf_pars_fragment>"
		].join( "\n" ) );

		var output = [
			// prevent undeclared normal
			"#include <normal_fragment>",

			// prevent undeclared material
			"	BlinnPhongMaterial material;",

			color.code,
			"	vec3 diffuseColor = " + color.result + ";",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",

			"#include <logdepthbuf_fragment>",

			specular.code,
			"	vec3 specular = " + specular.result + ";",

			shininess.code,
			"	float shininess = max(0.0001," + shininess.result + ");",

			"	float specularStrength = 1.0;" // Ignored in MaterialNode ( replace to specular )
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

		output.push( 'material.diffuseColor = ' + ( light ? 'vec3( 1.0 )' : 'diffuseColor' ) + ';' );

		output.push(
			// accumulation
			'material.specularColor = specular;',
			'material.specularShininess = shininess;',
			'material.specularStrength = specularStrength;',

			"#include <lights_template>"
		);

		if ( light ) {

			output.push(
				light.code,
				"reflectedLight.directDiffuse = " + light.result + ";"
			);

			// apply color

			output.push(
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

		output.push( "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular;" );

		if ( environment ) {

			output.push( environment.code );

			if ( environmentAlpha ) {

				output.push(
					environmentAlpha.code,
					"outgoingLight = mix( outgoingLight, " + environment.result + ", " + environmentAlpha.result + " );"
				);

			} else {

				output.push( "outgoingLight = " + environment.result + ";" );

			}

		}

		if ( alpha ) {

			output.push( "gl_FragColor = vec4( outgoingLight, " + alpha.result + " );" );

		} else {

			output.push( "gl_FragColor = vec4( outgoingLight, 1.0 );" );

		}

		output.push(
			"#include <premultiplied_alpha_fragment>",
			"#include <tonemapping_fragment>",
			"#include <encodings_fragment>",
			"#include <fog_fragment>"
		);

		code = output.join( "\n" );

	}

	return code;

};


THREE.PhongNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		// vertex

		if ( this.transform ) data.transform = this.transform.toJSON( meta ).uuid;

		// fragment

		data.color = this.color.toJSON( meta ).uuid;
		data.specular = this.specular.toJSON( meta ).uuid;
		data.shininess = this.shininess.toJSON( meta ).uuid;

		if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;

		if ( this.normal ) data.normal = this.normal.toJSON( meta ).uuid;
		if ( this.normalScale ) data.normalScale = this.normalScale.toJSON( meta ).uuid;

		if ( this.light ) data.light = this.light.toJSON( meta ).uuid;

		if ( this.ao ) data.ao = this.ao.toJSON( meta ).uuid;
		if ( this.ambient ) data.ambient = this.ambient.toJSON( meta ).uuid;
		if ( this.shadow ) data.shadow = this.shadow.toJSON( meta ).uuid;
		if ( this.emissive ) data.emissive = this.emissive.toJSON( meta ).uuid;

		if ( this.environment ) data.environment = this.environment.toJSON( meta ).uuid;
		if ( this.environmentAlpha ) data.environmentAlpha = this.environmentAlpha.toJSON( meta ).uuid;

	}

	return data;

};
