import VarNode from './VarNode.js';
import PropertyNode from './PropertyNode.js';
import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';

import { PI, RECIPROCAL_PI } from '../consts/MathConsts.js';
import { saturateMacro, whiteComplementMacro } from '../functions/MathFunctions.js';

class NodeKeywords {

	static PI = 'PI';
	static RECIPROCAL_PI = 'RECIPROCAL_PI';

	static Saturate = 'saturate';
	static WhiteComplement = 'whiteComplement';

	static PositionLocal = 'PositionLocal';
	static PositionWorld = 'PositionWorld';
	static PositionView = 'PositionView';
	static PositionViewDirection = 'PositionViewDirection';

	static NormalLocal = 'NormalLocal';
	static NormalWorld = 'NormalWorld';
	static NormalView = 'NormalView';

	static Irradiance = 'Irradiance';
	static ReflectedLightIndirectDiffuse = 'ReflectedLightIndirectDiffuse';
	static ReflectedLightIndirectSpecular = 'ReflectedLightIndirectSpecular';
	static ReflectedLightDirectDiffuse = 'ReflectedLightDirectDiffuse';
	static ReflectedLightDirectSpecular = 'ReflectedLightDirectSpecular';

	static MaterialDiffuseColor = 'MaterialDiffuseColor';

	static MaterialSpecularShininess = 'MaterialSpecularShininess';
	static MaterialSpecularColor = 'MaterialSpecularColor';

	constructor() {

		this.keywords = [
			// consts
			NodeKeywords.PI,
			NodeKeywords.RECIPROCAL_PI,
			// variadic macros
			NodeKeywords.Saturate,
			NodeKeywords.WhiteComplement,
			// nodes
			NodeKeywords.PositionLocal,
			NodeKeywords.PositionWorld,
			NodeKeywords.PositionView,
			NodeKeywords.PositionViewDirection,
			NodeKeywords.NormalLocal,
			NodeKeywords.NormalWorld,
			NodeKeywords.NormalView,
			// vars -> float
			NodeKeywords.MaterialSpecularShininess,
			// vars -> vec3
			NodeKeywords.Irradiance,
			NodeKeywords.ReflectedLightIndirectDiffuse,
			NodeKeywords.ReflectedLightIndirectSpecular,
			NodeKeywords.ReflectedLightDirectDiffuse,
			NodeKeywords.ReflectedLightDirectSpecular,
			NodeKeywords.MaterialSpecularColor,
			// vars -> vec4
			NodeKeywords.MaterialDiffuseColor
		];

		this.nodes = [];

	}

	getNode( name ) {

		let node = this.nodes[ name ];

		if ( node === undefined ) {

			switch ( name ) {

				case NodeKeywords.PI:

					node = PI;

					break;

				case NodeKeywords.RECIPROCAL_PI:

					node = RECIPROCAL_PI;

					break;

				case NodeKeywords.Saturate:

					node = saturateMacro;

					break;

				case NodeKeywords.WhiteComplement:

					node = whiteComplementMacro;

					break;

				case NodeKeywords.PositionLocal:

					node = new VarNode( new PositionNode( PositionNode.LOCAL ), name );

					break;

				case NodeKeywords.PositionWorld:

					node = new VarNode( new PositionNode( PositionNode.WORLD ), name );

					break;

				case NodeKeywords.PositionView:

					node = new VarNode( new PositionNode( PositionNode.VIEW ), name );

					break;

				case NodeKeywords.PositionViewDirection:

					node = new VarNode( new PositionNode( PositionNode.VIEW_DIRECTION ), name );

					break;

				case NodeKeywords.NormalLocal:

					node = new VarNode( new NormalNode( NormalNode.LOCAL ), name );

					break;

				case NodeKeywords.NormalWorld:

					node = new VarNode( new NormalNode( NormalNode.WORLD ), name );

					break;

				case NodeKeywords.NormalView:

					node = new VarNode( new NormalNode( NormalNode.VIEW ), name );

					break;

				// floats properties
				case NodeKeywords.MaterialSpecularShininess:

					node = new PropertyNode( name, 'float' );

					break;

				// vec3 properties
				case NodeKeywords.Irradiance:
				case NodeKeywords.ReflectedLightIndirectDiffuse:
				case NodeKeywords.ReflectedLightIndirectSpecular:
				case NodeKeywords.ReflectedLightDirectDiffuse:
				case NodeKeywords.ReflectedLightDirectSpecular:
				case NodeKeywords.MaterialSpecularColor:

					node = new PropertyNode( name, 'vec3' );

					break;

				// vec4 properties
				case NodeKeywords.MaterialDiffuseColor:

					node = new PropertyNode( name, 'vec4' );

					break;

			}

			if ( node !== undefined ) {

				this.nodes[ name ] = node;

			}

		}

		return node;

	}

	parse( code ) {

		const keywordNames = this.keywords;

		const regExp = new RegExp( `\\b${keywordNames.join( '\\b|\\b' )}\\b`, 'g' );

		const codeKeywords = code.match( regExp );

		const keywords = [];

		if ( codeKeywords !== null ) {

			for ( const keyword of codeKeywords ) {

				const node = this.getNode( keyword );

				if ( keywords.indexOf( node ) === - 1 ) {

					keywords.push( node );

				}

			}

		}

		return keywords;

	}

	include( builder, code ) {

		const keywords = this.parse( code );

		for ( const keywordNode of keywords ) {

			keywordNode.build( builder );

		}

	}

}

export default NodeKeywords;
