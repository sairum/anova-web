  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    reset: reset,
    sampleNormal: sampleNormal,
    sampleNormalNTimes: sampleNormalNTimes,
    setVar: setVar,
    setSTD: setSTD,
    setPrecision: setPrecision,
    multipleFTests: multipleFTests,
    multipleTTests: multipleTTests,
    tTest: tTest,
    FTest: FTest,
    setupForms: setupForms
  } // End of 'return' (exported function)
  
})();


/*************************************************************************/
/*                                                                       */
/* Function used to 'simulate' a tab behaviour for each menu entry in    */
/* the main bar                                                          */
/*                                                                       */
/*************************************************************************/

function selectTab( name ) {

  let tabs = document.getElementsByClassName('tabs');

  for (let t of tabs ) {
    if( t.name == name ) {
      t.classList.toggle('selected');
    }
    else t.classList.remove('selected');
  }

  // Get all elements with class='tabcontent' and hide them
  // showing only the one selected
  let tabcontent = document.getElementsByClassName('tabcontent');

  for (let t of tabcontent ) {
    if ( t.id == name ) {
      t.style.display = 'block';
    }
    else t.style.display = 'none';
  }

  // Enable main tab contents if hidden

  tabs = document.getElementById('tab-contents');
  tabs.style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function () {

  // Hide all tab contents
  let elem = document.getElementsByClassName('tabcontent');
  for (let el of elem ) el.style.display = 'none';

  ui.setupForms();

  
});    
