import NodeLibrary from '../../common/nodes/NodeLibrary.js';

// Lights
import { PointLight } from '../../../lights/PointLight.js';
import { PointLightNode } from '../../../nodes/Nodes.js';
import { DirectionalLight } from '../../../lights/DirectionalLight.js';
import { DirectionalLightNode } from '../../../nodes/Nodes.js';
import { RectAreaLight } from '../../../lights/RectAreaLight.js';
import { RectAreaLightNode } from '../../../nodes/Nodes.js';
import { SpotLight } from '../../../lights/SpotLight.js';
import { SpotLightNode } from '../../../nodes/Nodes.js';
import { AmbientLight } from '../../../lights/AmbientLight.js';
import { AmbientLightNode } from '../../../nodes/Nodes.js';
import { HemisphereLight } from '../../../lights/HemisphereLight.js';
import { HemisphereLightNode } from '../../../nodes/Nodes.js';
import { LightProbe } from '../../../lights/LightProbe.js';
import { LightProbeNode } from '../../../nodes/Nodes.js';
import IESSpotLight from '../../../lights/webgpu/IESSpotLight.js';
import { IESSpotLightNode } from '../../../nodes/Nodes.js';

// Tone Mapping
import { LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from '../../../constants.js';
import * as TMF from '../../../nodes/display/ToneMappingFunctions.js';

// Color Space
import { LinearSRGBColorSpace, SRGBColorSpace } from '../../../constants.js';
import { getColorSpaceMethod } from '../../../nodes/display/ColorSpaceNode.js';
import * as CSF from '../../../nodes/display/ColorSpaceFunctions.js';

class BasicNodeLibrary extends NodeLibrary {

	constructor() {

		super();

		this.addLight( PointLightNode, PointLight );
		this.addLight( DirectionalLightNode, DirectionalLight );
		this.addLight( RectAreaLightNode, RectAreaLight );
		this.addLight( SpotLightNode, SpotLight );
		this.addLight( AmbientLightNode, AmbientLight );
		this.addLight( HemisphereLightNode, HemisphereLight );
		this.addLight( LightProbeNode, LightProbe );
		this.addLight( IESSpotLightNode, IESSpotLight );

		this.addToneMapping( TMF.LinearToneMapping, LinearToneMapping );
		this.addToneMapping( TMF.ReinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( TMF.CineonToneMapping, CineonToneMapping );
		this.addToneMapping( TMF.ACESFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( TMF.AgXToneMapping, AgXToneMapping );
		this.addToneMapping( TMF.NeutralToneMapping, NeutralToneMapping );

		this.addColorSpace( CSF.LinearTosRGB, getColorSpaceMethod( LinearSRGBColorSpace, SRGBColorSpace ) );
		this.addColorSpace( CSF.sRGBToLinear, getColorSpaceMethod( SRGBColorSpace, LinearSRGBColorSpace ) );

	}

}

export default BasicNodeLibrary;
