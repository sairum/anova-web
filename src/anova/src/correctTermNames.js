 
  /****************************************************************************/
  /*                                                                          */
  /*                          correctTermNames                                */
  /*                                                                          */
  /* After correcting for nesting, by pooling terms with similar uncorrected  */
  /* sums of squares ('ss'), the names of the terms should be changed to      */
  /* denote the nesting hierarchy. A term X nested into a term Y should be    */
  /* renamed X(Y). A term X nested into an interaction Y*Z should renamed     */
  /* X(Y*Z). After correcting the names the dfs of nested factors or          */
  /* interactions involving them should also be corrected.                    */
  /*                                                                          */
  /****************************************************************************/
  
  function correctTermNames() {

    //#DEBUG
    console.log('correctTermNames() called');
    //!DEBUG
      
    // For factors that are nested into others, correct the nesting depth
    // (number of factors where it is nested into, i.e. number of 'nestedin'
    // codes equal to one (1)). Take this opportunity to correct the levels
    // of nested factors. Usually the number of levels as computed from the
    // data file is much larger than the actual number of levels, and is
    // computed by dividing the observed levels by the number of levels of
    // factors where the nested factor is nested into.
    
    for ( let i = 0; i < nfactors; i++ ) {
      for ( let j = 0; j < nfactors; j++ ) {
        if( factors[i].nestedin[j] == 1 ) {
          factors[i].depth++;
          factors[i].nlevels /= factors[j].nlevels;  
        }
      }
    }    
    
    // Now, correct the names of the factors according to the nesting
    // hierarchy. To do this we need to build a list of terms ordered by
    // their nesting depth (i.e. how many factors/interactions are they nested
    // in) in ascending order (lower depths first). This is necessary because
    // we cannot mess with the order of the 'factors' and 'terms' arrays: the
    // first factor in array 'factors' (index 0) should correspond to the
    // first term in array 'terms' (with a similar index of 0), and so on.
    // The list will only contain terms which are nested into others
    
    let nfl = [];
    
    for (let i = 0; i < nfactors; i++) {
      let nested = factors[i].depth; 
      if ( nested > 0 ) {
        let f = {};
        f.index = i;
        f.codes = factors[i].nestedin;
        f.depth = factors[i].depth;
        f.name = factors[i].name;
        nfl.push(f);
      }  
    }
    
    // Sort nested factors from lowest nesting depths to highest nesting depths
    
    nfl.sort(function(a,b){return a.depth - b.depth; });
    
    // Eliminate redundant codes, i.e. those that are associated
    // with a factor which is already nested into another. As an
    // example consider the following 4 factor ANOVA in which
    // factor B is nested in A, and factor C ins nested in A and B
    //
    // i  Factor nestedin   depth
    // 0  A      [0,0,0,0]  0
    // 1  B      [1,0,0,0]  1
    // 2  C      [1,1,0,0]  2
    // 3  D      [0,0,0,0]  0
    //
    // For factor C, nesting in A is redundant because B (in which
    // it nested) is itself nested in A. The 'nestdin' for C should
    // be [0,1,0,0]. Why? Because the name for B will be replaced
    // by B(A) (its depth is 1, so this is done before renaming C,
    // which depth is 2). Now when we replace factor names in C,
    // there is only one to be replaced (B) and the term will be
    // named C(B(A))
    //
    // Now, suppose now that C is nested in the interaction A*B instead
    // (hence B would not be nested in A, since nested factors do not
    // created interactions with the factors where they are nested in).
    // The codes would be
    //
    // i  Factor nestedin   depth
    // 0  A      [0,0,0,0]  0
    // 1  B      [0,0,0,0]  0
    // 2  C      [1,1,0,0]  2
    // 3  D      [0,0,0,0]  0
    //
    // There are no redundancies in this set, and the name of C would
    // become C(A*B)
    ///
    
    for (let i = 0, len = nfl.length; i < len; i++) {
      
      // No need to check for redundancies in factors that
      // are nested into a single one
      
      if(nfl[i].depth > 1) { 
        for (let j = 0, len = nfl.length; j < len; j++) {
          if ( ( i != j ) && ( nfl[j].depth < nfl[i].depth ) ) { 
            for (let k = 0; k < nfactors; k++ ) {
              if ( ( nfl[i].codes[k] == 1 ) && ( nfl[j].codes[k] == 1 ) ) {
                let f = nfl[j].index;
                if (nfl[i].codes[f] == 1) nfl[i].codes[k] = 0; 
              } 
            }  
          }  
        }
        let nm = [];
        let j = nfl[i].index;
        for (let k = 0; k < nfactors; k++ ) {
          if( nfl[i].codes[k] == 1 ) nm.push(factors[k].name);  
        }
        factors[j].name += '(' + nm.join('&times;') + ')';
      } else {
        let j = nfl[i].codes.indexOf(1);
        let k = nfl[i].index;
        if ( j != -1 ) factors[k].name += '(' + factors[j].name + ')';
      }  
    }
   
    // Finally, replace the new names in all terms. Note that the two
    // last terms are the Error and the Total, so skip them!
    
    for (let i = 0, len = terms.length - 2; i < len; i++) {
      let nm = [];
      for ( let j = 0; j < nfactors; j++) {
        if (terms[i].codes[j] == 1 ) {
          nm.push(factors[j].name);   
        } 
      }
      terms[i].name = nm.join('&times;');
    }
    
    //console.table(terms);
  }
  
