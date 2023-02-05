const BenchClass = function () {

	this.suites = [];
	this.THREE = window.THREE;
	window.THREE = undefined;
	Benchmark.options.maxTime = 1.0;
	return this;

};

BenchClass.prototype.isTHREELoaded = function () {

	return _.isObject( this.THREE ); // eslint-disable-line no-undef

};

BenchClass.prototype.newSuite = function ( name ) {

	const s = new Benchmark.Suite( name );
	this.suites.push( s );
	return s;

};

BenchClass.prototype.display = function () {

	for ( const x of this.suites ) {

		const s = new SuiteUI( x );
		s.render();

	}

};

BenchClass.prototype.warning = function ( message ) {

	console.error( message );

};

const SuiteUI = function ( suite ) {

	this.suite = suite;
	this.isRunning = false;
	return this;

};

SuiteUI.prototype.render = function () {

	const n = document.importNode( this.suiteTemplate, true );
	this.elem = n.querySelector( 'article' );
	this.results = n.querySelector( '.results' );
	this.title = n.querySelector( 'h2' );
	this.runButton = n.querySelector( 'h3' );

	this.title.innerText = this.suite.name;
	this.runButton.onclick = this.run.bind( this );

	this.section.appendChild( n );

};

SuiteUI.prototype.run = function () {

	this.runButton.click = _.noop; // eslint-disable-line no-undef
	this.runButton.innerText = 'Running...';
	this.suite.on( 'complete', this.complete.bind( this ) );
	this.suite.run( {
		async: true
	} );

};

SuiteUI.prototype.complete = function () {

	this.runButton.style.display = 'none';
	this.results.style.display = 'block';
	const f = _.orderBy( this.suite, [ 'hz' ], [ 'desc' ] ); // eslint-disable-line no-undef
	for ( let i = 0; i < f.length; i ++ ) {

		const x = f[ i ];
		const n = document.importNode( this.suiteTestTemplate, true );
		n.querySelector( '.name' ).innerText = x.name;
		n.querySelector( '.ops' ).innerText = x.hz.toFixed();
		n.querySelector( '.desv' ).innerText = x.stats.rme.toFixed( 2 );
		this.results.appendChild( n );

	}

};

const Bench = new BenchClass();
window.addEventListener( 'load', function () {

	SuiteUI.prototype.suiteTemplate = document.querySelector( '#suite' ).content;
	SuiteUI.prototype.suiteTestTemplate = document.querySelector( '#suite-test' ).content;
	SuiteUI.prototype.section = document.querySelector( 'section' );

	Bench.display();

} );
