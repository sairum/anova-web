  
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
    //console.log(rejection_level)
    
    /*
     * We should redisplay the ANOVA table as some of the
     * terms may now be statistically significant. Moreover,
     * multiple tests may also have to be run again...
     */
     
    displayANOVA();
    
  }
  
  function setMtAlpha() {
    mt_rejection_level = parseFloat(document.getElementById('mtests_alpha').value);
    if(rejection_level > 1) rejection_level = 0.9999999;
    if(rejection_level < 0) rejection_level = 0.0000001;
    //console.log(mt_rejection_level)
    
    /*
     * We should redisplay the ANOVA table as some of the
     * terms may now be statistically significant. Moreover,
     * multiple tests may also have to be run again...
     */
    buildMultipleComparisons();
    multipleTests();
    //displayANOVA();
    
  }
