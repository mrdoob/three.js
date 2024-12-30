import NodeLibrary from '../../common/nodes/NodeLibrary.js';

// Lights
import { PointLight } from '../../../lights/PointLight.js';
import { DirectionalLight } from '../../../lights/DirectionalLight.js';
import { RectAreaLight } from '../../../lights/RectAreaLight.js';
import { SpotLight } from '../../../lights/SpotLight.js';
import { AmbientLight } from '../../../lights/AmbientLight.js';
import { HemisphereLight } from '../../../lights/HemisphereLight.js';
import { LightProbe } from '../../../lights/LightProbe.js';
import IESSpotLight from '../../../lights/webgpu/IESSpotLight.js';
import {
	PointLightNode,
	DirectionalLightNode,
	RectAreaLightNode,
	SpotLightNode,
	AmbientLightNode,
	HemisphereLightNode,
	LightProbeNode,
	IESSpotLightNode
} from '../../../nodes/Nodes.js';

// Tone Mapping
import { LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from '../../../constants.js';
import { linearToneMapping, reinhardToneMapping, cineonToneMapping, acesFilmicToneMapping, agxToneMapping, neutralToneMapping } from '../../../nodes/display/ToneMappingFunctions.js';

/**
 * This version of a node library represents a basic version
 * just focusing on lights and tone mapping techniques.
 *
 * @private
 * @augments NodeLibrary
 */
class BasicNodeLibrary extends NodeLibrary {

	/**
	 * Constructs a new basic node library.
	 */
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
