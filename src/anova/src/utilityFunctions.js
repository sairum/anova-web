  
  /*************************************************************************/
  /*                                                                       */
  /*                         utilityFunctions                              */
  /*                                                                       */
  /* This file joins a group os small functions necessary for the program  */
  /* normal operation                                                      */
  /*                                                                       */
  /*************************************************************************/


  /*************************************************************************/
  /*                                                                       */
  /*                             setAlpha                                  */
  /*                                                                       */
  /* This function sets/changes the rejection criterion (alpha) for the    */
  /* ANOVA by reading the provided value in the <input> tag with 'id'      */
  /* 'alpha'. The only effect is to render any statistical tests with      */
  /* probabilities smaller than 'rejection_level' in italics, to identify  */
  /* them from non-significant tests                                       */
  /*                                                                       */
  /*************************************************************************/
  
  function setAlpha() {
    rejection_level = parseFloat(document.getElementById('anova_alpha').value);
    if(rejection_level > 1) rejection_level = 0.9999999;
    if(rejection_level < 0) rejection_level = 0.0000001;
    
    // We should redisplay the ANOVA table as some of the
    // terms may now be statistically significant. Moreover,
    // multiple tests may also have to be run again...
     
    displayANOVA();
    
  }

  /*************************************************************************/
  /*                                                                       */
  /*                           setMTAlpha                                  */
  /*                                                                       */
  /* This function sets/changes the rejection criterion (alpha) for the    */
  /* _a_posteriori_ Multiple Comparison Tests. The criterion is necessary  */
  /* because while comparing pairs of averages, starting on the two most   */
  /* different (in magnitude) one has to decide when they are equal (thus  */
  /* stopping the whole sets of comparisons) or not, moving on to other    */
  /* compariosns                                                           */
  /*                                                                       */
  /*************************************************************************/


  function setMtAlpha() {
    let mta = document.getElementById('mtests_alpha').value;
    if ( mta != null ) {
      mt_rejection_level = parseFloat(mta);
      if ( mt_rejection_level != NaN) {
        if(rejection_level > 1) rejection_level = 0.9999999;
        if(rejection_level < 0) rejection_level = 0.0000001;

        console.log(mt_rejection_level)

        // We should redisplay the ANOVA table as some of the
        // terms may now be statistically significant. Moreover,
        // multiple tests may also have to be run again...

        buildMultipleComparisons();
        multipleTests();
      } else {

        // someone failed to provide a usable rejection level!
        // Reset it to default
        mt_rejection_level = DDEFAULT_REJECTION_LEVEL;
      }
    }
  }

  /*************************************************************************/
  /*                                                                       */
  /*                          ignoreInteractions                           */
  /*                                                                       */
  /*  Setting 'ignoreinteractions' to false, will show results of          */
  /*  _a_posteriori_ multiple comparison tests for factors involved in     */
  /*  significant interactions with other factors. This is not the correct */
  /*  behaviour                                                            */
  /*                                                                       */
  /*************************************************************************/

  function ignoreInteractions() {

    let h = document.getElementById("ignore_interactions");

    if ( ignoreinteractions === false ) ignoreinteractions = true;
    else ignoreinteractions = false;

  }


  /*************************************************************************/
  /*                                                                       */
  /*                               resetData                               */
  /*                                                                       */
  /* Here, we use the saved data values for each entry in the data list to */
  /* reset the transformed values. Note that after resetting the data it   */
  /* is necessary to clean all the intermediate calculation structures and */
  /* redo the analysis again!                                              */
  /*                                                                       */
  /*************************************************************************/

  function resetData() {

    let h = document.getElementsByClassName("tabcontent");
    for ( let i = 0, len = h.length; i < len; i++ ) h[i].innerHTML = "";

    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;

    for( let i = 0; i < data.length; i++ ) {
      data[i].value = data[i].original;
      if ( data[i].value > max_value ) max_value = data[i].value;
      if ( data[i].value < min_value ) min_value = data[i].value;
    }

    cleanVariables();

    // Start the ANOVA by computing 'partials' and then
    // computing the 'terms' of the analysis

    computePartials();

    displayData();
  }


  /****************************************************************************/
  /*                                                                          */
  /*                               resetAnalysis                              */
  /*                                                                          */
  /*  This function clears all 'global' variables of this module (anova) and  */
  /*  also clears the DOM nodes related with the ANOVA                        */
  /*                                                                          */
  /****************************************************************************/

  function resetAnalysis() {

    //#DEBUG
    console.log('resetAnalysis() called');
    //!DEBUG

    // Clear results in all <divs> of class 'anovaTabContents' which are
    // children of <div id='anova'>

    let s = document.getElementsByClassName('tabcontent')
    for( let i = 0, len = s.length; i < len; i++) {
      if (typeof(s[i]) !== 'undefined' && s[i] !== null) s[i].innerHTML = '';
    }

    // Reset main variables

    nfactors = 0;
    factors  = [];
    data     = [];
    partials = [];
    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: 'Error', df: 0, ss: 0};
    nesting = false;
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
  }

  /*************************************************************************/
  /*                                                                       */
  /*                        cleanVariables                                 */
  /*                                                                       */
  /* Everytime we reset or transform data we ned to recompute all main     */
  /* variables for the ANOVA and eventually _a_posteriori_ multiple tests  */
  /*                                                                       */
  /*************************************************************************/

  function cleanVariables() {

    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }

    partials = [];
    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;

  }

