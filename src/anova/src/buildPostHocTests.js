

  /****************************************************************************/
  /*                                                                          */
  /*                               buildPostHocTests                          */
  /*                                                                          */
  /* Check for terms that display significant F-statistics (differences       */
  /* between averages of a fixed factor). For the sake of simplicity restrict */
  /* post hoc tests to terms involving no more than three factors, that is    */
  /* second order interactions (A*B*C). The list is called 'mcomps' and will  */
  /* be fed to a function that computes the actual Post Hoc tests             */
  /*                                                                          */
  /****************************************************************************/
   
  function buildPostHocTests() {

    //#DEBUG
    //console.log('buildMultipleComparisons() called');
    //!DEBUG
    
    //console.log(terms)
      
    mcomps = [];

    // Iterate through all 'terms' that are not the Residual (Error) or
    // the Total terms (these two are easily identified because their
    // attribute 'nlevels' is 0 and are in the end of the list of terms)

    for( let term of terms ) {

      // Consider only those terms which have an F probability smaller than
      // the rejection level specified (usually 0.05). Also, to make things
      // simpler, ignore interactions involving more than three factors
      // (terms with 'order' > 3) or terms with 'no tests' for which the
      // attribute 'against' is -1).

      if( ( term.P < rejection_level ) && ( term.nlevels > 0 ) &&
          ( term.order < 4 ) && ( term.against !== -1 ) ) {

        // Consider only fixed factors or interactions containing fixed
        // factors. Multiple tests are useless for random factors. Go along
        // the array 'terms[].codes' for the current term (ignoring the last
        // element which stands for the Error component) and annotate any
        // factor involved ('codes[] == 1) which is of type "FIXED". This
        // will be called the target factor. All candidate comparisons will
        // be stored in 'mcomps', an array of objects that will hold all the
        // necessary information for processin a Post Hoc test

        for (let i = 0, fl = factors.length; i < fl; i++ ) {

          if ( ( term.codes[i] === 1 ) && (factors[i].type === FIXED ) ) {

            //console.log(t.toString() + ' ' + term.name +
            //            ': ' + factors[i].name );
            //console.log(terms[t]);

            // Identify the target factor for which we want to perform
            // multiple comparisons. Append the target factor to a list
            // to be provided to multiple comparison tests. For this, build
            // a JSON object ('tgt') that will hold all the information
            // necessary for the multiple test procedures for a given
            // target factor, be it a main factor or an interaction.
            // This will be appended to the 'mcomps' list
            //
            // tgt = {
            //   fcode      : i,
            //   fname      : factors[i].name
            //   term       : term name
            //   averages   : [],
            //   levels     : [],
            //   n          : [],
            //   df_against : 0,
            //   ms_against : 0,
            // }
            //
            // Note that 'tgt.factor' holds the code of the factor being
            // analyzed (i).

            let tgt = { fcode: i };

            // From this, we compute the real name of factor 'i'
            // and store it into 'tgt.name'.

            tgt.fname = factors[i].name;

            // Store the term's name for future reference.

            tgt.term = term.name;

            // Store the term's codes involved in this term
            tgt.codes = term.codes;

            // For some multiple tests the 'df' and the 'MS' of the term
            // used in the denominator of the F test for this particular
            // term ('term[t].against') is needed, so we pass it through
            // 'df_against' and 'ms_against'.

            tgt.df_against = terms[term.against].df;
            tgt.ms_against = terms[term.against].MS;

            // Now a list of averages to perform multiple comparisons is
            // necessary. These averages are the averages of the levels of
            // the 'tgt' factor. They will be passed in an array containing
            // the level 'name' (not its 'code'), the number of replicates
            // used to compute the average of each level, and the
            // corresponding variance. This is easy if the 'term' being
            // considered (t) corresponds to a main factor (which has
            // 'term[t].order' == 1) as all necessary values are stored in
            // 'terms' array ('average', 'n', 'sumx', 'sumx2', etc).

            tgt.averages = [];

            if( term.order === 1 ) {

              tgt.type = 'factor';

              tgt.averages[tgt.term] = [];

              // Go along all levels

              for (let j = 0, jl = term.average.length; j < jl; j++) {

                // Translate level name. Levels are stored as a string
                // separated by ','. Transform the string into an array
                // splitting by ','.

                let lv = term.levels[j].split(',')[i];

                // The levels of the factor being considered ('i') are in
                // the 'i'th position on the array.

                let ln = factors[i].levels[lv];

                // Get the 'average' and 'n' for this level

                let avg = term.average[j];
                let n = term.n[j];

                // Compute Standard Deviation for later calculation
                // of standard error

                let std = 0;
                if( n > 1 ) {
                  std = term.sumx2[j] - Math.pow(term.sumx[j],2)/n;
                  std = std/(n-1);
                }

                // Update the list of averages

                tgt.averages[tgt.term].push({level: ln,
                                             average: avg,
                                             n: n,
                                             std: std});
              }

              // Reorder list of averages, from smallest to largest

              tgt.averages[tgt.term].sort((a, b)=>(a.average>b.average)?1:-1);

              // Push new target to the list of 'mcomps' for multiple
              // comparisons

              mcomps.push(tgt);

            } else {

              // If the 'terms[t]' where the target factor is contained also
              // contains other factors, it's because it is an interaction
              // term. The computation of differences between averages is a
              // little bit more complicated, as it should be done
              // independently for all combinations of the levels of the
              // factors involved in the interaction with the exception of
              // the target term.

              tgt.type = 'interaction';

              for ( let j = 0, jl = term.levels.length; j < jl; j++ ) {

                let levs = term.levels[j].split(',');

                // Translate level name. Levels are stored as a string separated
                // by ','. Transform the string into an array splitting by ','.
                // The code for the current level of the target factor is in
                // slot 'i'.

                let lv = levs[i];

                let ln = factors[i].levels[lv];

                for(let k = 0, kl = factors.length; k < kl; k++) {
                  if ( ( term.codes[k] != 1 ) || (k == i) ) levs[k] = "-";
                }

                // Get the 'average' and 'n' for this level

                let avg = term.average[j];
                let n = term.n[j];

                // Compute Standard Deviation for later calculation
                // of standard error

                let std = 0;
                if( n > 1 ) {
                  std = term.sumx2[j] - Math.pow(term.sumx[j], 2)/n;
                  std = std/(n-1);
                }

                // Stringify the 'codes' array which will be used as a key
                // of an associative map for all combinations of levels
                // excluding the target factor

                let codes = levs.join();

                let c = tgt.averages.hasOwnProperty(codes)?tgt.averages[codes]:-1;
                if ( c == -1 )  tgt.averages[codes] = [];
                tgt.averages[codes].push({level: ln,
                                          average: avg,
                                          n: n,
                                          std: std});

                // Reorder list of averages, from smallest to largest

                tgt.averages[codes].sort((a, b)=>(a.average>b.average)?1:-1);
              }
              mcomps.push(tgt);
            }
          }
        }
      }
    }

    //     We have scanned all terms. 'mcomps' has a list of all possible
    //     comparisons!

    if ( mcomps.length > 0 ) {

      // If 'ignoreinteractions' is not enabled (true) we must eliminate
      // from post hoc tests any test that includes factors or interactions
      // involved in other interactions of higher order! For example, if
      // interaction AxCxD is significant (in a four factor ANOVA involving
      // also factor B), post hoc tests for levels of A, C, D, AxC, AxD and
      // CxD should not be computed. This is the correct behaviour, and has
      // been explained in many articles on the ANOVA. If the interaction
      // AxCxD is significant, it means that differences on averages of A
      // depend on the combination of the levels of C and D being considered.
      // This logic extends also to differences among means of the other two
      // factors (C and D). However, note that it's still possible to inspect
      // differences between levels of factor B, provided it is not involved
      // in a significant interaction with any of the other three factors.

      if ( !ignoreinteractions ) {

        // If there is just a single factor to be analyzed, go ahead and do
        // the post hoc tests for it. Otherwise, check if it is involved in
        // higher order interactions, in which case it should be excluded.
        // We go from top ( main factors) to bottom of 'mcomps' and for each
        // candidate we check if there is any other 'mcomp' where the codes
        // of the current ('i') 'mcomp' are also present.

        if ( mcomps.length > 1 ) {
          for ( let i = 0; i < mcomps.length - 1; i++ ) {
            for ( let j = i + 1; j < mcomps.length; j++ ) {

              // Check if we are not comparing differnt comparisons
              // among components of the same term

              if ( mcomps[i].term != mcomps[j].term ) {

                // Go along the codes of 'mcomp[j].codes' and check if
                // they include all codes in 'mcomp[i].codes'
                let included = true;

                for ( let k = 0; k < mcomps[i].codes.length; k++) {
                  if ( ( mcomps[j].codes[k] > 0 ) &&
                       ( mcomps[i].codes[k] === 0 ) ) included = false;
                }
                if ( included == false ) mcomps[i].excluded = true;

              }
            }
          }
        }



      }

      // console.log(mcomps);

      // Display the tab with multiple comparisons if any is selected

      computePostHocTests();

    }

    //console.log(factors)
  }
  
