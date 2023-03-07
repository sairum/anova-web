  
  /****************************************************************************/
  /*                                                                          */
  /*                               buildTerms                                 */
  /*                                                                          */
  /* This function builds the list of terms of any ANOVA with N factors.      */
  /* First it computes all possible combinations of factors as if a fully     */
  /* factorial ANOVA is being made. Then a check for nesting of factors is    */
  /* made and if any factor is found to be nested into another factor or into */
  /* an interaction, a correction is made by accummulating the appropriate    */
  /* sums of squares, degrees of freedom, averages, levels, and factor name's */
  /* notation, and removing the edundant term from the list                   */
  /*                                                                          */
  /****************************************************************************/

  function buildTerms() { 
        
    //#DEBUG
    //console.log('buildTerms() called');
    //!DEBUG

    // Construct a list of 'terms' (denoting either main factors or
    // interactions) assuming that a fully orthogonal analysis is being done.
    // The number of terms of any fully orthogonal design is given by
    //
    // 2^n
    //
    // where n is the number of factors involved
    //
    // Note that the formula includes the empty element {} and all possible
    // combinations of factors ignoring their order. For example, for a
    // set with three factors {A,B,C} the total number of terms is given by
    //
    // 2^3 = 8
    //
    // which are
    //
    // {}, {A}, {B}, {C}, {AB}, {AC}, {BC}, {ABC}
    //
    // Note that {BA}, {CA}, {CB}, {ACB}, {BCA}, {BAC}, {CAB}, and {CBA}
    // are not included as the order does not matter
    //
 
    let s = Math.pow(2, nfactors);
    
    // Now create all combinations of factors, one in each iteration,
    // but exclude i = 0 which corresponds to the empty set {}
    
    for( let i = 1; i < s; i++ ) {
        
      let temp = { idx: 0, name: "", codes: [], order: 0, combins: 1,
                   nlevels: 0, levels: [], sumx: [], sumx2: [], n: [],
                   average: [], ss: 0, df: 1, SS: 0, ct_codes: [],
                   varcomp: [], MS: 0, P: 0, against: -1, F: 0,
                   type: FIXED };
                   
      for( let j = 0; j < nfactors; j++ ) {
          
        //
        // Unfortunately, we need an additional attribute 'idx' to keep the
        // order of creation of the terms. The order will be:
        //
        // idx : term
        // -----------
        // 1   : A
        // 2   : B
        // 3   : A*B
        // 4   : C
        // 5   : A*C
        // ...
        // Note that the fourth term (idx = 4) is a main factor ('C'), but it
        // is created after the interaction A*B. Later on, the list of terms
        // of the ANOVA should be sorted according to the 'order' of terms
        // (1 - for main factors, 2 - for 1st order interactions, 3 - for
        // second order interactions, and so on).
        //
        // However, two terms may have the same 'order' (for example, both are
        // first order interactions, and their 'order' is 2). In these cases,
        // we need to have a way to sort them according to the order they were
        // created during the reading stage of data. This is particularly
        // important for terms denoting the main factors. If their order
        // differs from the the order in which main factors were created
        // during the reading stage of data (see 'factors') problems will
        // occur because the 'codes' property of 'terms' and 'partials' lists
        // expects that the order of the main factors is the same as in the
        // 'factors' array
        //
        
        temp.idx = i;  
        if( (i & Math.pow(2,j)) ) {
          temp.codes[j] = 1;
          temp.order++;
          temp.combins *= factors[j].nlevels;
          temp.type *= factors[j].type;
        } else {
          temp.codes[j] = 0;
        }
        
        // Insert one more code for the "Error" to all terms
        
        temp.codes.push(0);
      }
      terms.push(temp);
    }
    
    //#DEBUG
    //console.table(terms)
    displayTerms("Unsorted and uncorrected terms");
    //!DEBUG
    
    // Compute the 'partials' list, i.e., a list with all terms potentially
    // included in an ANOVA.

    if( getCellsSS() ) {

      // Sort 'terms' by ascending 'terms[].order'. Note that if the terms
      // 'order' is the same for two or more terms we resort to their 'idx'
      // attribute to keep the correct order. This is only important for
      // main factors (terms[].order == 1) because their order should be
      // the same as for the 'factors[]' order

      terms.sort( function(a,b){return (a.order-b.order) || (a.idx - b.idx)} );


      // Recompute MSs and dfs for all terms. Do not do this for the 'Error'
      // and the 'Total' because their SS and df are already computed.

      for ( let i = 0, len = terms.length - 2; i < len; i++ ) {
        if( terms[i].order == 1 ) {
          terms[i].df = factors[i].nlevels - 1;
        } else {
          let m = 1;
          for ( let j = 0; j < nfactors; j++ ) {
            if ( terms[i].codes[j] > 0 ) m *= factors[j].nlevels - 1;
          }
          terms[i].df = m;
        }
        terms[i].MS = terms[i].SS/terms[i].df;
      }

      // The df for the 'Error' is already computed so we don't overwrite it.
      // Instead we compute its MS

      let e = terms.length - 2;
      terms[e].MS = terms[e].SS/terms[e].df;

      //#DEBUG
      displayTerms( "List of Terms" );
      //!DEBUG

      // Check if there are nested factors and correct the
      // ANOVA terms if necessary

      correctForNesting();

      //#DEBUG
      displayFactors();
      //!DEBUG

      // Compute Cornfield-Tukey rules to determine
      // denominators for the F-tests

      computeCTRules();

      //#DEBUG
      displayTerms( "List of Corrected Terms" );
      //!DEBUG

      // Display tables of averages per factor or combinations of factors

      displayAverages();

      // Build the list of multiple comparisons, if any available

      buildPostHocTests();

      // Finally display the ANOVA table

      displayANOVA();
    }
  }

  
