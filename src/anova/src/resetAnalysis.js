
  /*************************************************************************/
  /*                                                                       */
  /*                             resetAnalysis                             */
  /*                                                                       */
  /* This function clears all 'global' variables of this module (anova)    */
  /* and also clears the DOM nodes related with the ANOVA                  */
  /*                                                                       */  
  /*************************************************************************/    
  
  function resetAnalysis() {
      
    /*
     * Clear results in all <divs> of class 'anovaTabContents' which are children
     * of <div id='anova'>
     */
    
    let s = document.getElementsByClassName('tabcontent')
    for( let i = 0, len = s.length; i < len; i++) {
      if (typeof(s[i]) !== 'undefined' && s[i] !== null) s[i].innerHTML = "";
    }

    
    /*
     * Reset main variables
     */
    
    nfactors = 0;
    factors  = [];
    data     = [];
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
  }

