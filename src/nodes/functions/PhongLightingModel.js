import BasicLightingModel from './BasicLightingModel.js';
import F_Schlick from './BSDF/F_Schlick.js';
import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { diffuseColor, shininess, specularColor } from '../core/PropertyNode.js';
import { transformedNormalView } from '../accessors/Normal.js';
import { materialSpecularStrength } from '../accessors/MaterialNode.js';
import { positionViewDirection } from '../accessors/Position.js';
import { Fn, float } from '../tsl/TSLBase.js';

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = /*@__PURE__*/ Fn( ( { dotNH } ) => {

	return shininess.mul( float( 0.5 ) ).add( 1.0 ).mul( float( 1 / Math.PI ) ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = /*@__PURE__*/ Fn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong( { dotNH } );

	return F.mul( G ).mul( D );

} );

class PhongLightingModel extends BasicLightingModel {

	constructor( specular = true ) {

		super();

		this.specular = specular;

	}

	direct( { lightDirection, lightColor, reflectedLight } ) {

		const dotNL = transformedNormalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		if ( this.specular === true ) {

			reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_BlinnPhong( { lightDirection } ) ).mul( materialSpecularStrength ) );

		}

	}

	indirect( { ambientOcclusion, irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

}

export default PhongLightingModel;
