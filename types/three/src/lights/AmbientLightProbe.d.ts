import { ColorRepresentation } from '../utils';
import { LightProbe } from './LightProbe';

export class AmbientLightProbe extends LightProbe {
    constructor(color?: ColorRepresentation, intensity?: number);

    readonly isAmbientLightProbe: true;
}
