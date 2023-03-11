
  /*************************************************************************/
  /*                                                                       */
  /*                          multipleTTests                               */
  /*                                                                       */
  /* Perform multiple instances of a t-test made between two samples drawn */
  /* from the same population. If a sufficient number of tests is made, it */
  /* is possible to estimate the distribution of the t statistic           */
  /*                                                                       */
  /*************************************************************************/

  function multipleTTests() {

    let fmt = {minimumFractionDigits: DPL};
      
    // Grab population parameters from 'sample.html'
    
    let N    = parseInt(document.getElementById('mttests_N').value);
    let mean = parseFloat(document.getElementById('mttests_avg').value);
    let std  = parseFloat(document.getElementById('mttests_std').value);
    let n    = parseInt(document.getElementById('mttests_n').value);

    // console.log(N, mean, std, n);
    
    // Clear anything in 't_res' <div>s
    
    let result = document.getElementById('mttests_results');
    result.innerHTML = '';

    
    // Generate N t-tests by sampling two samples with
    // n1 and n2 replicates each from a virtual population
    // with mean = t_avg and variance = (t_std)²

    let ttests = [];

    let x, sumx, sumx2, x1, var1, x2, var2;

    for ( let i = 0; i < N; i++ ) {

      // First sample

      sumx = 0, sumx2 = 0;
      for ( let j = 0; j < n; j++ ) {
        x1 = jStat.normal.sample( mean, std );
        sumx += x1;
        sumx2 += Math.pow( x1, 2);
      }
      x1 = sumx/n;
      var1 = ( sumx2 - Math.pow( sumx, 2)/n )/(n-1);

      sumx = 0, sumx2 = 0;
      for ( let j = 0; j < n; j++ ) {
        x2 = jStat.normal.sample( mean, std );
        sumx += x2;
        sumx2 += Math.pow( x2, 2 );
      }
      x2 = sumx/n;
      var2 = ( sumx2 - Math.pow( sumx, 2 )/n )/(n-1);

      ttests.push((x1-x2)/Math.sqrt(var1/n+var2/n));
    }
  
    let text = '<h3>Multiple <em>t</em>-tests</h3>';
    text += '<textarea cols="20" rows="10">';
    for ( let i = 0; i < N; i++ )
      text += ttests[i].toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';
    result.innerHTML = text;
    result.style.display = 'inline-block';
    
  }
