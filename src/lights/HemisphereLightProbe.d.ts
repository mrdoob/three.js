import { ColorRepresentation } from '../utils';
import { LightProbe } from './LightProbe';

export class HemisphereLightProbe extends LightProbe {
    constructor(skyColor?: ColorRepresentation, groundColor?: ColorRepresentation, intensity?: number);

    readonly isHemisphereLightProbe: true;
}
