
function toggleMenu() {

    const menu = document.querySelector( ".menu" );

    if( menu.classList.contains( "collapsed" ) ) menu.classList.remove( "collapsed" );

    else menu.classList.add( "collapsed" );

}

function showPanel( id, menuButton ) {

    for( const panel of [ ...document.querySelectorAll( '.panel' ) ] ) {

        panel.style.display = 'none';

    }

    for( const menuButton of [ ...document.querySelectorAll( '.menu > li' ) ] ) {

        menuButton.classList.remove( 'selected' );

    }


    const panel = document.getElementById( id );

    menuButton.classList.add( 'selected' );


    if( id === 'lorem-ipsum' ) panel.style.display = 'block';

    if( id === 'css-cube' ) panel.style.display = 'flex';

    if( id === 'inventory' ) panel.style.display = 'grid';

}

function populateInventoryGrid() {

    const grid = document.getElementById( 'inventory-grid' );

    //TODO

}