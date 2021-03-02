import CodeNode from './CodeNode.js';
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
	
	static MaterialDiffuseColor = 'MaterialDiffuseColor';

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
			// vars
			NodeKeywords.MaterialDiffuseColor
		];

		this.nodes = [];

	}
	
	getNode( name ) {
		
		let node = this.nodes[ name ];
		
		if ( node === undefined ) {
			
			switch( name ) {
				
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
		
		const regExp = new RegExp( `\\b${keywordNames.join('\\b|\\b')}\\b`, 'g' )
		
		const codeKeywords = code.match( regExp );
		
		const keywords = [];
		
		if ( codeKeywords !== null ) {
			
			for(const keyword of codeKeywords) {
				
				const node = this.getNode( keyword );
				
				if ( keywords.indexOf( node ) === -1 ) {
					
					keywords.push( node );
					
				}

			}
			
		}
		
		return keywords;
		
	}

}

export default NodeKeywords;
