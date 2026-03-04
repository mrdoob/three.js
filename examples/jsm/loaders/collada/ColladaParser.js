import {
	Color,
	ColorManagement,
	MathUtils,
	Matrix4,
	Vector3,
	SRGBColorSpace
} from 'three';

/**
 * Utility functions for parsing
 */

function getElementsByTagName( xml, name ) {

	// Non recursive xml.getElementsByTagName() ...

	const array = [];
	const childNodes = xml.childNodes;

	for ( let i = 0, l = childNodes.length; i < l; i ++ ) {

		const child = childNodes[ i ];

		if ( child.nodeName === name ) {

			array.push( child );

		}

	}

	return array;

}

function parseStrings( text ) {

	if ( text.length === 0 ) return [];

	return text.trim().split( /\s+/ );

}

function parseFloats( text ) {

	if ( text.length === 0 ) return [];

	return text.trim().split( /\s+/ ).map( parseFloat );

}

function parseInts( text ) {

	if ( text.length === 0 ) return [];

	return text.trim().split( /\s+/ ).map( s => parseInt( s ) );

}

function parseId( text ) {

	return text.substring( 1 );

}

/**
 * ColladaParser handles XML parsing and converts Collada XML to intermediate data structures.
 */
class ColladaParser {

	constructor() {

		this.count = 0;

	}

	generateId() {

		return 'three_default_' + ( this.count ++ );

	}

	parse( text ) {

		if ( text.length === 0 ) {

			return null;

		}

		const xml = new DOMParser().parseFromString( text, 'application/xml' );

		const collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		const parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
		if ( parserError !== undefined ) {

			// Chrome will return parser error with a div in it

			const errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
			let errorText;

			if ( errorElement ) {

				errorText = errorElement.textContent;

			} else {

				errorText = this.parserErrorToText( parserError );

			}

			console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

			return null;

		}

		// metadata

		const version = collada.getAttribute( 'version' );
		console.debug( 'THREE.ColladaLoader: File version', version );

		const asset = this.parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );

		//

		const library = {
			animations: {},
			clips: {},
			controllers: {},
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {},
			kinematicsModels: {},
			physicsModels: {},
			kinematicsScenes: {}
		};

		this.library = library;
		this.collada = collada;

		this.parseLibrary( collada, 'library_animations', 'animation', this.parseAnimation.bind( this ) );
		this.parseLibrary( collada, 'library_animation_clips', 'animation_clip', this.parseAnimationClip.bind( this ) );
		this.parseLibrary( collada, 'library_controllers', 'controller', this.parseController.bind( this ) );
		this.parseLibrary( collada, 'library_images', 'image', this.parseImage.bind( this ) );
		this.parseLibrary( collada, 'library_effects', 'effect', this.parseEffect.bind( this ) );
		this.parseLibrary( collada, 'library_materials', 'material', this.parseMaterial.bind( this ) );
		this.parseLibrary( collada, 'library_cameras', 'camera', this.parseCamera.bind( this ) );
		this.parseLibrary( collada, 'library_lights', 'light', this.parseLight.bind( this ) );
		this.parseLibrary( collada, 'library_geometries', 'geometry', this.parseGeometry.bind( this ) );
		this.parseLibrary( collada, 'library_nodes', 'node', this.parseNode.bind( this ) );
		this.parseLibrary( collada, 'library_visual_scenes', 'visual_scene', this.parseVisualScene.bind( this ) );
		this.parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', this.parseKinematicsModel.bind( this ) );
		this.parseLibrary( collada, 'library_physics_models', 'physics_model', this.parsePhysicsModel.bind( this ) );
		this.parseLibrary( collada, 'scene', 'instance_kinematics_scene', this.parseKinematicsScene.bind( this ) );

		return {
			library: library,
			asset: asset,
			collada: collada
		};

	}

	// convert the parser error element into text with each child elements text
	// separated by new lines.

	parserErrorToText( parserError ) {

		const parts = [];
		const stack = [ parserError ];

		while ( stack.length ) {

			const node = stack.shift();

			if ( node.nodeType === Node.TEXT_NODE ) {

				parts.push( node.textContent );

			} else {

				parts.push( '\n' );
				stack.push( ...node.childNodes );

			}

		}

		return parts.join( '' ).trim();

	}

	// asset

	parseAsset( xml ) {

		return {
			unit: this.parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
			upAxis: this.parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
		};

	}

	parseAssetUnit( xml ) {

		if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

			return parseFloat( xml.getAttribute( 'meter' ) );

		} else {

			return 1; // default 1 meter

		}

	}

	parseAssetUpAxis( xml ) {

		return xml !== undefined ? xml.textContent : 'Y_UP';

	}

	// library

	parseLibrary( xml, libraryName, nodeName, parser ) {

		const library = getElementsByTagName( xml, libraryName )[ 0 ];

		if ( library !== undefined ) {

			const elements = getElementsByTagName( library, nodeName );

			for ( let i = 0; i < elements.length; i ++ ) {

				parser( elements[ i ] );

			}

		}

	}

	// animation

	parseAnimation( xml ) {

		const data = {
			sources: {},
			samplers: {},
			channels: {}
		};

		let hasChildren = false;

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			let id;

			switch ( child.nodeName ) {

				case 'source':
					id = child.getAttribute( 'id' );
					data.sources[ id ] = this.parseSource( child );
					break;

				case 'sampler':
					id = child.getAttribute( 'id' );
					data.samplers[ id ] = this.parseAnimationSampler( child );
					break;

				case 'channel':
					id = child.getAttribute( 'target' );
					data.channels[ id ] = this.parseAnimationChannel( child );
					break;

				case 'animation':
					// hierarchy of related animations
					this.parseAnimation( child );
					hasChildren = true;
					break;

				default:

			}

		}

		if ( hasChildren === false ) {

			// since 'id' attributes can be optional, it's necessary to generate a UUID for unique assignment

			this.library.animations[ xml.getAttribute( 'id' ) || MathUtils.generateUUID() ] = data;

		}

	}

	parseAnimationSampler( xml ) {

		const data = {
			inputs: {},
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':
					const id = parseId( child.getAttribute( 'source' ) );
					const semantic = child.getAttribute( 'semantic' );
					data.inputs[ semantic ] = id;
					break;

			}

		}

		return data;

	}

	parseAnimationChannel( xml ) {

		const data = {};

		const target = xml.getAttribute( 'target' );

		// parsing SID Addressing Syntax

		let parts = target.split( '/' );

		const id = parts.shift();
		let sid = parts.shift();

		// check selection syntax

		const arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
		const memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

		if ( memberSyntax ) {

			//  member selection access

			parts = sid.split( '.' );
			sid = parts.shift();
			data.member = parts.shift();

		} else if ( arraySyntax ) {

			// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

			const indices = sid.split( '(' );
			sid = indices.shift();

			for ( let i = 0; i < indices.length; i ++ ) {

				indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

			}

			data.indices = indices;

		}

		data.id = id;
		data.sid = sid;

		data.arraySyntax = arraySyntax;
		data.memberSyntax = memberSyntax;

		data.sampler = parseId( xml.getAttribute( 'source' ) );

		return data;

	}

	// animation clips

	parseAnimationClip( xml ) {

		const data = {
			name: xml.getAttribute( 'id' ) || 'default',
			start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
			end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
			animations: []
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'instance_animation':
					data.animations.push( parseId( child.getAttribute( 'url' ) ) );
					break;

			}

		}

		this.library.clips[ xml.getAttribute( 'id' ) ] = data;

	}

	// controller

	parseController( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skin':
					// there is exactly one skin per controller
					data.id = parseId( child.getAttribute( 'source' ) );
					data.skin = this.parseSkin( child );
					break;

				case 'morph':
					data.id = parseId( child.getAttribute( 'source' ) );
					console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
					break;

			}

		}

		this.library.controllers[ xml.getAttribute( 'id' ) ] = data;

	}

	parseSkin( xml ) {

		const data = {
			sources: {}
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':
					data.bindShapeMatrix = parseFloats( child.textContent );
					break;

				case 'source':
					const id = child.getAttribute( 'id' );
					data.sources[ id ] = this.parseSource( child );
					break;

				case 'joints':
					data.joints = this.parseJoints( child );
					break;

				case 'vertex_weights':
					data.vertexWeights = this.parseVertexWeights( child );
					break;

			}

		}

		return data;

	}

	parseJoints( xml ) {

		const data = {
			inputs: {}
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':
					const semantic = child.getAttribute( 'semantic' );
					const id = parseId( child.getAttribute( 'source' ) );
					data.inputs[ semantic ] = id;
					break;

			}

		}

		return data;

	}

	parseVertexWeights( xml ) {

		const data = {
			inputs: {}
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':
					const semantic = child.getAttribute( 'semantic' );
					const id = parseId( child.getAttribute( 'source' ) );
					const offset = parseInt( child.getAttribute( 'offset' ) );
					data.inputs[ semantic ] = { id: id, offset: offset };
					break;

				case 'vcount':
					data.vcount = parseInts( child.textContent );
					break;

				case 'v':
					data.v = parseInts( child.textContent );
					break;

			}

		}

		return data;

	}

	// image

	parseImage( xml ) {

		const data = {
			init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
		};

		this.library.images[ xml.getAttribute( 'id' ) ] = data;

	}

	// effect

	parseEffect( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':
					data.profile = this.parseEffectProfileCOMMON( child );
					break;

			}

		}

		this.library.effects[ xml.getAttribute( 'id' ) ] = data;

	}

	parseEffectProfileCOMMON( xml ) {

		const data = {
			surfaces: {},
			samplers: {}
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'newparam':
					this.parseEffectNewparam( child, data );
					break;

				case 'technique':
					data.technique = this.parseEffectTechnique( child );
					break;

				case 'extra':
					data.extra = this.parseEffectExtra( child );
					break;

			}

		}

		return data;

	}

	parseEffectNewparam( xml, data ) {

		const sid = xml.getAttribute( 'sid' );

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':
					data.surfaces[ sid ] = this.parseEffectSurface( child );
					break;

				case 'sampler2D':
					data.samplers[ sid ] = this.parseEffectSampler( child );
					break;

			}

		}

	}

	parseEffectSurface( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':
					data.init_from = child.textContent;
					break;

			}

		}

		return data;

	}

	parseEffectSampler( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':
					data.source = child.textContent;
					break;

			}

		}

		return data;

	}

	parseEffectTechnique( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':
					data.type = child.nodeName;
					data.parameters = this.parseEffectParameters( child );
					break;

				case 'extra':
					data.extra = this.parseEffectExtra( child );
					break;

			}

		}

		return data;

	}

	parseEffectParameters( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'ambient':
				case 'shininess':
				case 'transparency':
					data[ child.nodeName ] = this.parseEffectParameter( child );
					break;
				case 'transparent':
					data[ child.nodeName ] = {
						opaque: child.hasAttribute( 'opaque' ) ? child.getAttribute( 'opaque' ) : 'A_ONE',
						data: this.parseEffectParameter( child )
					};
					break;

			}

		}

		return data;

	}

	parseEffectParameter( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':
					data[ child.nodeName ] = parseFloats( child.textContent );
					break;

				case 'float':
					data[ child.nodeName ] = parseFloat( child.textContent );
					break;

				case 'texture':
					data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: this.parseEffectParameterTexture( child ) };
					break;

			}

		}

		return data;

	}

	parseEffectParameterTexture( xml ) {

		const data = {
			technique: {}
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'extra':
					this.parseEffectParameterTextureExtra( child, data );
					break;

			}

		}

		return data;

	}

	parseEffectParameterTextureExtra( xml, data ) {

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseEffectParameterTextureExtraTechnique( child, data );
					break;

			}

		}

	}

	parseEffectParameterTextureExtraTechnique( xml, data ) {

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'repeatU':
				case 'repeatV':
				case 'offsetU':
				case 'offsetV':
					data.technique[ child.nodeName ] = parseFloat( child.textContent );
					break;

				case 'wrapU':
				case 'wrapV':

					// some files have values for wrapU/wrapV which become NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						data.technique[ child.nodeName ] = 1;

					} else if ( child.textContent.toUpperCase() === 'FALSE' ) {

						data.technique[ child.nodeName ] = 0;

					} else {

						data.technique[ child.nodeName ] = parseInt( child.textContent );

					}

					break;

				case 'bump':
					data[ child.nodeName ] = this.parseEffectExtraTechniqueBump( child );
					break;

			}

		}

	}

	parseEffectExtra( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					data.technique = this.parseEffectExtraTechnique( child );
					break;

			}

		}

		return data;

	}

	parseEffectExtraTechnique( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'double_sided':
					data[ child.nodeName ] = parseInt( child.textContent );
					break;

				case 'bump':
					data[ child.nodeName ] = this.parseEffectExtraTechniqueBump( child );
					break;

			}

		}

		return data;

	}

	parseEffectExtraTechniqueBump( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'texture':
					data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), texcoord: child.getAttribute( 'texcoord' ), extra: this.parseEffectParameterTexture( child ) };
					break;

			}

		}

		return data;

	}

	// material

	parseMaterial( xml ) {

		const data = {
			name: xml.getAttribute( 'name' )
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'instance_effect':
					data.url = parseId( child.getAttribute( 'url' ) );
					break;

			}

		}

		this.library.materials[ xml.getAttribute( 'id' ) ] = data;

	}

	// camera

	parseCamera( xml ) {

		const data = {
			name: xml.getAttribute( 'name' )
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':
					data.optics = this.parseCameraOptics( child );
					break;

			}

		}

		this.library.cameras[ xml.getAttribute( 'id' ) ] = data;

	}

	parseCameraOptics( xml ) {

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'technique_common':
					return this.parseCameraTechnique( child );

			}

		}

		return {};

	}

	parseCameraTechnique( xml ) {

		const data = {};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'perspective':
				case 'orthographic':

					data.technique = child.nodeName;
					data.parameters = this.parseCameraParameters( child );

					break;

			}

		}

		return data;

	}

	parseCameraParameters( xml ) {

		const data = {};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'xfov':
				case 'yfov':
				case 'xmag':
				case 'ymag':
				case 'znear':
				case 'zfar':
				case 'aspect_ratio':
					data[ child.nodeName ] = parseFloat( child.textContent );
					break;

			}

		}

		return data;

	}

	// light

	parseLight( xml ) {

		let data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':
					data = this.parseLightTechnique( child );
					break;

			}

		}

		this.library.lights[ xml.getAttribute( 'id' ) ] = data;

	}

	parseLightTechnique( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					data.technique = child.nodeName;
					data.parameters = this.parseLightParameters( child );
					break;

			}

		}

		return data;

	}

	parseLightParameters( xml ) {

		const data = {};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':
					const array = parseFloats( child.textContent );
					data.color = new Color().fromArray( array );
					ColorManagement.colorSpaceToWorking( data.color, SRGBColorSpace );
					break;

				case 'falloff_angle':
					data.falloffAngle = parseFloat( child.textContent );
					break;

				case 'quadratic_attenuation':
					const f = parseFloat( child.textContent );
					data.distance = f ? Math.sqrt( 1 / f ) : 0;
					break;

			}

		}

		return data;

	}

	// geometry

	parseGeometry( xml ) {

		const data = {
			name: xml.getAttribute( 'name' ),
			sources: {},
			vertices: {},
			primitives: []
		};

		const mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

		// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
		if ( mesh === undefined ) return;

		for ( let i = 0; i < mesh.childNodes.length; i ++ ) {

			const child = mesh.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			const id = child.getAttribute( 'id' );

			switch ( child.nodeName ) {

				case 'source':
					data.sources[ id ] = this.parseSource( child );
					break;

				case 'vertices':
					// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
					data.vertices = this.parseGeometryVertices( child );
					break;

				case 'polygons':
					console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
					break;

				case 'lines':
				case 'linestrips':
				case 'polylist':
				case 'triangles':
					data.primitives.push( this.parseGeometryPrimitive( child ) );
					break;

				default:

			}

		}

		this.library.geometries[ xml.getAttribute( 'id' ) ] = data;

	}

	parseSource( xml ) {

		const data = {
			array: [],
			stride: 3
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'float_array':
					data.array = parseFloats( child.textContent );
					break;

				case 'Name_array':
					data.array = parseStrings( child.textContent );
					break;

				case 'technique_common':
					const accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

					if ( accessor !== undefined ) {

						data.stride = parseInt( accessor.getAttribute( 'stride' ) );

					}

					break;

			}

		}

		return data;

	}

	parseGeometryVertices( xml ) {

		const data = {};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

		}

		return data;

	}

	parseGeometryPrimitive( xml ) {

		const primitive = {
			type: xml.nodeName,
			material: xml.getAttribute( 'material' ),
			count: parseInt( xml.getAttribute( 'count' ) ),
			inputs: {},
			stride: 0,
			hasUV: false
		};

		for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':
					const id = parseId( child.getAttribute( 'source' ) );
					const semantic = child.getAttribute( 'semantic' );
					const offset = parseInt( child.getAttribute( 'offset' ) );
					const set = parseInt( child.getAttribute( 'set' ) );
					const inputname = ( set > 0 ? semantic + set : semantic );
					primitive.inputs[ inputname ] = { id: id, offset: offset };
					primitive.stride = Math.max( primitive.stride, offset + 1 );
					if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
					break;

				case 'vcount':
					primitive.vcount = parseInts( child.textContent );
					break;

				case 'p':
					primitive.p = parseInts( child.textContent );
					break;

			}

		}

		return primitive;

	}

	// kinematics

	parseKinematicsModel( xml ) {

		const data = {
			name: xml.getAttribute( 'name' ) || '',
			joints: {},
			links: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':
					this.parseKinematicsTechniqueCommon( child, data );
					break;

			}

		}

		this.library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

	}

	parseKinematicsTechniqueCommon( xml, data ) {

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'joint':
					data.joints[ child.getAttribute( 'sid' ) ] = this.parseKinematicsJoint( child );
					break;

				case 'link':
					data.links.push( this.parseKinematicsLink( child ) );
					break;

			}

		}

	}

	parseKinematicsJoint( xml ) {

		let data;

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'prismatic':
				case 'revolute':
					data = this.parseKinematicsJointParameter( child );
					break;

			}

		}

		return data;

	}

	parseKinematicsJointParameter( xml ) {

		const data = {
			sid: xml.getAttribute( 'sid' ),
			name: xml.getAttribute( 'name' ) || '',
			axis: new Vector3(),
			limits: {
				min: 0,
				max: 0
			},
			type: xml.nodeName,
			static: false,
			zeroPosition: 0,
			middlePosition: 0
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'axis':
					const array = parseFloats( child.textContent );
					data.axis.fromArray( array );
					break;
				case 'limits':
					const max = child.getElementsByTagName( 'max' )[ 0 ];
					const min = child.getElementsByTagName( 'min' )[ 0 ];

					data.limits.max = parseFloat( max.textContent );
					data.limits.min = parseFloat( min.textContent );
					break;

			}

		}

		// if min is equal to or greater than max, consider the joint static

		if ( data.limits.min >= data.limits.max ) {

			data.static = true;

		}

		// calculate middle position

		data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

		return data;

	}

	parseKinematicsLink( xml ) {

		const data = {
			sid: xml.getAttribute( 'sid' ),
			name: xml.getAttribute( 'name' ) || '',
			attachments: [],
			transforms: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					data.attachments.push( this.parseKinematicsAttachment( child ) );
					break;

				case 'matrix':
				case 'translate':
				case 'rotate':
					data.transforms.push( this.parseKinematicsTransform( child ) );
					break;

			}

		}

		return data;

	}

	parseKinematicsAttachment( xml ) {

		const data = {
			joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
			transforms: [],
			links: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					data.links.push( this.parseKinematicsLink( child ) );
					break;

				case 'matrix':
				case 'translate':
				case 'rotate':
					data.transforms.push( this.parseKinematicsTransform( child ) );
					break;

			}

		}

		return data;

	}

	parseKinematicsTransform( xml ) {

		const data = {
			type: xml.nodeName
		};

		const array = parseFloats( xml.textContent );

		switch ( data.type ) {

			case 'matrix':
				data.obj = new Matrix4();
				data.obj.fromArray( array ).transpose();
				break;

			case 'translate':
				data.obj = new Vector3();
				data.obj.fromArray( array );
				break;

			case 'rotate':
				data.obj = new Vector3();
				data.obj.fromArray( array );
				data.angle = MathUtils.degToRad( array[ 3 ] );
				break;

		}

		return data;

	}

	// physics

	parsePhysicsModel( xml ) {

		const data = {
			name: xml.getAttribute( 'name' ) || '',
			rigidBodies: {}
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'rigid_body':
					data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
					this.parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
					break;

			}

		}

		this.library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

	}

	parsePhysicsRigidBody( xml, data ) {

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':
					this.parsePhysicsTechniqueCommon( child, data );
					break;

			}

		}

	}

	parsePhysicsTechniqueCommon( xml, data ) {

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'inertia':
					data.inertia = parseFloats( child.textContent );
					break;

				case 'mass':
					data.mass = parseFloats( child.textContent )[ 0 ];
					break;

			}

		}

	}

	// scene

	parseKinematicsScene( xml ) {

		const data = {
			bindJointAxis: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_joint_axis':
					data.bindJointAxis.push( this.parseKinematicsBindJointAxis( child ) );
					break;

			}

		}

		this.library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

	}

	parseKinematicsBindJointAxis( xml ) {

		const data = {
			target: xml.getAttribute( 'target' ).split( '/' ).pop()
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'axis':
					const param = child.getElementsByTagName( 'param' )[ 0 ];
					data.axis = param.textContent;
					const tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
					data.jointIndex = tmpJointIndex.substring( 0, tmpJointIndex.length - 1 );
					break;

			}

		}

		return data;

	}

	// nodes

	prepareNodes( xml ) {

		const elements = xml.getElementsByTagName( 'node' );

		// ensure all node elements have id attributes

		for ( let i = 0; i < elements.length; i ++ ) {

			const element = elements[ i ];

			if ( element.hasAttribute( 'id' ) === false ) {

				element.setAttribute( 'id', this.generateId() );

			}

		}

	}

	parseNode( xml ) {

		const matrix = new Matrix4();
		const vector = new Vector3();

		const data = {
			name: xml.getAttribute( 'name' ) || '',
			type: xml.getAttribute( 'type' ),
			id: xml.getAttribute( 'id' ),
			sid: xml.getAttribute( 'sid' ),
			matrix: new Matrix4(),
			nodes: [],
			instanceCameras: [],
			instanceControllers: [],
			instanceLights: [],
			instanceGeometries: [],
			instanceNodes: [],
			transforms: {},
			transformData: {},
			transformOrder: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			if ( child.nodeType !== 1 ) continue;

			let array;

			switch ( child.nodeName ) {

				case 'node':
					data.nodes.push( child.getAttribute( 'id' ) );
					this.parseNode( child );
					break;

				case 'instance_camera':
					data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
					break;

				case 'instance_controller':
					data.instanceControllers.push( this.parseNodeInstance( child ) );
					break;

				case 'instance_light':
					data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
					break;

				case 'instance_geometry':
					data.instanceGeometries.push( this.parseNodeInstance( child ) );
					break;

				case 'instance_node':
					data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
					break;

				case 'matrix':
					array = parseFloats( child.textContent );
					data.matrix.multiply( matrix.fromArray( array ).transpose() );
					{

						const sid = child.getAttribute( 'sid' );
						data.transforms[ sid ] = child.nodeName;
						data.transformData[ sid ] = { type: 'matrix', array: array };
						data.transformOrder.push( sid );

					}

					break;

				case 'translate':
					array = parseFloats( child.textContent );
					vector.fromArray( array );
					data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
					{

						const sid = child.getAttribute( 'sid' );
						data.transforms[ sid ] = child.nodeName;
						data.transformData[ sid ] = { type: 'translate', x: array[ 0 ], y: array[ 1 ], z: array[ 2 ] };
						data.transformOrder.push( sid );

					}

					break;

				case 'rotate':
					array = parseFloats( child.textContent );
					{

						const angle = MathUtils.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						const sid = child.getAttribute( 'sid' );
						data.transforms[ sid ] = child.nodeName;
						data.transformData[ sid ] = { type: 'rotate', axis: [ array[ 0 ], array[ 1 ], array[ 2 ] ], angle: array[ 3 ] };
						data.transformOrder.push( sid );

					}

					break;

				case 'scale':
					array = parseFloats( child.textContent );
					data.matrix.scale( vector.fromArray( array ) );
					{

						const sid = child.getAttribute( 'sid' );
						data.transforms[ sid ] = child.nodeName;
						data.transformData[ sid ] = { type: 'scale', x: array[ 0 ], y: array[ 1 ], z: array[ 2 ] };
						data.transformOrder.push( sid );

					}

					break;

				case 'extra':
					break;

				default:

			}

		}

		if ( this.hasNode( data.id ) ) {

			console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

		} else {

			this.library.nodes[ data.id ] = data;

		}

		return data;

	}

	parseNodeInstance( xml ) {

		const data = {
			id: parseId( xml.getAttribute( 'url' ) ),
			materials: {},
			skeletons: []
		};

		for ( let i = 0; i < xml.childNodes.length; i ++ ) {

			const child = xml.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'bind_material':
					const instances = child.getElementsByTagName( 'instance_material' );

					for ( let j = 0; j < instances.length; j ++ ) {

						const instance = instances[ j ];
						const symbol = instance.getAttribute( 'symbol' );
						const target = instance.getAttribute( 'target' );

						data.materials[ symbol ] = parseId( target );

					}

					break;

				case 'skeleton':
					data.skeletons.push( parseId( child.textContent ) );
					break;

				default:
					break;

			}

		}

		return data;

	}

	// visual scenes

	parseVisualScene( xml ) {

		const data = {
			name: xml.getAttribute( 'name' ),
			children: []
		};

		this.prepareNodes( xml );

		const elements = getElementsByTagName( xml, 'node' );

		for ( let i = 0; i < elements.length; i ++ ) {

			data.children.push( this.parseNode( elements[ i ] ) );

		}

		this.library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

	}

	hasNode( id ) {

		return this.library.nodes[ id ] !== undefined;

	}

}

export { ColladaParser, getElementsByTagName, parseStrings, parseFloats, parseInts, parseId };
