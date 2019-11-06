  
  /*************************************************************************/
  /*                                                                       */
  /*                            computePartials                            */
  /*                                                                       */
  /* For each data point (observation) read its corresponding value and    */
  /* factor levels and recode the latter into integers, replacing the      */
  /* original label by its corresponding index in 'factors[i].levels'      */
  /* array. The first factor level for any factor will be always 0 (zero), */
  /* the second will be 1, and so on. Take the following example of the    */
  /* first data points of a three factor analysis (two replicates per      */
  /* combination of factors)                                               */
  /*                                                                       */
  /*  Site Type  Light DATA                                                */
  /*  A    B     day   23                                                  */
  /*  A    B     day   21                                                  */
  /*  A    B     night 12                                                  */
  /*  A    B     night 16                                                  */
  /*  A    C     day   13                                                  */
  /*  A    C     day   11                                                  */
  /* ...                                                                   */
  /*                                                                       */
  /* The data array will be coded as                                       */
  /*                                                                       */ 
  /*  [0, 0, 0] 23                                                         */
  /*  [0, 0, 0] 21                                                         */
  /*  [0, 0, 1] 12                                                         */
  /*  [0, 0, 1] 16                                                         */
  /*  [0, 1, 0] 13                                                         */
  /*  [0, 1, 0] 11                                                         */
  /* ...                                                                   */
  /*                                                                       */
  /* For factor 'Site' level 'A' of 'Site' is coded as 0 (no more levels   */
  /* in the example). For factor 'Type', level 'B' is coded as 0 and level */
  /* 'C' is coded as 1. For factor 'Light', level 'day' is coded as 0 and  */
  /* level 'night' is coded as 1                                           */
  /*                                                                       */
  /* During this stage a list of 'partials' is built. A 'partial' is a     */
  /* unique combination of level codes. All data observations that have a  */
  /* similar combination of codes are accummulated into two quantities for */
  /* their corresponding partial: 'sumx' for the sum of observations, and  */
  /* 'sumx2', for the sum of squared observations, and 'n' for the number  */
  /* observations of the partial. For the case above, the corresponding    */
  /* list of partials would be                                             */
  /*                                                                       */
  /* {[0, 0, 0], 44, 970, 2},                                              */
  /* {[0, 0, 1], 28, 400, 2},                                              */
  /* {[0, 1, 0], 24, 290, 2},                                              */
  /* ...                                                                   */
  /*                                                                       */
  /*************************************************************************/ 
  
  function computePartials() {
      
    /*
     * To determine if an observation with a particular combination of factor 
     * level codes belongs to an already created partial, we have to compare 
     * two arrays: the codes of the partials against the codes of the data 
     * observation. This is easier to do with strings than iterating through 
     * the two arrays. Hence, an associative array (hash) with the codes of 
     * the 'partials' as keys and the key of the partial in the 'partials'
     * list as a value is built.
     */
    
    let partials_hash = [];
    
    /*
     * Use 'maxn' to estimate the maximum number of replicates per partial. 
     * In a balanced data set, all 'partials' will have the same number of
     * replicates. This variable will allow us to replace missing data in 
     * a given partial by adding as many averages as necessary to complete
     * 'maxn' replicates
     */
    
    let maxn = 0;
    
    /*
     * Now, go along all data aobservations (points) and accummulate the 
     * values in their respective 'partials' or create new 'partials' as 
     * needed
     */
    
    for(let i = 0, ds = data.length; i < ds; i++ ) {
        
      /*
       * Translate the original data level code into the numeric 
       * level code stored previously in 'factors[].levels'
       */
      
      let codes = [];
      
      for(let j = 0, len = data[i].levels.length; j < len; j++ ) {
        let l = data[i].levels[j];
        let k = factors[j].levels.indexOf(l);
        codes[j] = k;
      }  
      
      /*
       * Build the object to store this specific 'partial's information
       */
      
      let p = {};
      
      p.codes  = codes;
      p.sumx   = data[i].value;
      p.sumx2  = Math.pow(data[i].value,2);
      p.n      = 1;
      p.n_orig = 1;
      
      /*
       * If list of 'partials' is empty add a new term
       */
      
      if( partials.length == 0 ) {
          
        /*
         * Method 'push' returns the new array length so use this 
         * information and subtract 1 to store the index of the 
         * newly created partial in the hash array value!  
         */
        
        partials_hash[codes] = partials.push(p) - 1;
        
      } else {
          
        /*
         * Search if this particular combination of levels is already 
         * in 'partials'
         */
        
        let v = partials_hash.hasOwnProperty(codes) ? partials_hash[codes] : -1;
        if( v != -1 ) {
            
          /*
           * A partial with these codes is already in the list. Accummulate 
           * values ('sumx', 'sumx2') and increase replicates ('n')
           */
          
          partials[v].sumx+= p.sumx;
          partials[v].sumx2+= p.sumx2;
          partials[v].n++;
          
          /*
           * Update the maximum number of replicates per combination of factors 
           * (ANOVA cells), if the 'n' for this 'partial' is greater than 'maxn'. 
           */
          
          if( partials[v].n > maxn ) maxn = partials[v].n;
          
        } else {
            
          /*
           * A partial with these codes is not yet in the list of partials, so 
           * create a new one. See above why -1 is used ( partials.length == 0 ) 
           */
          
          partials_hash[codes] = partials.push(p) - 1;
          
        }  
      }
    }
    
    /*
     * Go along all partials and verify that each has a similar number of 
     * replicates ('partials[i].n' should equal 'maxn'). If not, replace 
     * missing values with the average of the partial 
     * (partials[i].sumx/partials[i].n) and increment 'correted_df' to later 
     * decrease the degrees of freedom of the 'Error' (or 'Residual') and 
     * the 'Total' terms of the ANOVA
     */
    
    for(let i = 0, tl = partials.length; i < tl; i++ ) {
      partials[i].n_orig = partials[i].n;
      if( partials[i].n < maxn ) {
        let average = partials[i].sumx/partials[i].n;
        let n = maxn - partials[i].n;
        for( let j = 0; j < n; j++) {
          corrected_df++;
          partials[i].sumx += average;
          partials[i].sumx2 += Math.pow(average,2);
          partials[i].n++;
        }  
      }  
    } 
    
    /* 
     * After rebalancing the data, compute Residual and Total sums of squares 
     * and their respective degrees of freedom. Compute also the squared 
     * differences between observations and their averages for each partial 
     * using the equation:
     * 
     *   SUM(X_i - X_bar)^2 = SUM(X_i^2) - (SUM(X_i))^2/n
     * 
     * where X_i is a particular observation and X_bar is the average for 
     * the set
     */
    
    let tsumx = 0, tsumx2 = 0, tn = 0;
    
    for(let i = 0, tl = partials.length; i < tl; i++ ) {
      partials[i].ss = partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n; 
      residual.df += partials[i].n-1;
      residual.ss += partials[i].ss;
      total.df += partials[i].n;
      tsumx += partials[i].sumx;
      tsumx2 += partials[i].sumx2;
      tn += partials[i].n;
    }
    total.df -= 1;
    total.ss = tsumx2 - Math.pow(tsumx,2)/tn;
    residual.orig_df = residual.df;
    residual.df -= corrected_df;
    total.orig_df = total.df;
    total.df -= corrected_df;
     
    /*
     * The number of replicates can now be taken from any partial 
     * because rebalancing was performed earlier
     */
    
    replicates = partials[0].n;
    
    //#DEBUG    
    displayPartials();
    //!DEBUG    
    
    /*
     * It's time to compute homogeneity tests for this data set
     * because most depend only on having information of averages and
     * variances for all possible combinations of levels of all factors
     * involved in the analysis. The 'partials' list has exactly that
     * information!
     */
    
    homogeneityTests();
    
    return true;
  }
  
