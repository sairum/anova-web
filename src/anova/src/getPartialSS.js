  
  /*************************************************************************/
  /*                                                                       */
  /*                            getPartialSS                               */
  /*                                                                       */
  /* This function computes uncorrected sums of squares (ss) and then      */
  /* transform these into corrected sums of squares (SS). The algorithm    */
  /* is complex but is explained inside!                                   */
  /*                                                                       */
  /*************************************************************************/ 
 
  function getPartialSS() {  
    
    /*     
     * We will use these two lengths a lot, so cache them
     */
    
    let tl = terms.length, pl = partials.length;
    
    /*
     * Now, go along all terms...
     */
    
    for( let i = 0; i < tl; i++ ) {
      
      /*
       * Extract the 'codes' for the current term. These are in the form 
       * of an array with ones (for each factor included) and zeros (for 
       * each factor excluded). Note that there is an additional code for 
       * the "Error" in the end which is always 0 except for the "Error" 
       * term itself. For a three-way ANOVA, [1,0,0,0], [0,1,0,0] and 
       * [0,0,1.0] correspond to main factors, [1,1,0,0], [1,0,1,0], and
       * [0,1,1,0] correspond to first order interactions, and [1,1,1,0] 
       * corresponds to the unique second order interaction.   
       */
      
      let c = terms[i].codes;
      
      /*
       * Compute the name of the 'term' by combining all names of included 
       * factors separated by '*'. 'nm' will hold the final name of the 
       * current term ('i')
       */
      
      let nm = [];
      
      for( let j = 0, l = c.length; j < l; j++ ) {
        if( c[j] == 1 ) nm.push( factors[j].name );
      }
      
      terms[i].name = nm.join('*');
      
      /*
       * For each term 'i' accummulate 'sumx', 'sumx2' and 'n' of for all 
       * different levels (or combinations of levels) of factors included 
       * in it. This is done by extracting from each 'partial' the 
       * information about the different level codes filtered by a variable
       * 't' which excludes all factors not included in the current term 'i'. 
       * 
       * Go along all 'partials'...
       */
      
      for( let j = 0; j < pl; j++ ) {
        
        /*
         * Read 'partials[].codes' but exclude information for factors 
         * not in term 'i'  
         */
        
        let t = [];
        
        for( let k = 0; k < nfactors; k++ ) {
          if( c[k] === 1 ) t.push( partials[j].codes[k] );
          else t.push( '-' );
        } 
        
        /*
         * Verify if the combination of 't' codes already exists in the 
         * 'terms[i].levels' array
         */
        
        let idx = terms[i].levels.indexOf( t.toString() );

        if( idx != -1 ) {
            
          /*
           * These combination of code levels is already in the 
           * 'terms[i].levels' array. Accumulate 'sumx', 'sumx2', 
           * and 'n' on the respective slot of the array ('idx')
           */
          
          terms[i].sumx[idx] += partials[j].sumx;
          terms[i].sumx2[idx] += partials[j].sumx2;
          terms[i].n[idx] += partials[j].n;
          
        } else { 
          
          /*
           * Else create a new combination of levels
           */
          
          terms[i].levels.push(t.toString());
          terms[i].sumx.push(partials[j].sumx);
          terms[i].sumx2.push(partials[j].sumx2);
          terms[i].n.push(partials[j].n);
          terms[i].nlevels++;
        }
      }
      
      /*
       * If there is nesting of factors inside other factors or within 
       * interactions, the number of levels of a term denoting an 
       * interaction will differ from the expected number of combinations 
       * computed using al the levels of the terms involved in such 
       * interaction. If so, we set variable 'nesting' to true. This will 
       * be later used to correct SS terms taking into account nesting, 
       * because in such a case some terms will be redundant, measuring
       * the same uncorrected sums of squares ('ss').
       */
      
      if( terms[i].nlevels != terms[i].combins ) nesting = true;
      
      /*
       * Change the name of the "Error" to "Residual" if there are
       * nested factors
       */
      
      if( nesting ) residual.name = "Residual";       
      
      /*
       * Now, for this particular term, check if the replicates ('n') for all 
       * levels or level combinations are similar. If not, the analysis is 
       * asymmetric and cannot be completed!
       */
      
      for( let j = 0, nl = ( terms[i].n.length - 1 ); j < nl; j++ ) {
        if( terms[i].n[j] != terms[i].n[j+1] ) {
          alert("Asymmetrical data set. Analysis stopped!"); 
          return false;
        }  
      }
      
      /*
       * Compute averages and uncorrected sums of squares (ss) for each 
       * combination of code levels.
       */
      
      for( let j = 0, nl = terms[i].nlevels; j < nl; j++ ) {
        terms[i].average[j] = terms[i].sumx[j]/terms[i].n[j];
        terms[i].ss += terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/terms[i].n[j];
      }
      
      /*
       * Now recompute corrected partial sums of squares (SS) for all terms 
       * by subtracting from the error term all partial 'ss' of terms 
       * (factors and interactions) involved in a given term. For example, 
       * consider the following three factor ANOVA list of partials, with
       * factors A, B, and C (note that the last column in codes corresponds 
       * to the "Error" term which is not a factor)
       * 
       *  residuals.ss = 100
       * 
       *  i     codes       ss
       * ------------------------
       *  0 [1, 0, 0, 0] {ss: 10}   // A
       *  1 [0, 1, 0, 0] {ss: 20}   // B
       *  2 [0, 0, 1, 0] {ss: 15}   // C
       *  3 [1, 1, 0, 0] {ss: 25}   // A*B
       *  4 [1, 0, 1, 0] {ss: 18}   // A*C
       *  5 [0, 1, 1, 0] {ss: 14}   // B*C
       *  6 [1, 1, 1, 0] {ss: 12}   // A*B*C
       *  7 [1, 1, 1, 1]            // Error term, 'ss' is in 'residual.ss'
       * 
       * The SS for 'B' ('codes' = [0,1,0,0] and 'i' = 1) is:
       * 
       * residual.ss - terms[1].ss => 100 - 20
       * 
       * For SS for interaction 'B*C' ('codes' = [0,1,1,0], 'i' = 5) is:
       * 
       * residual.ss - terms[1].SS - terms[2].SS - terms[5].ss => 100 - 20 - 15 - 14
       * 
       * and so on...
       * 
       * Note that for interactions we subtract the corrected sums of squares ('SS') 
       * of the terms above the current one, and finally subtract its own 'ss'. 
       * 
       * Note also, that because the array 'terms' is ordered by the 'terms[].order' 
       * of terms (first order terms - main factors - are first, second order terms  
       * - two-factor interactions - are next, and so on, one can compute the above 
       * formula for any current term because during its creation all other terms 
       * involved in its SS are already present in the list of terms! 
       */
      
      if( terms[i].order == 1 ) {
        terms[i].SS = total.ss - terms[i].ss;        
      } else {
          
        /*
         * This is an interaction (the order is higher than 1).
         * Remember that the codes for the current interaction term are 
         * already stored in vriable 'c' (which has at least two 1s). 
         * Now check for all terms inserted before this (current) if they 
         * have at least one of the factors involved in this term and have 
         * none of the factors not involved
         */
        
        let tSS = total.ss;
        for( let j = 0; j < i; j++ ) {
          let cj = terms[j].codes, cjl = c.length;
          let included = true;
          for( let k = 0; k < cjl; k++ ) 
            if( (cj[k] == 1) && (c[k] == 0) ) included = false;
          if( included ) tSS -= terms[j].SS;
        } 
        terms[i].SS = tSS - terms[i].ss;
      }   
    }   
    
    /*
     * Now insert two additional terms, the Error or Residual, 
     * and the Total, with their respective sums of squares and dfs
     */
    
    let te = { idx: tl, name: residual.name, codes: new Array(nfactors+1).fill(1), 
               order: terms[tl-1].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: residual.df,
               SS: residual.ss, ct_codes: new Array(nfactors+1).fill(1), 
               varcomp: [], MS: 0, P: 0, against: -2, F: 0, type: RANDOM };
               
    terms.push(te);
    
    let tt = { idx: tl+1, name: "Total", codes: new Array(nfactors+1).fill(1), 
               order: terms[tl].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: total.df,
               SS: total.ss, ct_codes: [], varcomp: [], MS: 0, P: 0, against: -2,
               F: 0,type: RANDOM };
               
    terms.push(tt);    
    
//#DEBUG    
    //console.log("Table of Terms")
    //console.table(terms)
//!DEBUG
    
    return true;
  }   

