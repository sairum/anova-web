  function testBartlett() {
      
    /*
     * Compute Bartlett's test   
     * 
     *           (N-k)*ln(s_p²) - Sum[(n_i-1)*ln(s_i²)]
     * X² =     ---------------------------------------
     *          1 + 1/(3*(k-1))*Sum[1/(n_i-1) - 1/(N-k)]
     * 
     * N    = Sum[n_i]
     * s_p² = Sum[(n_i-1)*s_i²]/(N-k)
     * k    = number of means being compared
     * n_i  = size for mean i (sample sizes should be similar: balanced analysis)
     * s_i² = variance of sample i
     * 
     * An easier way to do this, well explained at 
     * https://stattrek.com/online-calculator/bartletts-test.aspx
     * is as follows:
     * 
     *         A - B
     * X² = -----------
     *      1 + (C * D)
     * 
     * with 
     * 
     * A = (N-k)*ln(s_p²)
     * B = Sum[(n_i-1)*ln(s_i²)]
     * C = 1/(3*(k-1))
     * D = Sum[1/(n_i-1) - 1/(N-k)]
     * 
     * 
     */

    /*
     * k denotes the total number of averages involved in the test,
     * determind by all possible combinations between factor levels
     */
    
    let k = partials.length;
    
    /*
     * Compute N, the sum of all sample sizes. Since the present anova-web only
     * works with balanced  data sets, summing all n_i's is equivalent to
     * multyplying the number of replicates by the number of partials
     */
    
    let N = 0;
    for( let i = 0; i < partials.length; i++ ) N += partials[i].n;
    
    /*
     * Compute the pooled variance s_p² (pvar)
     */
    
    let pvar = 0;
    for( let i = 0; i < partials.length; i++ ){
      pvar += (partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n)/(N-k);
    }
    
    let A = (N-k)*Math.log(pvar);

    /*
     * Now compute B = Sum[(n_i-1)*ln(s_i²)]
     */
    
    let B = 0;
    for( let i = 0; i < partials.length; i++ ){
      B += (partials[i].n-1)*Math.log((partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n)/(partials[i].n-1));
    }    
    
    /*
     * Now compute C = 1/(3*(k-1))
     */
    
    let C = 1/(3*(k-1));
    
    /*
     * Now compute D = Sum[1/(n_i-1) - 1/(N-k)]
     */

    let D = 0;
    for( let i = 0; i < partials.length; i++ ){
      D += (1/(partials[i].n-1) - 1/(N-k));
    }
    
    /*
     * Now compute Bartlett's K value
     */
    
    let bartlett_k = (A - B)/(1 + (C*D));
    
    let prob = 1.0 - jStat.chisquare.cdf(bartlett_k, k-1);
    if( prob > 1 ) prob = 1;
    if( prob < 0 ) prob = 0;
     
    let result = "";
    result += "<p>Bartlett's Test for <b><i>k</i> = " + k.toString() + "</b> averages and <b>&nu; = ";
    result += (k-1).toString() + "</b> degrees of freedom: <b>" + bartlett_k.toString() + "</b></p>";
    result += "<p>P = <b>" + prob.toString() + "</b></p>"; 
    
//     result += "<p>N = " + N.toString() + " (N-k) = " + (N-k).toString() + " Pvar = " + pvar.toString() + "</p>"; 
//     result += "<p>A = " + A.toString() + "</p>"; 
//     result += "<p>B = " + B.toString() + "</p>"; 
//     result += "<p>C = " + C.toString() + "</p>"; 
//     result += "<p>D = " + D.toString() + "</p>"; 
    
 
    
    return result;
    
  }    
  
  function testCochran() {
      
    /*
     * Compute Cochran's C test which is a ratio between the largest sample 
     * variance over the sum of all sample variances. 'maxvar' will hold
     * the largest variance, whilst 'sumvar' will keep the sum of all 
     * variances
     */
    
    let maxvar = 0;
    let sumvar = 0;
    
    /*
     * k denotes the total number of averages involved in the test,
     * determind by all possible combinations between factor levels
     */
    
    let k = partials.length;
    
    /*
     * The corresponding degrees of freedom for each average (which should be 
     * equal for balanced analysis) are computed from 'replicates' - 1
     */
    
    let df = replicates - 1;
    
    /*
     * Find all variances, sum them all, find the largest and divide
     * by the sum of all variances. This is the Cochran's test
     */
    
    for( let i = 0; i < k; i++ ) {
      let v = partials[i].sumx2 - Math.pow( partials[i].sumx, 2 )/partials[i].n;
      v = v/( partials[i].n - 1 );
      if ( v > maxvar ) maxvar = v;
      sumvar += v;       
    }
    
    let cochran_C = maxvar/sumvar;
    
    /*
     * To compute the probabilty of obtaining a value of the C statistic larger
     * than the resulting C value we use the algorithm which was implemented in 
     * 'mwanova.cgi' which behaves quite well for most cases but produces some 
     * erroneous probabilities in marginal cases. For example, a C = 0.218533, 
     * with 8 means and 2 degrees of freedom (real case in '3-way.txt') produces 
     * a P = 1.42385557279749! According to Igor Baskir <baskir_At_univer.kharkov.ua> 
     * if the probability is larger than 1 one we must use the equation 
     * P = Math.abs( Math.ceil(P) - P ). However, this works when the F function
     * used in the algorithm below actually gives the right tail probability of F
     * ('fprob' in mwanova.cgi does that), but not when it gives the left tail 
     * probability as many functions do (jStat, excel's F.INV, libreoffice FINV, etc)
     * 
     * Apparently the equation  P = Math.abs( Math.floor(P) - P ) seems to hold
     * in many cases...
     */
    
    let prob = 0.0;
    if( ( cochran_C > 0 ) && ( k > 1 ) ) {
      prob = jStat.centralF.cdf(( 1/cochran_C -1 )/(k-1),((k-1)*df),df)*k;
      //console.log(prob, (1/c-1)/(k-1));
      if( prob > 1 ) prob = Math.abs( Math.floor(prob) - prob );
     }
    //let f = (1/c - 1.0)/(k - 1.0);
    //P = jStat.centralF.cdf(f, df * (k - 1.0), df) * k;

    let result = "";
    result += "<p>Cochran's Test for <b><i>k</i> = " + k.toString() + "</b> averages and <b>&nu; = ";
    result += df.toString() + "</b> degrees of freedom: <b>" + cochran_C.toString() + "</b></p>";
    result += "<p>P = <b>" + prob.toString() + "</b></p>";  
    
    /*
     * Because of the abovemention problems, and the fact that there is not 
     * a true CDF function for Cochran's C, we also provide critical values
     * for alpha = 0.1, 0.05 and 0.01 using the formula
     * 
     * C[alpha, df, K] = 1/[1 + (k-1)/(probF(1 - alpha/k, df, df*(k-1)))]
     * 
     * Note that we provide '1 - alpha/k' as first argument to the F inverse 
     * distribution instead of the 'alpha/k' seen in standard formulas because
     * jStat.centralF.inv will return the left tail probability of F instead 
     * of the required right tail probability
     */
    
    let cv10 = 0;
    let cv05 = 0;
    let cv01 = 0;
    
    cv10 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.10/k, df, df*(k-1))));
    cv05 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.05/k, df, df*(k-1))));
    cv01 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.01/k, df, df*(k-1))));
    
    result += "<p>Critical values for &alpha;</p>";
    result += "<p><i>0.10</i>: " + cv10.toString() + ", hence ";
    result += (cochran_C > cv10 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";
    result += "<p><i>0.05</i>: " + cv05.toString() + ", hence ";
    result += (cochran_C > cv05 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";
    result += "<p><i>0.01</i>: " + cv01.toString() + ", hence ";
    result += (cochran_C > cv01 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";

    return result;
    
  }

  /*************************************************************************/
  /*                                                                       */
  /*              Computation of homoscedasticity tests                    */
  /*                                                                       */
  /* Right now, only Cochran's C test is implemented.                      */ 
  /*                                                                       */  
  /*************************************************************************/  
 
  function homogeneityTests() {
      
    let d = document.getElementById('homogen');
    
    d.innerHTML = '<div class="ct">Cochran\'s test' + testCochran() + "</div>";
    
    d.innerHTML += '<div class="ct">Bartlett\'s test' + testBartlett() + "</div>";
    
  }
