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
import { linearToneMapping, reinhardToneMapping, cineonToneMapping, acesFilmicToneMapping, agxToneMapping, neutralToneMapping } from '../../../nodes/display/ToneMappingFunctions.js';

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

		this.addToneMapping( linearToneMapping, LinearToneMapping );
		this.addToneMapping( reinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( cineonToneMapping, CineonToneMapping );
		this.addToneMapping( acesFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( agxToneMapping, AgXToneMapping );
		this.addToneMapping( neutralToneMapping, NeutralToneMapping );

	}

}

export default BasicNodeLibrary;
