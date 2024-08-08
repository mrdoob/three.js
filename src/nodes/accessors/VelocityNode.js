import { positionLocal } from './PositionNode.js';
import { Fn } from '../shadernode/ShaderNode.js';
import { sub } from '../math/OperatorNode.js';
import { modelViewProjection } from './ModelViewProjectionNode.js';

export const velocity = Fn( ( [ positionLocalPrevious ] ) => {

	const clipPositionCurrent = modelViewProjection( positionLocal );
	const clipPositionPrevious = modelViewProjection( positionLocalPrevious );

	const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
	const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

	return sub( ndcPositionCurrent, ndcPositionPrevious );

} );
