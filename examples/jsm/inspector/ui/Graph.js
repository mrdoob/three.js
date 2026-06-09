export class Graph {

	constructor( maxPoints = 512 ) {

		this.maxPoints = maxPoints;
		this.lines = {};
		this.limit = 0;
		this.limitIndex = 0;

		this.domElement = document.createElement( 'canvas' );
		this.domElement.setAttribute( 'class', 'graph-canvas' );

		this.ctx = this.domElement.getContext( '2d' );

		this.width = 0;
		this.height = 0;
		this.devicePixelRatio = window.devicePixelRatio || 1;

	}

	resize( width, height ) {

		this.width = width;
		this.height = height;

		this.devicePixelRatio = window.devicePixelRatio || 1;
		this.domElement.width = width * this.devicePixelRatio;
		this.domElement.height = height * this.devicePixelRatio;

		this.draw();

	}

	addLine( id, color ) {

		this.lines[ id ] = { color, points: [], resolvedColor: null };

	}

	addPoint( lineId, value ) {

		const line = this.lines[ lineId ];
		if ( ! line ) return;

		line.points.push( value );
		if ( line.points.length > this.maxPoints ) {

			line.points.shift();

		}

		if ( value > this.limit ) {

			this.limit = value;
			this.limitIndex = 0;

		}

	}

	resetLimit() {

		this.limit = 0;
		this.limitIndex = 0;

	}

	update() {

		const width = this.domElement.clientWidth;
		const height = this.domElement.clientHeight;

		if ( width === 0 || height === 0 ) return;

		if ( width !== this.width || height !== this.height ) {

			this.resize( width, height );

		} else {

			this.draw();

		}

		if ( this.limitIndex ++ > this.maxPoints ) {

			this.resetLimit();

		}

	}

	draw() {

		const ctx = this.ctx;
		const dpr = this.devicePixelRatio;
		const width = this.width;
		const height = this.height;

		ctx.clearRect( 0, 0, width * dpr, height * dpr );

		if ( width === 0 || height === 0 ) return;

		ctx.save();
		ctx.scale( dpr, dpr );

		const pointStep = width / ( this.maxPoints - 1 );

		for ( const id in this.lines ) {

			const line = this.lines[ id ];
			if ( line.points.length === 0 ) continue;

			if ( ! line.resolvedColor ) {

				line.resolvedColor = this.resolveColor( line.color );

			}

			const drawColor = line.resolvedColor || '#ffffff';
			const offset = width - ( ( line.points.length - 1 ) * pointStep );

			// 1. Draw fill (with opacity)
			ctx.fillStyle = drawColor;
			ctx.globalAlpha = 0.4;
			ctx.beginPath();
			ctx.moveTo( offset, height );
			for ( let i = 0; i < line.points.length; i ++ ) {

				const x = offset + i * pointStep;
				const y = this.limit === 0 ? height : height - ( line.points[ i ] / this.limit ) * height;
				ctx.lineTo( x, y );

			}

			ctx.lineTo( offset + ( line.points.length - 1 ) * pointStep, height );
			ctx.closePath();
			ctx.fill();

			// 2. Draw stroke (full opacity)
			ctx.strokeStyle = drawColor;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 1.0;
			ctx.beginPath();
			for ( let i = 0; i < line.points.length; i ++ ) {

				const x = offset + i * pointStep;
				const y = this.limit === 0 ? height : height - ( line.points[ i ] / this.limit ) * height;
				if ( i === 0 ) {

					ctx.moveTo( x, y );

				} else {

					ctx.lineTo( x, y );

				}

			}

			ctx.stroke();

		}

		ctx.restore();

	}

	resolveColor( color ) {

		if ( color.startsWith( 'var(' ) ) {

			const varName = color.slice( 4, - 1 ).trim();
			const resolved = getComputedStyle( this.domElement ).getPropertyValue( varName ).trim();
			return resolved || null;

		}

		return color;

	}

	dispose() {

	}

}
