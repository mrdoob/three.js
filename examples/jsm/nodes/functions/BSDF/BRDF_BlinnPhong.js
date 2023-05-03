import F_Schlick from './F_Schlick.js';
import { shininess, specularColor } from '../../core/PropertyNode.js';
import { transformedNormalView } from '../../accessors/NormalNode.js';
import { positionViewDirection } from '../../accessors/PositionNode.js';
import { ShaderNode, float } from '../../shadernode/ShaderNode.js';

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = new ShaderNode( ( { dotNH } ) => {

	return shininess.mul( 0.5 / Math.PI ).add( 1.0 ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = new ShaderNode( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick.call( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong.call( { dotNH } );

	return F.mul( G ).mul( D );

} );

export default BRDF_BlinnPhong;
