  /*************************************************************************/
  /*                                                                       */
  /* Here, we use the saved data values for each entry in the data list to */
  /* reset the transformed values.                                         */
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
    
    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }
    
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    
    displayData();
        
    /*
     * Start the ANOVA by computing 'partials' and then
     * computing the 'terms' of the analysis
     */
        
    computePartials(); 
  }
