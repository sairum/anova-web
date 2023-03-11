
  /*************************************************************************/
  /*                                                                       */
  /*                            sampleNormalNTimes                         */
  /*                                                                       */
  /* Sample from the Normal distribution N times to observe the Central    */
  /* Limit Theorem. The Average of the averages is a good estimator of the */
  /* average of the population, and this does hold for almost any          */
  /* distribution. The Variance of the averages equals the variance of the */
  /* population times the square root of the number of replicates          */
  /*                                                                       */
  /*************************************************************************/


  function sampleNormalNTimes() {
      
    let fmt = {minimumFractionDigits: DPL};

    //Grab population parameters from 'sample.html'

    let N    = parseInt( document.getElementById('clt_N').value );
    let mean = parseFloat( document.getElementById('clt_avg').value );
    let std  = parseFloat( document.getElementById('clt_std').value );
    let r    = parseInt( document.getElementById('clt_n').value );
    
    // console.log(N, mean, std, r);
    
    // Clear anything in 'ctl_res' and 'ctl_stats' <div>s
    
    let result = document.getElementById('clt_results');
    result.innerHTML = '';
    
    let stats = document.getElementById('clt_stats');
    stats.innerHTML = '';
    
    // Generate N samples of n replicates from a population
    // with average = 'mean' and standard deviation = 'std'
    
    let averages = [], sumx = 0, sumx2 = 0;
    
    for ( let i = 0; i < N; i++ ) {
      let x = 0.0;
      for ( let j = 0; j < r; j++ ) {
        x += jStat.normal.sample( mean, std );
      }
      x = x/r;
      averages.push( x );
      sumx += x;
      sumx2 += Math.pow( x, 2 );
    }  
    
    let avg = ( sumx / N );
    let variance = ( (sumx2 - Math.pow( sumx, 2 )/N )/(N-1));
    let sd = Math.sqrt( variance );
    
    let text = '<h3>Sampled averages</h3>';
    text += '<textarea cols="20" rows="10" id="clt_results">';
    for ( let i = 0; i < N; i++ )
      text += averages[i].toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';

    result.innerHTML = text;
    result.style.display = 'inline-block';
    
    text = '<h3>Sample statistics</h3>' +
           '<table><tr><td>x&#772;&#772; (average of averages)</td><td>' +
           avg.toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td><i>s&#772;</i> (stdev of averages)</td><td>' +
           sd.toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td><i>s&#772;</i>&sup2; (variance of averages)</td><td>' +
           variance.toLocaleString( undefined, fmt ) + '</td></tr>';

    stats.innerHTML = text;
    stats.style.display = 'inline-block';
    
  }
