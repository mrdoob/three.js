/**
 * @author munrocket / https://github.com/munrocket
 */

( function () {


  /* Start VR pages */

  let button = document.getElementById( 'startButton' );
  if ( button ) {

    button.click();

  }


  /* Remove dat.gui and fonts */

  let style = document.createElement( 'style' );
  style.type = 'text/css';
  style.innerHTML = `body { font size: 0 !important; }
      #info, button, input, body > div.dg.ac, body > div.lbl { display: none !important; }`;
  let head = document.getElementsByTagName( 'head' );
  if ( head.length > 0 ) {

    head[ 0 ].appendChild( style );

  }


  /* Remove stats.js */

  let canvas = document.getElementsByTagName( 'canvas' );
  for ( let i = 0; i < canvas.length; ++ i ) {

    if ( canvas[ i ].height === 48 ) {

      canvas[ i ].style.display = 'none';

    }

  }

}() );
