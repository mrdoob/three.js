import { RenderTarget } from 'three';


class WebGPURenderTarget {

	constructor( width = 1, height = 1, options = {} ) {
	
		this.readBuffer = new RenderTarget( width, height, options );
		this.writeBuffer = new RenderTarget( width, height, options );

	}

	swap() {

		[this.readBuffer, this.writeBuffer ] = [ this.writeBuffer, this.readBuffer ];

	}

	get read() {

		return this.readBuffer;
	}

	get write() {

		return this.writeBuffer;
	}

	get texture() {

		return this.readBuffer.texture;
	}

	setSize( width, height ) {

		this.readBuffer.setSize( width, height );
		this.writeBuffer.setSize( width, height );

	}

	dispose() {

		this.readBuffer.dispose();
		this.writeBuffer.dispose();

	}

	render( renderer, scene, camera ) {

		renderer.setRenderTarget( this.writeBuffer );
		renderer.render( scene, camera );
		renderer.setRenderTarget( null );

		this.swap();

		return this;

	}

	async renderAsync( renderer, scene, camera ) {

		renderer.setRenderTarget( this.writeBuffer );
		await renderer.renderAsync( scene, camera );
		renderer.setRenderTarget( null );

		this.swap();

		return this;

	}
	
}

export default WebGPURenderTarget;