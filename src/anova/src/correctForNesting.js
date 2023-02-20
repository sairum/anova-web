   
  /****************************************************************************/
  /*                                                                          */
  /*                           correctForNesting                              */
  /*                                                                          */
  /* A factor can be nested in another factor or in an interaction of two or  */
  /* more factors. This function checks if the uncorrected sums of squares    */
  /* of a pair of terms is the same. In this case, if one of the terms denote */
  /* a single factor (the other denoting an interaction where this factor is  */
  /* involved) it means that the single factor is nested into any other       */
  /* factor participating in the interaction. If the interaction is of first  */
  /* order (two factors involved) the nesting factor is mandatorily the one   */
  /* which is not designated by the term that denotes a single factor. For    */
  /* complex designs, for example, those with factors nested into             */
  /* interactions, the process is more tricky. See details within the code of */
  /* this function.                                                           */
  /*                                                                          */
  /****************************************************************************/
  
  function correctForNesting() {


    //#DEBUG
    console.log('correctForNesting() called');
    //!DEBUG

    // No need to check for nesting if there is only one factor,
    // or if there is no hint on nested factors ('nested' == false).
    // The latter is determined in the 'getPartialSS' function
    // by comparing the observed number of levels of each term
    // with the expected number of levels given a simple fully
    // orthogonal analysis.
    
    if( ( nfactors == 1 ) || (!nesting) ) return;
    
    // Start by caching the current term in variable 'current'
    
    let current = 0; 
    
    // Skip the two last terms, the 'Total' and the 'Error' terms!
    
    while(current < terms.length - 2) {
      
      // Cache the term being compared (target) in variable 'c'
      
      let c = current + 1;
      
      // Skip the two last terms, the 'Total' and the 'Error' terms!
      
      while (c < terms.length - 2) {
          
        // console.log('Comparing ' + current.toString() +
        //             ' with ' + c.toString());
          
        if( terms[current].ss == terms[c].ss ) {
            
          // If the uncorrected sums of squares are similar the 'current'
          // term is nested into a term involved in term 'c' (which is
          // mandatorly an interaction in a fully orthogonal analysis).
          // Now compare the two terms to find out if the 'current' is
          // nested in another factor or within an interaction of factors.
          
          for ( let k = 0; k < nfactors; k++ ) {
            if ( ( terms[c].codes[k] != terms[current].codes[k] ) ) {
                
              // In the current term, we set the code's column 'k' to 2 (two)
              // to denote that factor 'k' nests a factor involved in this
              // term. Thre may be multiple 'k's if the 'current' term
              // involves a factor nested in an interaction between two or
              // more factors. This notation will come in handy to compute
              // Cornfield-Tukey Rules later on
              
              terms[current].codes[k] = 2;
              
              // If the 'current' term denotes a main factor ('order' == 1),
              // having another term measuring the same amount of variation
              // (uncorrected 'ss') means that the former is a nested factor.
              // Its 'type' should be changed to 'random', and the list of
              // terms where it is nested in should be updated.
              
              if ( terms[current].order == 1 ) {
                  
                //console.log(current.toString() + ' is nested in ' +
                //            k.toString());
                  
                factors[current].nestedin[k] = 1;
                factors[current].type = RANDOM;
                
                // correcting levels of this term will be done later during
                // the correction of term's names
                
              }   
            }
          }
          
          // Accummulate the corrected sums of squares ('SS'). Use the
          // 'averages', 'levels', 'sumx', and 'sumx2' of the higher order
          // term, and then delete it from the list of terms
          
          terms[current].SS += terms[c].SS;
          terms[current].averages = terms[c].averages;
          terms[current].sumx = terms[c].sumx;
          terms[current].sumx2 = terms[c].sumx2;
          terms[current].levels = terms[c].levels;
          terms[current].nlevels = terms[c].nlevels;
          terms[current].combins = terms[c].combins;
          
          // Remove the redundant term
          
          terms.splice(c, 1);  
             
          //console.log('Removing ' + c.toString());
          
        } else {
          
          // We only increment 'c' if no term was deleted from
          // the list. If there was a deletion, the next term
          // in the list (if any) will occupy the position of
          // the deleted term
          
          c++;            
        }
      } 
      current++;  
    }
    
    //#DEBUG    
    displayFactors( factors );
    displayTerms('Terms before correcting for nesting', terms);
    //!DEBUG
    
    correctTermNames();

    // Finally, correct the degrees of freedom of each term.
    // Skip the two last terms, the 'Total' and the 'Error' term!
     
    for (let i = 0, tl = terms.length - 2; i < tl; i++) {
      terms[i].df = 1;
      for (let k = 0; k < nfactors; k++) {
        if( terms[i].codes[k] == 1 ) terms[i].df *= factors[k].nlevels - 1;
        if( terms[i].codes[k] == 2 ) terms[i].df *= factors[k].nlevels;   
      }  
      terms[i].MS = terms[i].SS/terms[i].df;
    }
    
  }
  
