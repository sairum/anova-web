  /****************************************************************************/
  /*                                                                          */
  /*                 Computation of homoscedasticity tests                    */
  /*                                                                          */
  /*    So far, only Cochran's C and Bartlett's tests are implemented.        */
  /*                                                                          */
  /****************************************************************************/

  function homogeneityTests() {

    //#DEBUG
    console.log('homogeneityTests() called');
    //!DEBUG

    let d = document.getElementById('homogen');

    d.innerHTML = '<div class="ht"><h2>Cochran\'s test</h2>' +
                  testCochran() +  '</div>';

    d.innerHTML += '<div class="ht"><h2>Bartlett\'s test</h2>' +
                   testBartlett() +  '</div>';

    d.innerHTML += '<div class="ht"><h2>Levene\'s test</h2>' +
                    testLevene() +  '</div>';

  }

  /****************************************************************************/
  /*                                                                          */
  /*                               Bartlett's test                            */
  /*                                                                          */
  /****************************************************************************/

  function testBartlett() {
      
    // Compute Bartlett's test
    //
    //           (N-k)*ln(s_p²) - Sum[(n_i-1)*ln(s_i²)]
    // X² =     ---------------------------------------
    //          1 + 1/(3*(k-1))*(Sum[1/(n_i-1)] - 1/(N-k))
    //
    // N    = Sum[n_i]
    // s_p² = Sum[(n_i-1)*s_i²]/(N-k)
    // k    = number of means being compared
    // n_i  = size for mean i (sample sizes must be similar: balanced analysis)
    // s_i² = variance of sample i
    //
    // An easier way to do this, well explained at
    // https://stattrek.com/online-calculator/bartletts-test.aspx
    // is as follows:
    //
    //         A - B
    // X² = -----------
    //      1 + (C * D)
    //
    // with
    //
    // A = (N-k)*ln(s_p²)
    // B = Sum[(n_i-1)*ln(s_i²)]
    // C = 1/(3*(k-1))
    // D = Sum[1/(n_i-1)] - 1/(N-k)
    //

    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels
    
    let k = data.length;
    
    // Compute N, the sum of all sample sizes. Since the present anova-web
    // only works with balanced data sets, summing all n_i's is equivalent
    // to multyplying the number of replicates by the number of 'cells' (k)
    
    let N = k * replicates;
    
    // Compute the pooled variance s_p² (pvar) Sum[(n_i-1)*s_i²]/(N-k)

    let pvar = 0;
    for( let i = 0; i < k; i++ ) {
      pvar += (data[i].n - 1 )*data[i].variance;
    }
    pvar = pvar/(N-k);


    // Compute A = (N-k)*ln(s_p²)

    let A = (N-k)*Math.log(pvar);

    // Compute B = Sum[(n_i-1)*ln(s_i²)]

    let B = 0;
    for( let i = 0; i < k; i++ ) {
      //  data[i].variance contain s_i² for this ANOVA cell
      B += ( data[i].n - 1 )*Math.log( data[i].variance );
    }    
    
    // Compute C = 1/(3*(k-1))

    let C = 1/(3*(k-1));
    
    // Compute D = Sum[1/(n_i-1) - 1/(N-k)]

    let D = 0;
    for( let i = 0; i < k; i++ ) {
      D += 1/(data[i].n-1);
    }
    D -= 1/(N-k);
    
    // Compute Bartlett's K value
    
    let bartlett_k = (A - B)/(1 + (C*D));
    
    let prob = 1.0 - jStat.chisquare.cdf(bartlett_k, k-1);
    if( prob > 1 ) prob = 1;
    if( prob < 0 ) prob = 0;
     
    let result = '';
    result += '<p>&#120594;<sup>2</sup> = ' + bartlett_k.toFixed(DPL) + '</p>' +
              '<p>for <b><i>k</i> = ' + k.toString() +
              '</b> averages and <b>&nu; = ' + (k-1).toString() +
              '</b> degrees of freedom: <b>' +
              '</b></p><p>P = <b>' + prob.toFixed(DPL) + '</b></p>';
    
    return result;
    
  }    
  

  /****************************************************************************/
  /*                                                                          */
  /*                               Cochran's C test                           */
  /*                                                                          */
  /****************************************************************************/


  function testCochran() {
      
    // Compute Cochran's C test which is a ratio between the largest sample
    // variance over the sum of all sample variances. 'maxvar' will hold
    // the largest variance, whilst 'sumvar' will keep the sum of all
    // variances
    
    let maxvar = 0;
    let sumvar = 0;
    
    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels
    
    let k = data.length;
    
    // The corresponding degrees of freedom for each average (which should be
    // equal for balanced analysis) are computed from 'replicates' - 1
    
    let df = replicates - 1;
    
    // Find all variances, sum them all, find the largest and divide
    // by the sum of all variances. This is the Cochran's test
    
    for( let i = 0; i < k; i++ ) {
      if ( data[i].variance > maxvar ) maxvar = data[i].variance;
      sumvar += data[i].variance;
    }
    
    let cochran_C = maxvar/sumvar;
    
    // To compute the probabilty of obtaining a value of the C statistic larger
    // than the resulting C value we use the algorithm which was implemented in
    // 'mwanova.cgi' which behaves quite well for most cases but produces some
    // erroneous probabilities in marginal cases. For example, a C = 0.218533,
    // with 8 means and 2 degrees of freedom (real case in '3-way.txt')
    // produces a P = 1.42385557279749! According to Igor Baskir
    // <baskir_At_univer.kharkov.ua> if the probability is larger than 1 one we
    // must use the equation P = Math.abs( Math.ceil(P) - P ). However, this
    // works when the F cummulative distribution function used in the algorithm
    // below actually gives the probability of obtaining a value similar or
    // larger than F ('fprob' in mwanova.cgi does that), but not when it gives
    // the probability of obtaining a vlaue equal or smaller than F as many
    // functions do (jStat, excel's F.INV, libreoffice FINV, etc)
    //
    // Apparently the equation  P = Math.abs( Math.floor(P) - P ) seems to hold
    // in many cases...
    
    let prob = 0.0;
    if( ( cochran_C > 0 ) && ( k > 1 ) ) {
      prob = jStat.centralF.cdf(( 1/cochran_C -1 )/(k-1),((k-1)*df),df)*k;
      //console.log(prob, (1/c-1)/(k-1));
      if( prob > 1 ) prob = Math.abs( Math.floor(prob) - prob );
     }

    //let f = (1/c - 1.0)/(k - 1.0);
    //P = jStat.centralF.cdf(f, df * (k - 1.0), df) * k;

    let result = '';
    result += '<p>C = ' + cochran_C.toFixed(DPL) + '</p>' +
              '<p>for <b><i>k</i> = ' + k.toString() +
              '</b> averages and <b>&nu; = ' + df.toString() +
              '</b> degrees of freedom</p>' +
              '<p>P = <b>' + prob.toFixed(DPL) + '</b></p>';
    
    // Because of the problems mentioned above, and the fact that there is not
    // a true CDF function for Cochran's C, we also provide critical values
    // for alpha = 0.1, 0.05 and 0.01 using the formula
    //
    // C[alpha, df, K] = 1/[1 + (k-1)/(probF(1 - alpha/k, df, df*(k-1)))]
    //
    // Note that we provide '1 - alpha/k' as first argument to the F inverse
    // distribution instead of the 'alpha/k' seen in standard formulas because
    // jStat.centralF.inv will return the left tail probability of F instead
    // of the required right tail probability
    
    let cv10 = 0;
    let cv05 = 0;
    let cv01 = 0;
    
    cv10 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.10/k, df, df*(k-1))));
    cv05 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.05/k, df, df*(k-1))));
    cv01 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.01/k, df, df*(k-1))));
    
    result += "<p>Critical values of C for</p>";
    result += "<p>&alpha; = <i>0.10</i> &xrarr; " + cv10.toFixed(DPL) + ", hence variances are ";
    result += (cochran_C > cv10 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p>&alpha; = <i>0.05</i> &xrarr; " + cv05.toFixed(DPL) + ", hence variances are ";
    result += (cochran_C > cv05 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p>&alpha; = <i>0.01</i> &xrarr; " + cv01.toFixed(DPL) + ", hence variances are ";
    result += (cochran_C > cv01 ? "heterogeneous":"homogeneous");
    result += "</p>";

    return result;
    
  }


  /****************************************************************************/
  /*                                                                          */
  /*                               Levene's W test                            */
  /*                                                                          */
  /****************************************************************************/


  function testLevene() {

    // The Levene's W test is
    //
    //      (N-k)   Sum[ N_i*(Z_i. - Z_..)² ]
    // W =  ----- * -------------------------
    //      (k-1)   Sum[ Sum(Z_ij - Z_i.)² ]
    //
    // k    = number of means being compared
    // N    = Sum[N_i]
    // N_i  = Ni  = sample size for each mean i (sample sizes are equal)
    // Z_i. = Zi  = mean of group i
    // Z_.. = Z   = average of Z_ij
    // Z_ij = Zij = | Y_ij - Y_i. |
    //
    // Y_ij = Yij = individual observation
    // Y_i. = Yi  = mean of cell or group i
    //
    // The Brown–Forsythe test is a variant of the Levene test where
    // instead of the average Y_i. the median Y_i. is used to compute
    // Z_ij = | Y_ij - Y_i. |
    //
    // For each cell we already have the mean (Y_i.) in variable
    // 'data[i].average', the N_i ('replicates'), 'k' denoting the total
    // number of averages involved in the test ('data.length'),

    let k = data.length;

    // Compute N (total number of observations)
    // Since all cells have the same number of replicates, another way to
    // compute N would be N = k*replicates;
    let N = 0, W = 0;
    for ( let i = 0; i < k; i++ ) N += data[i].n;

    // Compute the first fraction of W (only integers)
    W = (N-k)/(k-1);

    // For each cell, we should compute the deviations of individual values
    // to the median of the cell using the modulo |Y_ij - Y_i.|. These
    // deviations should be summed into Z_.. (denoted by variable 'Z')
    //
    // The donominator of the formula is computed by the sum of the sum
    // of squared individual Z_ij deviations to their average Z_i. Remember
    // that Z_ij = Sum[|Y_ij-Y_i|] i.e., sum of diferences of observations in
    // realtion to their median. The individual Z_ij are not necessary. We
    // need them to compute the square of their deviation to Z_i. averages,
    // which sum will give the denominator of the W formula.

    let Z = 0, Zi = [], zsum, zsum2, denom = 0, z;
    for( let d of data ) {
      zsum = 0, zsum2 = 0;
      for( let v of d.values ) {
        z = Math.abs( v - d.average );
        zsum  += z;
        zsum2 += Math.pow( z, 2 );
        Z     += z;
      }
      // Now compute Zi for this cell
      Zi.push(zsum/replicates);
      denom += zsum2 - Math.pow( zsum, 2 )/replicates;
    }

    // Compute the average of the sum of Z's
    Z = Z/N;

    // Now we know Z_i for each cell (stored in 'Zi' array) and Z_.. (stored
    // in 'Z') and we can compute the denominator Sum[ N_i*(Z_i. - Z_..)² ]

    let numer = 0;

    for( let zi of Zi ) {
      numer += replicates * Math.pow( zi - Z , 2 );
    }

    let levene = W * numer/denom;

    let df = replicates - 1;

    let prob = 1 - jStat.centralF.cdf( levene, k - 1, N - k );

    let result = '';
    result += '<p>F = ' + levene.toFixed(DPL) + '</p>' +
              '<p>for <b><i>k</i> = ' + (k-1).toString() + '</b> groups and ' +
              '<b>&nu; = ' + (N-k).toString() + '</b> degrees of freedom</p>' +
              '<p>P = <b>' + prob.toFixed(DPL) + '</b></p>';

    let cv10 = 0;
    let cv05 = 0;
    let cv01 = 0;

    cv10 = jStat.centralF.inv( 0.90, k - 1, N - k  );
    cv05 = jStat.centralF.inv( 0.95, k - 1, N - k  );
    cv01 = jStat.centralF.inv( 0.99, k - 1, N - k  );

    result += '<p>Critical values for</p>' +
              '<p>&alpha; = <i>0.10</i> &xrarr; ' + cv10.toFixed(DPL) +
              ', hence variances are ' +
              (levene > cv10 ? 'heterogeneous':'homogeneous') + '</p>' +
              '<p>&alpha; = <i>0.05</i> &xrarr; ' + cv05.toFixed(DPL) +
              ', hence variances are ' +
              (levene > cv05 ? 'heterogeneous':'homogeneous') + '</p>' +
              '<p>&alpha; = <i>0.01</i> &xrarr; ' + cv01.toFixed(DPL) +
              ', hence variances are ' +
              (levene > cv01 ? 'heterogeneous':'homogeneous') + '</p>';

    // For the Brown–Forsythe test recompute Z but this time using
    // deviation to the median instead of the average

    Z = 0, Zi = [], zsum, zsum2, denom = 0, z;
    for( let d of data ) {
      zsum = 0, zsum2 = 0;
      for( let v of d.values ) {
        z = Math.abs( v - d.median );
        zsum  += z;
        zsum2 += Math.pow( z, 2 );
        Z     += z;
      }
      // Now compute Zi for this cell
      Zi.push(zsum/replicates);
      denom += zsum2 - Math.pow( zsum, 2 )/replicates;
    }

    // Compute the average of the sum of Z's
    Z = Z/N;

    // Now we know Z_i for each cell (stored in 'Zi' array) and Z_.. (stored
    // in 'Z') and we can compute the denominator Sum[ N_i*(Z_i. - Z_..)² ]

    numer = 0;

    for( let zi of Zi ) {
      numer += replicates * Math.pow( zi - Z , 2 );
    }

    let brown_forsythe = W * numer/denom;

    prob = 1 - jStat.centralF.cdf( brown_forsythe, k - 1, N - k );

    result += '<h2>Brown-Forsythe\'s test</h2>' +
              '<p>F = ' + brown_forsythe.toFixed(DPL) + '</p>' +
              '<p>for <b><i>k</i> = ' + (k-1).toString() + '</b> groups and ' +
              '<b>&nu; = ' + (N-k).toString() + '</b> degrees of freedom</p>' +
              '<p>P = <b>' + prob.toFixed(DPL) + '</b></p>';

    cv10 = 0;
    cv05 = 0;
    cv01 = 0;

    cv10 = jStat.centralF.inv( 0.90, k - 1, N - k  );
    cv05 = jStat.centralF.inv( 0.95, k - 1, N - k  );
    cv01 = jStat.centralF.inv( 0.99, k - 1, N - k  );

    result += '<p>Critical values for</p>' +
              '<p>&alpha; = <i>0.10</i> &xrarr; ' + cv10.toFixed(DPL) +
              ', hence variances are ' +
              (brown_forsythe > cv10 ? 'heterogeneous':'homogeneous') + '</p>' +
              '<p>&alpha; = <i>0.05</i> &xrarr; ' + cv05.toFixed(DPL) +
              ', hence variances are ' +
              (brown_forsythe > cv05 ? 'heterogeneous':'homogeneous') + '</p>' +
              '<p>&alpha; = <i>0.01</i> &xrarr; ' + cv01.toFixed(DPL) +
              ', hence variances are ' +
              (brown_forsythe > cv01 ? 'heterogeneous':'homogeneous') + '</p>';

    return result;

  }

