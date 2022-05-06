import Stats from '../libs/stats.module.js';

// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query_webgl2/
export class GPUStatsPanel extends Stats.Panel {

	constructor( context, name = 'GPU MS' ) {

		super( name, '#f90', '#210' );

		let isWebGL2 = true;
		let extension = context.getExtension( 'EXT_disjoint_timer_query_webgl2' );
		if ( extension === null ) {

			isWebGL2 = false;
			extension = context.getExtension( 'EXT_disjoint_timer_query' );

			if ( extension === null ) {

				console.warn( 'GPUStatsPanel: disjoint_time_query extension not available.' );

			}

		}

		this.context = context;
		this.extension = extension;
		this.maxTime = 30;
		this.activeQueries = 0;

		this.startQuery = function () {

			const gl = this.context;
			const ext = this.extension;

			if ( ext === null ) {

				return;

			}

			// create the query object
			let query;
			if ( isWebGL2 ) {

				query = gl.createQuery();
				gl.beginQuery( ext.TIME_ELAPSED_EXT, query );

			} else {

				query = ext.createQueryEXT();
				ext.beginQueryEXT( ext.TIME_ELAPSED_EXT, query );

			}

			this.activeQueries ++;

			const checkQuery = () => {

				// check if the query is available and valid
				let available, disjoint, ns;
				if ( isWebGL2 ) {

					available = gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = gl.getQueryParameter( query, gl.QUERY_RESULT );

				} else {

					available = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_AVAILABLE_EXT );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_EXT );

				}

				const ms = ns * 1e-6;
				if ( available ) {

					// update the display if it is valid
					if ( ! disjoint ) {

						this.update( ms, this.maxTime );

					}

					this.activeQueries --;


				} else if ( gl.isContextLost() === false ) {

					// otherwise try again the next frame
					requestAnimationFrame( checkQuery );

				}

			};

			requestAnimationFrame( checkQuery );

		};

		this.endQuery = function () {

			// finish the query measurement
			const ext = this.extension;
			const gl = this.context;

			if ( ext === null ) {

				return;

			}

			if ( isWebGL2 ) {

				gl.endQuery( ext.TIME_ELAPSED_EXT );

			} else {

				ext.endQueryEXT( ext.TIME_ELAPSED_EXT );

			}

		};

	}

}
