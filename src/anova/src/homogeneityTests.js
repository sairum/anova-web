
  
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
 
  
  //   <ul>    
  //     <li>
  //       <div class="collapsible-header"><i class="material-icons">filter_drama</i>First</div>
  //       <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
  //     </li>
  //     <li>
  //       <div class="collapsible-header"><i class="material-icons">place</i>Second</div>
  //       <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
  //     </li>
  //     <li>
  //       <div class="collapsible-header"><i class="material-icons">whatshot</i>Third</div>
  //       <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
  //     </li>
  //   </ul>

  function homogeneityTests() {
      
    let d = document.getElementById('homogen');
    
    d.innerHTML = '<div class="ct">Cochran\'s test' + testCochran() + "</div>";
    
    //let html = "<h2>Cochran's Test</h2>";
    
    //html += testCochran();

    //d.innerHTML = html;
    
  }
