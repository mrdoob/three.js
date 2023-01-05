import F_Schlick from './F_Schlick.js';
import { ShaderNode, shininess, specularColor, float, add, clamp, dot, mul, normalize, positionViewDirection, transformedNormalView } from '../../shadernode/ShaderNodeBaseElements.js';

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = new ShaderNode( ( { dotNH } ) => {

	return shininess.mul( 1 / Math.PI ).mul( 0.5 ).add( 1.0 ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = new ShaderNode( ( { lightDirection } ) => {

	const halfDir = normalize( add( lightDirection, positionViewDirection ) );

	const dotNH = clamp( dot( transformedNormalView, halfDir ) );
	const dotVH = clamp( dot( positionViewDirection, halfDir ) );

	const F = F_Schlick.call( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong.call( { dotNH } );

	return mul( F, G, D );

} );

export default BRDF_BlinnPhong;
