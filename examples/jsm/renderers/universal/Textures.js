import DataMap from './DataMap.js';

class Textures extends DataMap {

	constructor( backend, info ) {

		super();

		this.backend = backend;
		this.info = info;

	}

	initTexture( texture ) {

		const data = this.get( texture );
		if ( data.initialized ) return;

		data.initialized = true;

		this.backend.createSampler( texture );
		this.backend.createDefaultTexture( texture );

		this.info.memory.textures ++;

		// dispose

		const onDispose = () => {

			texture.removeEventListener( 'dispose', onDispose );

			this.backend.destroyTexture( texture );

			this.delete( texture );

			this.info.memory.textures --;

		};

		texture.addEventListener( 'dispose', onDispose );

	}

	updateTexture( texture ) {

		let needsUpdate = false;

		const data = this.get( texture );

		if ( texture.version > 0 && data.version !== texture.version ) {

			const image = texture.image;

			if ( image === undefined ) {

				console.warn( 'THREE.Renderer: Texture marked for update but image is undefined.' );

			} else if ( image.complete === false ) {

				console.warn( 'THREE.Renderer: Texture marked for update but image is incomplete.' );

			} else {

				//

				this.initTexture( texture );

				//

				this.backend.createTexture( texture );
				this.backend.updateTexture( texture );

				data.version = texture.version;

				needsUpdate = true;

			}

		}

		return needsUpdate;

	}

}

export default Textures;
