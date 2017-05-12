/**
* @author arodic / http://akirodic.com/
*/

/**
THREE.WebGLRenderer wrapper that manages GL rendering context across multiple instances of
THREE.WebGLSharedRenderer. All instances of this element will share a single WebGL canvas.
An element instance becomes a host of the canvas any time WebGL API is used through one of
its methods. Before this happens, the previous host needs to store the framebuffer data in a
2D canvas before the WebGL canvas can be handed out.

IMPORTANT: Keep in mind that WebGL canvas migration is expensive and should not be performed
continuously. In other words, you cannot render with mutliple instances of
THREE.WebGLSharedRenderer in realtime without severe performance penalties.
*/


( function() {

  var currentHost;

  var renderer, gl;
  /**
   * This function creates a single shared WebGLRenderer.
   */
  var _initWebGLRenderer = function( parameters ) {
    if ( !renderer ) {
      parameters.preserveDrawingBuffer = true;
      renderer = new THREE.WebGLRenderer( parameters );
      renderer.domElement.className = 'three-renderer';
      gl = renderer.getContext();
    }
  };

  var ctxPerfNow = 0;
  var ctxPerfDelta = 1000;
  var ctxPerfAverage = 1000;
  var ctxPerfWarned;

  /**
   * This function runs every time renderer migrates to another three-renderer host
   * It is designed to detect if migration feature is overrused by the user.
   */
  var _performanceCheck = function() {
    if ( ctxPerfWarned ) return;
    ctxPerfDelta = performance.now() - ctxPerfNow;
    ctxPerfAverage = Math.min( ( ctxPerfAverage * 10 + ctxPerfDelta ) / 11, 1000 );
    ctxPerfNow = performance.now();
    if ( ctxPerfAverage < 16 ) {
      console.warn( 'WebGLSharedRenderer performance warning: rendering multiple canvases!' );
      ctxPerfWarned = true;
    }
  };

  THREE.WebGLSharedRenderer = function ( parameters ) {

    parameters = parameters || {};

    _initWebGLRenderer( parameters );

    this._canvas2d = document.createElement( 'canvas' );
    this._context2d = this._canvas2d.getContext( '2d' );

    this.domElement = document.createElement( 'div' );
    this.domElement.appendChild( this._canvas2d );

    this.width = this._canvas2d.width;
    this.height = this._canvas2d.height;
    this.domElement.style.width = this.width + 'px';
    this.domElement.style.height = this.height + 'px';

    this.context = gl;

    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;
    this.sortObjects = true;
    this.gammaFactor = 2.0;	// for backwards compatibility
    this.gammaInput = false;
    this.gammaOutput = false;
    this.sortObjects = true;
    this.maxMorphTargets = 8;
    this.maxMorphNormals = 4;
    this.autoScaleCubemaps = true;

    var _clearColor = new THREE.Color( 0x000000 );
    var _clearAlpha = 1;

    /**
    * Renderer method that will be available on this element as proxy.
    * calling this method may triger renderer migration.
    */
    this.render = function () {
      this._setHost();
      renderer.render.apply( renderer, arguments );
    };

    this.setViewport = function() {
      renderer.setViewport.apply( renderer, arguments );
    };

    this.setPixelRatio = function() {
      renderer.setPixelRatio.apply( renderer, arguments );
    };

    this.clear = function() {
      this._setHost();
      renderer.clear.apply( renderer, arguments );
    };

    this.clearColor = function () {
      this._setHost();
      renderer.clearColor.apply( renderer, arguments );
    };

    this.clearDepth = function () {
      this._setHost();
      renderer.clearDepth.apply( renderer, arguments );
    };

    this.clearStencil = function () {
      this._setHost();
      renderer.clearStencil.apply( renderer, arguments );
    };

    this.clearTarget = function () {
      this._setHost();
      renderer.clearTarget.apply( renderer, arguments );
    };

    this._update = function() {
      renderer.autoClear = this.autoClear;
      renderer.autoClearColor = this.autoClearColor;
      renderer.autoClearDepth = this.autoClearDepth;
      renderer.autoClearStencil = this.autoClearStencil;
      renderer.gammaFactor = this.gammaFactor;
      renderer.gammaInput = this.gammaInput;
      renderer.gammaOutput = this.gammaOutput;
      renderer.sortObjects = this.sortObjects;
      renderer.maxMorphTargets = this.maxMorphTargets;
      renderer.maxMorphNormals = this.maxMorphNormals;
      renderer.autoScaleCubemaps = this.autoScaleCubemaps;
      renderer.setClearColor( _clearColor );
      renderer.setClearAlpha( _clearAlpha );
    };

    this.setSize = function( width, height ) {
      this._setHost();
      this.width = width;
      this.height = height;
      this._canvas2d.width = width;
      this._canvas2d.height = height;
      this.domElement.style.width = width + 'px';
      this.domElement.style.height = height + 'px';
      renderer.setSize( width, height );
    };

    this.setClearColor = function ( clearColor ) {
      _clearColor = clearColor;
    };

    this.setClearAplha = function ( clearAlpha ) {
      _clearAlpha = clearAlpha;
    };

    this.getClearColor = function ( clearColor ) {
      return _clearColor;
    };

    this.getClearAplha = function ( clearAlpha ) {
      return _clearAlpha;
    };

    this._setHost = function() {
      if ( this !== currentHost ) {
        _performanceCheck();
        if ( currentHost ) {
          currentHost._canvas2d.style.display = 'inline-block';
          currentHost._context2d.drawImage( renderer.domElement, 0, 0, currentHost._canvas2d.width, currentHost._canvas2d.height );
          gl.flush();
        }
        currentHost = this;
        this.domElement.appendChild( renderer.domElement );
        this._canvas2d.style.display = 'none';
        this.setSize( this.width, this.height );
      }
      this._update();
    };

  };

  THREE.WebGLSharedRenderer.prototype.constructor = THREE.WebGLSharedRenderer;

}());
