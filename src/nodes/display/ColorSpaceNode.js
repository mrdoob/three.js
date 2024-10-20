import TempNode from '../core/TempNode.js';
import { addMethodChaining, mat3, nodeObject, vec4 } from '../tsl/TSLCore.js';

import { SRGBTransfer } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { sRGBTransferEOTF, sRGBTransferOETF } from './ColorSpaceFunctions.js';
import { Matrix3 } from '../../math/Matrix3.js';

const WORKING_COLOR_SPACE = 'WorkingColorSpace';
const OUTPUT_COLOR_SPACE = 'OutputColorSpace';

class ColorSpaceNode extends TempNode {

	static get type() {

		return 'ColorSpaceNode';

	}

	constructor( colorNode, source, target ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.source = source;
		this.target = target;

	}

	resolveColorSpace( builder, colorSpace ) {

		if ( colorSpace === WORKING_COLOR_SPACE ) {

			return ColorManagement.workingColorSpace;

		} else if ( colorSpace === OUTPUT_COLOR_SPACE ) {

			return builder.context.outputColorSpace || builder.renderer.outputColorSpace;

		}

		return colorSpace;

	}

	setup( builder ) {

		const { colorNode } = this;

		const source = this.resolveColorSpace( builder, this.source );
		const target = this.resolveColorSpace( builder, this.target );

		let outputNode = colorNode;

		if ( ColorManagement.enabled === false || source === target || ! source || ! target ) {

			return outputNode;

		}

		if ( ColorManagement.getTransfer( source ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferEOTF( outputNode.rgb ), outputNode.a );

		}

		if ( ColorManagement.getPrimaries( source ) !== ColorManagement.getPrimaries( target ) ) {

			outputNode = vec4(
				mat3( ColorManagement._getMatrix( new Matrix3(), source, target ) ).mul( outputNode.rgb ),
				outputNode.a
			);

		}

		if ( ColorManagement.getTransfer( target ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferOETF( outputNode.rgb ), outputNode.a );

		}

		return outputNode;

	}

}

export default ColorSpaceNode;

export const toOutputColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, OUTPUT_COLOR_SPACE ) );
export const toWorkingColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), OUTPUT_COLOR_SPACE, WORKING_COLOR_SPACE ) );

export const workingToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, colorSpace ) );
export const colorSpaceToWorking = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), colorSpace, WORKING_COLOR_SPACE ) );

export const convertColorSpace = ( node, sourceColorSpace, targetColorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), sourceColorSpace, targetColorSpace ) );

addMethodChaining( 'toOutputColorSpace', toOutputColorSpace );
addMethodChaining( 'toWorkingColorSpace', toWorkingColorSpace );

addMethodChaining( 'workingToColorSpace', workingToColorSpace );
addMethodChaining( 'colorSpaceToWorking', colorSpaceToWorking );
