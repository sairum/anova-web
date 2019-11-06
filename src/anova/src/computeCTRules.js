
  
  /*************************************************************************/
  /*                                                                       */
  /*                            computeCTRules                             */
  /*                                                                       */
  /* This function computes Cornfield-Tukey Rules that will determine the  */
  /* denominators of the F statistics in any ANOVA scenario. For a fully   */
  /* orthogonal ANOVA with fixed factors, the denominator for all tests is */
  /* the Error term. For mixed or more complex models the denominator      */
  /* changes according to the CT rules                                     */
  /*                                                                       */ 
  /*************************************************************************/

  function computeCTRules() {
    
    /*
     * Build the table of multipliers for all terms
     * Skip the last two terms. The "total" is not necessary
     * and the ct_codes for the "Error" are already computed
     * [1,1,...,1] for all factors
     */
      
    for ( let i = 0, tl = terms.length - 2; i < tl; i++ ) {
      terms[i].ct_codes = new Array(nfactors+1).fill(0);
      for ( let k = 0; k < nfactors; k++ ) {
        let t = terms[i].codes[k];
        if( t != 0 ) {
            
          /*
           * subscript is in the term
           */
          
          if ( t == 1 ) {
              
            /*
             * it's outside parenthesis
             */
            
            if (factors[k].type === RANDOM) terms[i].ct_codes[k] = 1;
            else terms[i].ct_codes[k] = 0; 
          } else {
              
            /*
             * subscript is within parenthesis
             */
            
            terms[i].ct_codes[k] = 1;  
          } 
        } else {
            
          /*
           * This subscript is not in the term
           */
          
          terms[i].ct_codes[k] = factors[k].nlevels;
        }  
      }
      terms[i].ct_codes[nfactors] = replicates;
    }  
    
    /*
     * Now check wich components contribute to the MS
     * of each term, including the "Error"
     */

    let tl = terms.length - 1;
    for ( let i = 0; i < tl; i++ ) {
        
      /*
       * 'i' is the 'current' component term and should be checked 
       * against all other component terms
       */
      
      for ( let j = 0; j <tl; j++ ) {
        
        /*
         * 'j' is the component term being compared
         * with the current term 'i'
         */
        
        let included = true;
        for ( let k = 0; k < nfactors + 1; k++) {
          if ( ( terms[i].codes[k] > 0 ) && ( terms[j].codes[k] == 0) ) {
            included = false;
            break;
          }  
        }
        if (included) terms[i].varcomp.push(1); 
        else terms[i].varcomp.push(0); 
      }
    }
    
    /* Finally, update the included terms according to the 
     * multipliers of 'ct_codes'. We can skip the "Error"
     * term. For each target 'term' denoted by 'i', compare
     * it with the current 'term', denoted by 'j'. If the 
     * current 'term' contains all the subscripts of 'i'
     * the multiplier for this particular source of variation
     * in the target term is the product of all coeficients
     * of 'j' excluding those which subscripts are present
     * in 'i'.
     */
    
    for ( let i = 0; i < tl; i++ ) {
      for ( let j = 0; j < tl; j++) {
        if( terms[i].varcomp[j] == 1 ) {
          let product = 1;
          for ( let k = 0; k < nfactors + 1; k++) {
            if ( terms[i].codes[k] == 0 ) {
              product *= terms[j].ct_codes[k]; 
            }  
          }
          terms[i].varcomp[j] = product;
        }  
      }    
    }
    
    /* 
     * Now check what are the denominators of the F tests.
     * For each term (excluding the "Error" and "Total"
     * compare them with all others
     */ 
    
    tl = terms.length;
    
    for ( let i = 0; i < tl - 2; i++ ) {
      
      /*
       * for each term 'i' start from the bottom
       * and check if the 'varcomp' of term 'j'
       * has all the components of 'varcomp' for
       * term 'i' except for 'i' itself
       */
      
      //console.log("For " + terms[i].name)
      for ( let j = tl - 2; j >= 0; j-- ) {
        //console.log("  Compare with " + terms[j].name)
        let found = true;
        if (i != j ) {
          for ( let k = 0, vl = terms[i].varcomp.length; k < vl; k++ ) {
            if (k != i) {
              if ( terms[i].varcomp[k] != terms[j].varcomp[k] ) {
                found = false 
                break;
              }
            }
          }
        } else {
          found = false;
        }  
        if (found) {
          terms[i].against = j;
          terms[i].F = terms[i].MS/terms[j].MS;
          terms[i].P = 1 - jStat.centralF.cdf(terms[i].F, terms[i].df, terms[j].df);
          break;
        } else {
          terms[i].against = -1;
          terms[i].F = NaN;
          terms[i].P = NaN;      
          
        }  
      }  
    }  
    
    displayCTRules();
  }
