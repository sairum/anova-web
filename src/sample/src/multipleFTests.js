
  /*************************************************************************/
  /*                                                                       */
  /*                          multipleFTests                               */
  /*                                                                       */
  /* Perform multiple instances of a F-test made between two samples drawn */
  /* from the same population. If a sufficient number of tests is made, it */
  /* is possible to estimate the distribution of the F statistic           */
  /*                                                                       */
  /*************************************************************************/


  function multipleFTests() {

    let fmt = {minimumFractionDigits: DPL};
      
    // Grab population parameters from 'sample.html'
    
    let N    = parseInt(document.getElementById('mftests_N').value);
    let mean = parseFloat(document.getElementById('mftests_avg').value);
    let std  = parseFloat(document.getElementById('mftests_std').value);
    let n1   = parseInt(document.getElementById('mftests_n1').value);
    let n2   = parseInt(document.getElementById('mftests_n2').value);

    //console.log(N, mean, std, n1, n2);
    
    /*
     * Clear anything in 'F_res' <div>s
     */
    
    let result = document.getElementById('mftests_results');
    result.innerHTML = '';

    
    // Generate N F-tests by sampling two samples with
    // n1 and n2 replicates each, and dividing the variance
    // of sample 1 by the variance of sample 2
    
    let ftests = [];

    let x, sumx, sumx2;

    for ( let i = 0; i < N; i++ ) {
      x = 0.0, sumx = 0, sumx2 = 0;;
      for ( let j = 0; j < n1; j++ ) {
        x = jStat.normal.sample( mean, std );
        sumx += x;
        sumx2 += Math.pow(x,2);
      }
      let var1 = ( sumx2 - Math.pow( sumx, 2 ) / n1 )/(n1-1);

      x = 0.0, sumx = 0, sumx2 = 0;
      for ( let j = 0; j < n2; j++ ) {
        x = jStat.normal.sample( mean, std );
        sumx += x;
        sumx2 += Math.pow(x,2);
      }
      let var2 = ( sumx2 - Math.pow( sumx, 2 )/ n2 )/(n2-1);

      ftests.push(var1/var2);
    }
  
    let text = '<h3>Multiple F-tests</h3>';
    text += '<textarea cols="20" rows="10">';
    for ( let i = 0; i < N; i++ )
      text += ftests[i].toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';

    result.innerHTML = text;
    result.style.display = 'inline-block';
//     
//     text = '<h3>Sample statistics</h3>';
//     text += '<table><tr><td>X&#772;&#772; (average of averages)</td><td>' + avg.toString() + '</td></tr>';
//     text += '<tr><td><i>s&#772;</i> (stdev of averages)</td><td>' + sd.toString() + '</td></tr>';
//     text += '<tr><td><i>s&#772;</i>&sup2; (variance of averages)</td><td>' + variance.toString() + '</td></tr>';
//     stats.innerHTML = text;
//     stats.style.display = 'inline-block';
    
  }
