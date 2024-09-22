
class StackedLightingModel {

	constructor() {

		this.lightingModel = null;
		this.lightingNode = null;

	}

	stack( lightNode, lightingModel ) {

		this.lightNode = lightNode;
		this.lightingModel = lightingModel;

		return this;

	}

	get start( /*input, stack, builder*/ ) {

		return this.lightingModel.start;

	}

	get finish( /*input, stack, builder*/ ) {

		return this.lightingModel.finish;

	}

	get direct( /*input, stack, builder*/ ) {

		return this.lightingModel.direct;

	}

	get directRectArea( /*input, stack, builder*/ ) {

		return this.lightingModel.directRectArea;

	}

	get indirect( /*input, stack, builder*/ ) {

		return this.lightingModel.indirect;

	}

	get ambientOcclusion( /*input, stack, builder*/ ) {

		return this.lightingModel.ambientOcclusion;

	}

}

export { StackedLightingModel };
