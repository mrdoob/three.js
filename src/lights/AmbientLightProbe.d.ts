import { Color } from './../math/Color';
import { LightProbe } from './LightProbe';

export class AmbientLightProbe extends LightProbe {

	constructor( color?: Color | string | number, intensity?: number );

	readonly isAmbientLightProbe: true;

}
