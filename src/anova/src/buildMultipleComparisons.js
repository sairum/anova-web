

  /*************************************************************************/
  /*                                                                       */
  /*         Compute a list of a posteriori muliple comparisons            */
  /*                                                                       */  
  /* Check for terms that display significant F-statistics (differences    */
  /* between averages of a fixed factor). For the sake of simplicity       */
  /* restrict a posteriori tests to terms denoting up to second order      */
  /* interactions (that is, involving trhee factors). The list is called   */
  /* 'mcomps' and will be fed to a function that actually preforms         */
  /* a posteriori multiple comparison tests                                */
  /*                                                                       */
  /*************************************************************************/
   
  function buildMultipleComparisons() {
    
    //console.log(terms)
      
    mcomps = [];
     
    /*
     * Iterate through all 'terms' that are not the Residual (Error) or 
     * the Total terms (these two are easily identified because their 
     * attribute 'nlevels' = 0 and are in the end of the list of terms) 
     */ 
       
    for(let t = 0, tln = terms.length; t < tln; t++ ) {
      
      /*
       * Consider only those terms which have an F probability smaller than 
       * the rejection level specified (usually 0.05). Also, ignore 
       * interactions with more than three factors for simplicity 
       * (terms with 'order' > 3).  
       */
        
      if( ( terms[t].P < rejection_level ) && ( terms[t].nlevels > 0 ) && 
          ( terms[t].order < 4 ) && ( terms[t].against !== -1 ) ) {
        
        /*
         * Consider only fixed factors or interactions containing fixed 
         * factors. Multiple tests are useless for random factors. Go along 
         * the array 'terms[].codes' for the current term (ignoring the last 
         * element which stands for the Error component) and annotate any 
         * factor involved ('codes[] == 1) which is of type "fixed". This 
         * will be called the target factor. All candidate comparisons will
         * be stored in 'mcomps', an array of JSON objects that will hold
         * all the necessary information for processin an a_posteriori 
         * multiple test
         */

        for (let i = 0, fl = factors.length; i < fl; i++ ) {
            
          if ( ( terms[t].codes[i] === 1 ) && (factors[i].type === FIXED ) ) {
              
            //console.log(t.toString() + " " + terms[t].name + ": " + factors[i].name );  
            //console.log(terms[t]);
            
            /*
             * Identify the target factor for which we want to perform 
             * multiple comparisons. Append the target factor to a list
             * to be provided to multiple comparison tests. For this, build
             * a JSON object ('tgt') that will hold all the information 
             * necessary for the multiple test procedures for a given 
             * target factor, be it a main factor or an interaction.
             * This will be appended to the 'mcomps' list
             * 
             * tgt = {
             *   fcode      : i,
             *   fname      : factors[i].name
             *   term       : term name
             *   averages   : [], 
             *   levels     : [],
             *   n          : [],
             *   df_against : 0,
             *   ms_against : 0,
             * } 
             * 
             * Note that 'tgt.factor' holds the code of the factor being
             * analyzed (i). 
             */
                
            let tgt = { fcode: i };
            
            /*
             * From this, we compute the real name of factor 'i'
             * and store it into 'tgt.name'. 
             */
            
            tgt.fname = factors[i].name;
            
            /*
             * Store the term's name for future reference. 
             */
            
            tgt.term = terms[t].name;
            
            /* 
             * For some multiple tests the 'df' and the 'MS' of the term 
             * used in the denominator of the F test for this particular 
             * term ('term[t].against') is needed, so we pass it through 
             * 'df_against' and 'ms_against'.
             */
           
            tgt.df_against = terms[terms[t].against].df;
            tgt.ms_against = terms[terms[t].against].MS; 

            /*
             * Now a list of averages to perform multiple comparisons is 
             * necessary. These averages are the averages of the levels of 
             * the 'tgt' factor. They will be passed in an array containing 
             * the level 'name' (not its 'code'), the number of replicates 
             * used to compute the average of each level, and the corresponding 
             * variance. This is easy if the 'term' being considered (t) 
             * corresponds to a main factor ('term[t].order' == 1) as all 
             * necessary values are stored in 'terms' array ('average', 'n', 
             * 'sumx', 'sumx2', etc). 
             */
            
            tgt.averages = [];

            if( terms[t].order === 1 ) {
                
              tgt.type = 'factor';
              
              tgt.averages[tgt.term] = [];
              
              /*
               * Go along all levels
               */
              
              for (let j = 0, jl = terms[t].average.length; j < jl; j++) {
                
                /*
                 * Translate level name. Levels are stored as a string separated
                 * by ','. Transform the string into an array splitting by ','.
                 */
                
                let lv = terms[t].levels[j].split(',')[i];
 
                /*
                 * The levels of the factor being considered ('i') are in the 
                 * 'i'th position on the array.
                 */
                                
                let ln = factors[i].levels[lv];
                
                /*
                 * Get the 'average' and 'n' for this level
                 */
                
                let avg = terms[t].average[j];
                let n = terms[t].n[j];
                
                /*
                 * Compute Standard Deviation for later calculation
                 * of standard error
                 */
                
                let std = 0;
                if( n > 1 ) std = (terms[t].sumx2[j] - Math.pow(terms[t].sumx[j],2)/n)/(n-1);
                
                /*
                 * Update the list of averages
                 */
                
                tgt.averages[tgt.term].push({level: ln, average: avg, n: n, std: std}); 
              }
              
              /*
               * Reorder list of averages, from smallest to largest
               */
              
              tgt.averages[tgt.term].sort((a, b) => (a.average > b.average)? 1 : -1);
              
              /*
               * Push new target to the list of 'mcomps' for multiple
               * comparisons
               */
              
              mcomps.push(tgt);

            } else {
              
              /*
               * If the 'terms[t]' where the target factor is contained also 
               * contains other factors, it's because it is an interaction term.
               * The computation of differences between averages is a little 
               * bit more complicated, as it should be done independently for
               * all combinations of the levels of the factors involved in
               * the interaction with the exception of the target term. 
               */
              
              tgt.type = 'interaction';
              

              for ( let j = 0, jl = terms[t].levels.length; j < jl; j++ ) {

                let levs = terms[t].levels[j].split(',');
                
                /*
                 * Translate level name. Levels are stored as a string separated
                 * by ','. Transform the string into an array splitting by ','.
                 * The code for the current level of the target factor is in 
                 * slot 'i'.
                 */
                
                let lv = levs[i];
                
                let ln = factors[i].levels[lv];
                
                
                for(let k = 0, kl = factors.length; k < kl; k++) {
                  if ( ( terms[t].codes[k] != 1 ) || (k == i) ) levs[k] = "-";
                }
                
                /*
                 * Get the 'average' and 'n' for this level
                 */
                
                let avg = terms[t].average[j];
                let n = terms[t].n[j];
                
                /*
                 * Compute Standard Deviation for later calculation
                 * of standard error
                 */
                
                let std = 0;
                if( n > 1 ) std = (terms[t].sumx2[j] - Math.pow(terms[t].sumx[j],2)/n)/(n-1);
                
                /*
                 * Stringify the 'codes' array which will be used as a key
                 * of an associative map for all combinations of levels 
                 * excluding the target factor
                 */
                
                let codes = levs.join();
                
                let c = tgt.averages.hasOwnProperty(codes) ? tgt.averages[codes] : -1;  
                if ( c == -1 )  tgt.averages[codes] = []; 
                tgt.averages[codes].push({level: ln, average: avg, n: n, std: std}); 
                
                /*
                 * Reorder list of averages, from smallest to largest
                 */
              
                tgt.averages[codes].sort((a, b) => (a.average > b.average)? 1 : -1);
              }    
              mcomps.push(tgt);             
            }
          }  
        }  
      }  
    }
    
    // We have scanned all terms. 'target' has a list of all possible
    // comparisons!
    
    //console.log('mcomps: ',mcomps);
    
    
  }
  
