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
import ProjectorLight from '../../../lights/webgpu/ProjectorLight.js';
import {
	PointLightNode,
	DirectionalLightNode,
	RectAreaLightNode,
	SpotLightNode,
	AmbientLightNode,
	HemisphereLightNode,
	LightProbeNode,
	IESSpotLightNode,
	ProjectorLightNode
} from '../../../nodes/Nodes.js';

// Tone Mapping
import { LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping } from '../../../constants.js';
import { linearToneMapping, reinhardToneMapping, cineonToneMapping, acesFilmicToneMapping, agxToneMapping, neutralToneMapping } from '../../../nodes/display/ToneMappingFunctions.js';

PointLight.prototype.lightNode = PointLightNode;
DirectionalLight.prototype.lightNode = DirectionalLightNode;
RectAreaLight.prototype.lightNode = RectAreaLightNode;
SpotLight.prototype.lightNode = SpotLightNode;
AmbientLight.prototype.lightNode = AmbientLightNode;
HemisphereLight.prototype.lightNode = HemisphereLightNode;
LightProbe.prototype.lightNode = LightProbeNode;
IESSpotLight.prototype.lightNode = IESSpotLightNode;
ProjectorLight.prototype.lightNode = ProjectorLightNode;

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

		this.addToneMapping( linearToneMapping, LinearToneMapping );
		this.addToneMapping( reinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( cineonToneMapping, CineonToneMapping );
		this.addToneMapping( acesFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( agxToneMapping, AgXToneMapping );
		this.addToneMapping( neutralToneMapping, NeutralToneMapping );

	}

}

export default BasicNodeLibrary;
