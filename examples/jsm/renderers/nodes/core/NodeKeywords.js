import CodeNode from './CodeNode.js';
import VarNode from './VarNode.js';
import PositionNode from '../accessors/PositionNode.js';
import NormalNode from '../accessors/NormalNode.js';

import { saturateMacro, whiteComplementMacro } from '../functions/MathFunctions.js';

class NodeKeywords {

	static SaturateMacro = 'saturate';
	static WhiteComplementMacro = 'whiteComplement';

	static PositionLocal = 'PositionLocal';
	static PositionWorld = 'PositionWorld';
	static PositionView = 'PositionView';
	static PositionViewDirection = 'PositionViewDirection';

	static NormalLocal = 'NormalLocal';
	static NormalWorld = 'NormalWorld';
	static NormalView = 'NormalView';

	constructor() {

		this.keywords = [
			// variadic macros
			NodeKeywords.SaturateMacro,
			NodeKeywords.WhiteComplementMacro,
			// nodes
			NodeKeywords.PositionLocal,
			NodeKeywords.PositionWorld,
			NodeKeywords.PositionView,
			NodeKeywords.PositionViewDirection,
			NodeKeywords.NormalLocal,
			NodeKeywords.NormalWorld,
			NodeKeywords.NormalView,
		];

		this.nodes = [];

	}
	
	getNode( name ) {
		
		let node = this.nodes[ name ];
		
		if ( node === undefined ) {
			
			switch( name ) {
				
				case NodeKeywords.SaturateMacro:
				
					node = saturateMacro;
					
					break;
				
				case NodeKeywords.WhiteComplementMacro:
				
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
			}
			
			if ( node !== undefined ) {
			
				this.nodes[ name ] = node;
				
			}
			
		}
		
		return node;
		
	}

}

export default NodeKeywords;
