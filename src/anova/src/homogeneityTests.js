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

    d.innerHTML = '<div class="ct"><h2>Cochran\'s test</h2>' +
                  testCochran() +  '</div>';

    d.innerHTML += '<div class="ct"><h2>Bartlett\'s test</h2>' +
                   testBartlett() +  '</div>';

//     d.innerHTML += '<div class="ct"><h2>Levene\'s test</h2>' +
//                    testLevene() +  '</div>';

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
    //          1 + 1/(3*(k-1))*Sum[1/(n_i-1) - 1/(N-k)]
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
    // D = Sum[1/(n_i-1) - 1/(N-k)]
    //

    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels
    
    let k = partials.length;
    
    // Compute N, the sum of all sample sizes. Since the present anova-web
    // only works with balanced  data sets, summing all n_i's is equivalent
    // to multyplying the number of replicates by the number of partials
    
    let N = 0;
    for( let i = 0; i < partials.length; i++ ) N += partials[i].n;
    
    // Compute the pooled variance s_p² (pvar)
    
    let pvar = 0, v;
    for( let i = 0; i < partials.length; i++ ) {
      v = (partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n);
      v = v/(N-k);
      pvar += v;
    }
    
    let A = (N-k)*Math.log(pvar);

    // Compute B = Sum[(n_i-1)*ln(s_i²)]

    let B = 0, si2;
    for( let i = 0; i < partials.length; i++ ) {
      // Compute s_i² for this ANOVA cell
      si2 =  (partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n);
      si2 = si2/(partials[i].n-1);
      B += (partials[i].n-1)*Math.log(si2);
    }    
    
    // Compute C = 1/(3*(k-1))

    let C = 1/(3*(k-1));
    
    // Compute D = Sum[1/(n_i-1) - 1/(N-k)]

    let D = 0;
    for( let i = 0; i < partials.length; i++ ) {
      D += (1/(partials[i].n-1) - 1/(N-k));
    }
    
    // Compute Bartlett's K value
    
    let bartlett_k = (A - B)/(1 + (C*D));
    
    let prob = 1.0 - jStat.chisquare.cdf(bartlett_k, k-1);
    if( prob > 1 ) prob = 1;
    if( prob < 0 ) prob = 0;
     
    let result = '';
    result += '<p>Bartlett\'s Test for <b><i>k</i> = ' + k.toString() +
              '</b> averages and <b>&nu; = ' + (k-1).toString() +
              '</b> degrees of freedom: <b>' + bartlett_k.toString() +
              '</b></p><p>P = <b>' + prob.toString() + '</b></p>';
    
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
    
    let k = partials.length;
    
    // The corresponding degrees of freedom for each average (which should be
    // equal for balanced analysis) are computed from 'replicates' - 1
    
    let df = replicates - 1;
    
    // Find all variances, sum them all, find the largest and divide
    // by the sum of all variances. This is the Cochran's test
    
    for( let i = 0; i < k; i++ ) {
      let v = partials[i].sumx2 - Math.pow(partials[i].sumx, 2)/partials[i].n;
      v = v/( partials[i].n - 1 );
      if ( v > maxvar ) maxvar = v;
      sumvar += v;       
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
    result += '<p>Cochran\'s Test for <b><i>k</i> = ' +
              k.toString() + '</b> averages and <b>&nu; = ';
    result += df.toString() + '</b> degrees of freedom: <b>' +
              cochran_C.toString() + '</b></p>';
    result += '<p>P = <b>' + prob.toString() + '</b></p>';
    
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
    
    result += "<p>Critical values for &alpha;</p>";
    result += "<p><i>0.10</i>: " + cv10.toString() + ", hence variances are ";
    result += (cochran_C > cv10 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p><i>0.05</i>: " + cv05.toString() + ", hence variances are ";
    result += (cochran_C > cv05 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p><i>0.01</i>: " + cv01.toString() + ", hence variances are ";
    result += (cochran_C > cv01 ? "heterogeneous":"homogeneous");
    result += "</p>";

    return result;
    
  }


  /****************************************************************************/
  /*                                                                          */
  /*                               Levene's W test                            */
  /*                                                                          */
  /****************************************************************************/

  // This is a implementation of a function to compute medians of lists.
  // It may be useful to implement the version of Levene's test with medians,
  // instead of averages.
  //
  // function median( l ) {
  //   if (l.length == 0) return;
  //   l.sort((a, b) => a - b);
  //   let mid = Math.floor( l.length / 2 );
  //   // If odd length, take midpoint, else take average of midpoints
  //   let median = l.length % 2 === 1 ? l[mid] : ( l[mid - 1] + l[mid] ) / 2;
  //   return median;
  // }

//   function testLevene() {
//
//     // The Levene's W test is
//     //
//     //      (N-k)   Sum[ N_i*(Z_i. - Z_..)² ]
//     // W =  ----- * -------------------------
//     //      (k-1)   Sum[ Sum(Z_ij - Z_i.)² ]
//     //
//     // k    = number of means being compared
//     // N    = Sum[N_i]
//     // N_i  = size for mean i (sample sizes must be similar: balanced analysis)
//     // Z_i. = mean of group i
//     // Z_.. = mean of means
//     // Z_ij = individual values
//     //
//     // These quantities are already computed from the information on the
//     // 'partials' array, which has the sum of Z_ij's and the sum of squared
//     // Z_ij's per combinaton of levels of factors, plus the averages Z_i.
//     // for each combination.
//
//     // k denotes the total number of averages involved in the test,
//     // determind by all possible combinations between factor levels
//
//     let k = partials.length;
//
//     // Compute N (total number of observations)
//     let N = 0, W = 0;
//     for ( let i = 0; i < k; i++ ) N += partials[i].n;
//
//     W = (N-k)/(k-1);
//
//     // Compute the numerator Sum[ N_i*(Z_i. - Z_..)² ]
//     // Z_i. are the group means
//     // Z_.. is the grand mean
//     // To alculate the above mentioned quantity it's
//     // better to calculate the sum of all means and the
//     // sum of all squared means. The formula
//     //
//     // Sum Z_i² - (Sum )²/N is equivalent to
//     //
//     // Sum[ N_i*(Z_i. - Z_..)² ]
//
//     let A = 0, a1;
//     for( let i = 0; i < k; i++ ) {
//       a1 = partials[i].sumx2 - Math.pow(partials[i].sum, 2)/partials[i].n;
//       A += partials[i].n * a1;
//     }
//
//     // Compute the denominator Sum[ Sum(Z_ij - Z_i.)² ]
//
//     let B = 0, sumx = 0, sumx2 = 0, nt = 0;
//     for( let i = 0; i < k; i++ ) {
//       sumx  += partials[i].sum;
//       sumx2 += partials[i].sumx2;
//       nt    += partials[i].n;
//     }
//     let b1 = sumx2 - Math.pow(sumx,2)/nt;
//
//     //console.log(W);
//     console.log(data)
//     //console.table(partials);
//
//     // The corresponding degrees of freedom for each average (which should be
//     // equal for balanced analysis) are computed from 'replicates' - 1
//
//     let df = replicates - 1;
//
//     let prob = 0.0, levene_w = 0.0;
//
//     let result = '';
//     result += '<p>Levene\'s Test for <b><i>k</i> = ' +
//               k.toString() + '</b> averages and <b>&nu; = ';
//     result += df.toString() + '</b> degrees of freedom: <b>' +
//               levene_w.toString() + '</b></p>';
//     result += '<p>P = <b>' + prob.toString() + '</b></p>';
//
//     return result;
//
//   }

