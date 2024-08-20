import { select } from '../math/CondNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addNodeElement } from '../shadernode/ShaderNode.js';

export const Discard = ( conditional ) => conditional ? select( conditional, expression( 'discard' ).append() ) : expression( 'discard' ).append();
export const Return = () => expression( 'return' ).append();

export const discard = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.DiscardNode: discard() has been renamed to Discard().' );
	return Discard( ...params );

};

addNodeElement( 'discard', Discard );
