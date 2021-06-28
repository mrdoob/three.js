const menuIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAABBUlEQVRo3u2WvU4CURSExx8qYyEsvdrQ2FhDqHgHwjtYGBofwyfYwkobOqOJnR0J9CQ8ApuYCN1mdagIFrILdxIXk/lut9m9Z3Lm3tkDGGOMKZmD3x/zz0odlt0BC7AACzje4p0empvyooAFXvEe9CXX64YZw0nZWu0UakEfR0KHK2irZ2AiWUzMVAsu+cbvQAM+GbOWb4F/RhZgAcUCLjD8eSt3WikeUVVzYESNWzWKz8Uen6kWPIgCxvpYfofrwOIZnvGUX8pRbAH/Yii9QidwKP3ACxI1CRucB6fgFxPW1SSMcSoYHKGrnoGpaLJsQcRB8FCa8J4nHkodRBZgAcYYY/acJSeXoRmfeo0hAAAAAElFTkSuQmCC';
const loremIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAABAElEQVRo3u2YPwrCMBSHf886iP8GjyB1cPEALuJhFB29QD2Bs5subh7BRTro5OYmiJuDi26CynORSqVCUopS+H1TmqTJl5dHaAoQQgghhKQDnagtntnIGUODorVzPlmBAoADBqijBEdERAT9t96rxkEFbYxxeb2R4BYsVbX5UdcLwh2aTEW7qjpJOgJDWZl1FcUUC9MImAooRubxkhu8pAVOeFjt2dayf6y8+JIDdmT+fcJQgAIUoAAFKEABCqRaIBtR+qlAOaL0OwEVuMGD+4/rak33wVfxTHNxx5EYK2+higY6oevnBnMcsZZd/EQy54ozfPgRLXf+yCCEEEJSyBOv83r47EDjlgAAAABJRU5ErkJggg==';
const cubeIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAACP0lEQVRo3u2YTUhUURTHf9c3YGNJ5kahKIQCaRUUCJlpi4ggaCFRYRK574Nsk4bQtFICJaSdCDJZ1CBpUBAUvJYtglZB60ApiKaPkcrptHgPeb6hufcOtyS4v7eYmTfn3vN/99xzzuWBx+PxeDzrjLIdIBn2Ww0oqtdOFcuo2BFWny9j6X6KgXWLliiZEBGRX5KXJqHqFZiuQJ2x+4BrXATKLKCZlD18NZ3XPASjDAIwzEeN5QGm2WA6bZ1x7CP3/UxoTHdxh50AzPDSiQAJ5CYDQJnzKq8xbuAt2wEIOUvRgQBRDDEIlLmuJjXGe1mKvz2hx1UIxskBcEnd0Fh2cpdGAKY47mgTruZ9v3bx27jHNgDyXOanq9wPxZYwUQ2eOqwDhizQbTfApA68YXLNiA7gFcspqxZGgHO2ik0EvON24lc9y8ADPqWs2hmpZclch8AL8AL+PwGZGsd18CN1J+qBXXxO3NvyNwScSLhL0hp3hG9rmrNjAVmOkQXgC+XUfxujQ/jqYSzLGXa7FdDIQZoAWORZRSluZxyYV/GBTcY4DMBDVwICDtECwHteVLhPd9E8fQCcVPddCeijHoDvPNZ1e5nlFAC9zLkJQQNHY/dFNE8kWXKcBkpcVXNu9sAmemiOY/9ca53jSnR8V7dc1YHNbAXgAyElje0sR6JkVQXXhWiFRxWpV0nsnoLptBmj7G8D5tlX1WpH/FliWBVwRQ2H0gv/phf8iV6TnW/xhkQCy3coKwqPx+PxeDweO34DF8AyISPfTH4AAAAASUVORK5CYII=';
const inventoryIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAABSUlEQVRo3u2YO0gDQRCGv5EUgiAIPlB89IIKdmJlYWOdwsIqrZ32YiMiWtrZ2MfGykrBPgoBRQwWomjAIGmCsQj+NjGkyUXW80Jgvmt22Fv237nZmb0Fx3Ecx3E6jEV3q9bujV+Qt/mgcRrXneLhVIMhAo4VHxutZunpdAy4gNQfxlb4aLT76U3aA0UyNvLzsE0lWQ+U2LSs0kwBkLM91TiI+etEbsM8aFUvdetGixC2DSPynCYZaNn5afcaY6hhP1lZcxGrebVS99UCTUR6oKDRJg88W1mzUSEb4IG2MbDfZK+FxkBXZ8IjruqtE86TFjCtQyuwTAm4JGNFXSSbiFKs650dGwZQn7IsJV8LtqjqGoA06U4UI9j184ALcAEuwAX8r4Az3mKa5ZZc2Ll4RV8x/Jg+aiH8fmAmhvVX7cEvYhzHcRzHac03U6+rmkQaPpAAAAAASUVORK5CYII=';

const backupCSS =
`body {

    --transition-speed: 0.5s;
    --menu-color: rgb(70, 92, 147);
    --back-color: rgb(25, 25, 25);
    --text-color: rgb(255, 255, 255);


    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    background-color: var(--back-color);
    color: var(--text-color);
    font-size: 1.67rem;
    

    overflow: hidden;

    margin: 0;
    margin-left: 4rem;

}


.menu {

    list-style-type: none;

    transition: width var(--transition-speed);

    font-size: 1.67rem;


    position: absolute;
    left: 0;
    top: 0;

    height: 100vh;
    width: 100vw; /* overwritten to 5rem in .menu.collapsed */

    box-shadow: 13rem 0 0 0 var(--menu-color) inset;

    margin: 0;

    padding-top: 6rem;
    padding-left: 0;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

}

.menu.collapsed { 

    width: 5rem; /* overwrites 100vw in .menu */

    box-shadow: 4rem 0 0 0 var(--menu-color) inset;

}

.menu > .screen-cover {

    background: linear-gradient(90deg, var(--menu-color) 0%, rgba(0, 0, 0, 0.001) 100%);

    opacity: 1.0; /* overwritten to 0.0 in .menu.collapsed > .screen-cover */

    transition: opacity var(--transition-speed), width var(--transition-speed), left calc( var(--transition-speed) / 4 );

    position: absolute;
    left: 12rem;
    top: 0;

    width: 100vw; /* overwritten to 0 in .menu.collapsed > .screen-cover */
    height: 100vh;

}

.menu.collapsed > .screen-cover {

    opacity: 0.0; /* overwrites 1.0 in .menu > .screen-cover */

    width: 0;  /* overwrites 100vw in .menu > .screen-cover */

    left: 4rem;
}


.menu img {

    width: 4rem;
    height: 4rem;
    flex-grow: 0;
    flex-shrink: 0;

    margin-right: 1rem;

    border: 0;

    transition: border-width var(--transition-speed);

}


.menu > img.hamburger {

    position: absolute;
    left: 0;
    top: 0;

}

.menu > img.hamburger:hover {

    transform: scale(1.25);

}

.menu > li {

    white-space: nowrap;


    position: relative;
    z-index: 100;

    height: 4rem;
    width: 10rem; /* overwritten to 4rem in .menu.collapsed > ul */

    margin-top: 1rem;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    color: var(--text-color); /* overwritten to transparent in .menu.collapsed > ul */

    transition: color var(--transition-speed);
}

.menu.collapsed > li {

    width: 4rem;

    color: transparent;

}

.menu > li:hover > img {

    border-right: 1rem solid rgba(255, 255, 255, 0.5);

}

.menu > li.selected > img {

    border-right: 1rem solid var(--text-color);

}

.panel {

    box-sizing: border-box;
    
    position: absolute;
    left: 8rem;
    top: 4rem;

    border: 1px solid white;

    height: calc( 100vh - 10rem );
    width: calc( 100vw - 10rem );

    padding: 2rem;

    overflow: hidden;

}

#css-cube {

    --face-size: 40vw;

    perspective: calc( var( --face-size ) * 2.0 );

}

#css-cube-container {

    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    transform-style: preserve-3d;
    transform: rotateX( 45deg ) rotateY( 45deg ) translateY( calc( -1.2 * ( var( --face-size ) / 2.0 ) ) ) translateX( calc( var( --face-size ) / 2.0 ) ) translateZ( calc( -1.0 * ( var( --face-size ) / 2.0 ) ) );

}

#css-cube-container > div {

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 4rem;

    width: var(--face-size);
    height: var(--face-size);

    position: absolute;
    left: calc( 50% - ( var( --face-size ) / 2.0 ) );
    top: calc( 50% - ( var( --face-size ) / 2.0 ) );

    box-sizing: border-box;

}

#css-cube-container > .face-1 {

    transform: rotateY( 0deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 255, 0, 0, 0.5 );
    border:5px solid rgb(255, 0, 0);

}

#css-cube-container > .face-2 {

    transform: rotateY( 90deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 0, 255, 0, 0.5 );
    border:5px solid rgb(0, 255, 0);

}

#css-cube-container > .face-3 {

    transform: rotateY( 180deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 0, 0, 255, 0.5 );
    border:5px solid rgb(0, 0, 255);

}

#css-cube-container > .face-4 {

    transform: rotateY( -90deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 255, 255, 0, 0.5 );
    border:5px solid rgb( 255, 255, 0);

}

#css-cube-container > .face-5 {

    transform: rotateX( 90deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 0, 255, 255, 0.5 );
    border:5px solid rgb( 0, 255, 255 );

}

#css-cube-container > .face-6 {

    transform: rotateX( -90deg ) translateZ( calc( var( --face-size ) / 2.0 ) );
    background-color: rgba( 255, 0, 255, 0.5 );
    border:5px solid rgb( 255, 0, 255 );

}

#lorem-ipsum {

    font-size: 1.67rem;

}`;
const backupJS =
`function toggleMenu() {

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

}`;
const backupHTML =
`<style>${backupCSS}</style>
<div class="panel" id="lorem-ipsum" style="display:block;">

    TODO: scroll events<br /><br />

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus, ex in bibendum tincidunt, dui elit tincidunt ante, sit amet imperdiet tortor arcu eu arcu. Fusce posuere justo ut velit pharetra volutpat. Curabitur dapibus felis a mi molestie semper. Fusce porttitor urna nec lorem sagittis, quis placerat massa posuere. Duis ut odio sed nulla eleifend pellentesque. Vivamus aliquam nulla quis sapien consequat finibus. Fusce tincidunt sem metus, ut dictum augue hendrerit sit amet. Duis urna arcu, egestas a nisi ac, blandit aliquet ipsum. In sit amet quam lectus. Mauris tempus nisi sem. Sed feugiat sapien elementum facilisis commodo. Suspendisse potenti. Aenean mollis sem eu augue semper, id tincidunt risus malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus.

</div>

<div class="panel" id="css-cube" style="display:none;">

    <div id="css-cube-container">
        <div class="face-1">1</div>
        <div class="face-2">2</div>
        <div class="face-3">3</div>
        <div class="face-4">4</div>
        <div class="face-5">5</div>
        <div class="face-6">6</div>
    </div>

</div>

<div class="panel" id="inventory" style="display:none;">

    This tab has not been created yet.<br />
    (This example is a work in progress.)

    <!-- <div class="item-description"></div>

    <div class="item-preview"></div>

    <div class="inventory-grid">

        <div class="item-cell empty"></div>

    </div> -->

</div>

<ul class="menu collapsed">

    <div class="screen-cover" onclick="toggleMenu()"></div>

    <!-- TODO: swap the menu icon out for an inline SVG -->
    <img class="hamburger"  onclick="toggleMenu()" src="${menuIcon}">

    <li class='selected' onclick="showPanel( 'lorem-ipsum' , this )"><img src="${loremIcon}">Lorem Ipsum</li>
    <li onclick="showPanel( 'css-cube' , this )"><img src="${cubeIcon}">CSS 3D Cube</li>
    <li onclick="showPanel( 'inventory' , this )"><img src="${inventoryIcon}">Inventory</li>

</ul>

<script>

    populateInventoryGrid();

</script>`;

export { backupHTML, backupJS };
