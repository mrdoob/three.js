import { SphericalHarmonics3 } from './../math/SphericalHarmonics3';
import { Light } from './Light';

export class LightProbe extends Light {

	constructor( sh?: SphericalHarmonics3, intensity?: number );

	readonly isLightProbe: true;
	sh: SphericalHarmonics3;

}
