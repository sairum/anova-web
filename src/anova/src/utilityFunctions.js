  
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

    if ( ignoreinteractions === false ) ignoreinteractions = true;
    else ignoreinteractions = false;

  }

  /*************************************************************************/
  /*                                                                       */
  /*                             useAlpha                                  */
  /*                                                                       */
  /*  Use a rejection criterium (alpha) to establish if a given p-value is */
  /*  "statistically significant" or not. If checked, the p-values will be */
  /*  displayed in bold and emphasized font whenever they are lower than   */
  /*  the criterium defined below                                          */
  /*                                                                       */
  /*************************************************************************/

  function useAlpha() {

    if ( alpha === false ) alpha = true;
    else alpha = false;

    displayANOVA();

  }

  /*************************************************************************/
  /*                                                                       */
  /*                               resetData                               */
  /*                                                                       */
  /*  Here, we use the saved data values for each cell in the 'data'       */
  /*  structure to reset the transformed values. Note that after resetting */
  /*  the data it is necessary to clean all the intermediate calculation   */
  /*  structures and redo the analysis again!                              */
  /*                                                                       */
  /*************************************************************************/

  function resetData() {

    let tabs = document.getElementsByClassName("tabcontent");
    // clean all 'tabs' of class 'tabcontent' because they will be
    // overwritten, except for the one with data transformations
    // with 'id' == 'datatab'. For this one, we just
    for ( let t of tabs ) {
      if( tabs.id != 'datatab' ) tabs.innerHTML = "";
    }

    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;

    for( let d of data ) {
      for ( let i = 0; i < d.values.length; i++ ){
        d.values[i] = d.originals[i];
      }
      for( let v of d.values ) {
        if ( v > max_value ) max_value = v;
        if ( v < min_value ) min_value = v;
      }
    }
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

    let elems = document.getElementsByClassName('tabcontent')
    for( let s of elems ) {
      if (typeof(s) !== 'undefined' && s !== null) s.innerHTML = '';
    }

    // Reset main variables

    nfactors = 0;
    factors  = [];
    data     = [];
    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates   = 0;
    total    = {df: 0, ss: 0};
    residual = {name: 'Error', df: 0, ss: 0};
    nesting = false;
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
  }



