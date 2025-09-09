
export class Graph {

	constructor( maxPoints = 512 ) {

		this.maxPoints = maxPoints;
		this.lines = {};
		this.limit = 0;
		this.limitIndex = 0;

		this.domElement = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		this.domElement.setAttribute( 'class', 'graph-svg' );

	}

	addLine( id, color ) {

		const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'class', 'graph-path' );
		path.style.stroke = `var(${color})`;
		path.style.fill = `var(${color})`;
		this.domElement.appendChild( path );

		this.lines[ id ] = { path, color, points: [] };

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

		const svgWidth = this.domElement.clientWidth;
		const svgHeight = this.domElement.clientHeight;
		if ( svgWidth === 0 ) return;

		const pointStep = svgWidth / ( this.maxPoints - 1 );

		for ( const id in this.lines ) {

			const line = this.lines[ id ];

			let pathString = `M 0,${ svgHeight }`;
			for ( let i = 0; i < line.points.length; i ++ ) {

				const x = i * pointStep;
				const y = svgHeight - ( line.points[ i ] / this.limit ) * svgHeight;
				pathString += ` L ${ x },${ y }`;

			}

			pathString += ` L ${( line.points.length - 1 ) * pointStep},${ svgHeight } Z`;

			const offset = svgWidth - ( ( line.points.length - 1 ) * pointStep );
			line.path.setAttribute( 'transform', `translate(${ offset }, 0)` );
			line.path.setAttribute( 'd', pathString );

		}

		//

		if ( this.limitIndex ++ > this.maxPoints ) {

			this.resetLimit();

		}

	}

}
