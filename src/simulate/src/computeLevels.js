  
  /*
   * Build a list of all possible combinations of levels 
   * of factors assuming that all are orthogonal. Nested
   * factor's levels do not combine with all the levels 
   * of the factors they'r nested in. This is corrected 
   * later on by recodeNestedFactors();
   */
  
  function computeLevels( f ) {
    if ( f == 0 ) combins = [];  
    if( f < factors.length ) {   
      if(typeof partial[f] === 'undefined') partial[f] = 0;  
      for (let i = 0; i < factors[f].levels; i++ ) {
        partial[f] = i;    
        computeLevels( f + 1 );
      }  
    } else {
        // Deep copy 'partial', otherwise combins array
        // will only have the last 'partial' created in
        // all its slots, because it's copied by reference!
        let t = [...partial];
        combins.push(t);
    }    
  }
  
 
