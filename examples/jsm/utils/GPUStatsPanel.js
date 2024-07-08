import Stats from '../libs/stats.module.js';

// https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query_webgl2/
export class GPUStatsPanel extends Stats.Panel {

	constructor( context, name = 'GPU MS' ) {

		super( name, '#f90', '#210' );

		const extension = context.getExtension( 'EXT_disjoint_timer_query_webgl2' );

		if ( extension === null ) {

			console.warn( 'GPUStatsPanel: disjoint_time_query extension not available.' );

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
			const query = gl.createQuery();
			gl.beginQuery( ext.TIME_ELAPSED_EXT, query );

			this.activeQueries ++;

			const checkQuery = () => {

				// check if the query is available and valid

				const available = gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE );
				const disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
				const ns = gl.getQueryParameter( query, gl.QUERY_RESULT );

				const ms = ns * 1e-6;

				if ( available ) {

					// update the display if it is valid
					if ( ! disjoint ) {

						this.update( ms, this.maxTime );

					}

					gl.deleteQuery( query );

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

			gl.endQuery( ext.TIME_ELAPSED_EXT );

		};

	}

}
