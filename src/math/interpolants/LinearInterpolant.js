import { Interpolant } from '../Interpolant.js';

/**
 * @author tschw
 */

function LinearInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

	Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

}

LinearInterpolant.prototype = Object.assign( Object.create( Interpolant.prototype ), {

	constructor: LinearInterpolant,

	interpolate_: function ( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			offset1 = i1 * stride,
			offset0 = offset1 - stride,

			weight1 = ( t - t0 ) / ( t1 - t0 ),
			weight0 = 1 - weight1;


		for ( var i = 0; i !== stride; ++ i ) {

			if ( values[ offset0 + i ].isVector2 || values[ offset0 + i ].isVector3 || values[ offset0 + i ].isVector4 )
				result[ i ] = values[ offset0 + i ].clone().lerp( values[ offset1 + i ], weight1 );
			else
				result[ i ] =
							values[ offset0 + i ] * weight0 +
							values[ offset1 + i ] * weight1;

		}

		return result;

	}

} );


export { LinearInterpolant };
