import { Fn } from '../shadernode/ShaderNode.js';
import { sub } from '../math/OperatorNode.js';
import { modelViewMatrix, modelWorldMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';

export const velocity = Fn( ( [ clipPositionCurrent, clipPositionPrevious ] ) => {

	const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
	const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

	return sub( ndcPositionCurrent, ndcPositionPrevious );

} );

export const ndcPosition = modelViewMatrix.mul( modelWorldMatrix ).mul( positionLocal ).toVar();
