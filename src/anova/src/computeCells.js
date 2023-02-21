  
  /****************************************************************************/
  /*                                                                          */
  /*                              computeCells                                */
  /*                                                                          */
  /*  Data were gathered into structures corresponding to NOVA cells also     */
  /*  known as 'partials'. Each element of array 'data' holds an array with   */
  /*  the factor level codes ('levels'), another with data values ('values')  */
  /*  and a copy of the latter just to be able to revert any modifications    */
  /*  to the data ('originals'). Besides these variables, we compute several  */
  /*  quantities that are fundamental for the next computations.              */
  /*                                                                          */
  /*  'levels' are recoded into integers, replacing the original label by its */
  /*  corresponding index in 'factors[i].levels' array. The first factor      */
  /*  level for any factor will always be 0 (zero), the second will be 1, and */
  /*  so on. Take the following example of the first data points of a three   */
  /*  factor analysis (two replicates per combination of factors)             */
  /*                                                                          */
  /*    Site Type  Light DATA                                                 */
  /*    A    B     day   23                                                   */
  /*    A    B     day   21                                                   */
  /*    A    B     night 12                                                   */
  /*    A    B     night 16                                                   */
  /*    A    C     day   13                                                   */
  /*    A    C     day   11                                                   */
  /*   ...                                                                    */
  /*                                                                          */
  /*  The 'codes' and 'values' in the 'data' array will be                    */
  /*                                                                          */
  /*   data[i]   'codes'  'values'                                            */
  /*     0      [0, 0, 0] [23, 21]                                            */
  /*     1      [0, 0, 1] [12, 16]                                            */
  /*     2      [0, 1, 0] [13, 11]                                            */
  /*   ...                                                                    */
  /*                                                                          */
  /*  For factor 'Site' level 'A' of 'Site' is coded as 0 (no more levels in  */
  /*  the example). For factor 'Type', level 'B' is coded as 0 and level 'C'  */
  /*  is coded as 1. For factor 'Light', level 'day' is coded as 0 and level  */
  /*  'night' is coded as 1.                                                  */
  /*                                                                          */
  /*  During this stage we accummulate the sums of all values and the sums of */
  /*  all squared values into two 'sumx' and 'sumx2', respectively, together  */
  /*  with the total number of replicates ('n'). For the example above, the   */
  /*  corresponding 'data' entries would be                                   */
  /*                                                                          */
  /*  [                                                                       */
  /*   {[0, 0, 0], [23, 21], 44, 970, 2},                                     */
  /*   {[0, 0, 1], [12, 16], 28, 400, 2},                                     */
  /*   {[0, 1, 0], [13, 11], 24, 290, 2},                                     */
  /*   ...                                                                    */
  /*  ]                                                                       */
  /*                                                                          */
  /****************************************************************************/
  
  // This is a implementation of a function to compute medians of lists.
  // Medians are necessary to implement the version of Levene's test with
  // medians, instead of means.

  function median( l ) {
    if (l.length == 0) return;
    l.sort((a, b) => a - b);
    let mid = Math.floor( l.length / 2 );
    // If odd length, take midpoint, else take average of midpoints
    let median = l.length % 2 === 1 ? l[mid] : ( l[mid - 1] + l[mid] ) / 2;
    return median;
  }

  function computeCells() {

    //#DEBUG
    console.log('computeCells() called');
    //!DEBUG

    // Use 'maxn' to estimate the maximum number of replicates per cell.
    // In a balanced data set, all 'cells' will have the same number of
    // replicates. This variable will allow us to replace missing data in
    // a given partial by adding as many averages as necessary to complete
    // 'maxn' replicates
    
    let maxn = 0;

    // We will use this a lot

    let dl = data.length;

    // Now, go along all ANOVA cells and for each compute some important
    // quantities:
    // 1) n (number of replicates)
    // 2) sumx (sum of all data values)
    // 3) sum2x (sum of squared data values)

    for(let i = 0; i < dl; i++ ) {
        
      // Translate the original data level code into the numeric
      // level code stored previously in 'factors[].levels'
      
      for(let j = 0, len = data[i].levels.length; j < len; j++ ) {
        let l = data[i].levels[j];
        let k = factors[j].levels.indexOf(l);
        data[i].codes[j] = k;
      }  
      
      // Compute 'n', 'sumx' and 'sumx2'

      data[i].sumx  = 0;
      data[i].sumx2 = 0;

      data[i].n = data[i].values.length;

      for(let j = 0; j < data[i].n; j++ ) {
        data[i].sumx  += data[i].values[j];
        data[i].sumx2 += Math.pow( data[i].values[j], 2 );
      }

      // Save 'n_orig' for this cell. So far lets assume it is
      // equal to the number of observations on 'values' array

      data[i].n_orig = data[i].n;

      // Update the maximum number of replicates per ANOVA cell
      // if the 'n' for this 'data' cell is greater than 'maxn'.

      if( data[i].n > maxn ) maxn = data[i].n;

      // Compute the average of values

      data[i].average = data[i].sumx/data[i].n;

      // Compute the variance of values

      data[i].variance = data[i].sumx2 - Math.pow(data[i].sumx,2)/data[i].n;
      data[i].variance = data[i].variance/(data[i].n-1);

      // Sort data values to compute the median

      data[i].median = median( data[i].values );

    }
    
    // Go along all cells and verify that each has a similar number of
    // replicates ('data[i].n' should equal 'maxn'). If not, replace
    // missing values with the average of the cell (data[i].average)
    // and increment the global variable 'correted_df' to later
    // decrease the degrees of freedom of the 'Error' (or 'Residual')
    // and the 'Total' terms of the ANOVA
    
    for(let i = 0; i < dl; i++ ) {
      if( data[i].n < maxn ) {
        let diff = maxn - data[i].n;
        for( let j = 0; j < diff; j++) {
          corrected_df++;
          data[i].sumx += data[i].average;
          data[i].sumx2 += Math.pow( data[i].average, 2 );
          data[i].n++;
        }
      }
    }
    
    // After rebalancing the data, compute Residual and Total sums of squares
    // and their respective degrees of freedom. Compute also the squared
    // differences between observations and their averages for each partial
    // using the equation:
    //
    //   SUM(X_i - X_bar)^2 = SUM(X_i^2) - (SUM(X_i))^2/n
    //
    // where X_i is a particular observation and X_bar is the average for
    // the set

    let tsumx = 0, tsumx2 = 0, tn = 0;

    for(let i = 0; i < dl; i++ ) {
      data[i].ss =
        data[i].sumx2 - Math.pow( data[i].sumx, 2 )/data[i].n;
      residual.df += data[i].n-1;
      residual.ss += data[i].ss;
      total.df += data[i].n;
      tsumx += data[i].sumx;
      tsumx2 += data[i].sumx2;
      tn += data[i].n;
    }
    total.df -= 1;
    total.ss = tsumx2 - Math.pow( tsumx, 2 )/tn;
    residual.orig_df = residual.df;
    residual.df -= corrected_df;
    total.orig_df = total.df;
    total.df -= corrected_df;
     
    // The number of replicates can now be taken from any ANOVA cell
    // because rebalancing was performed earlier
    
    replicates = data[0].n;
    
    //#DEBUG
    displayCells();
    //!DEBUG
    
    // It's time to compute homogeneity tests for this data set
    //because most depend only on having information of averages and
    //variances for all possible combinations of levels of all factors
    //involved in the analysis. The 'partials' list has exactly that
    //information!
    
    homogeneityTests();
    
    // Compute the terms of the linear model
    
    buildTerms();

  }
  
