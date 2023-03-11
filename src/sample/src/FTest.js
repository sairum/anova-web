
  /*************************************************************************/
  /*                                                                       */
  /*                                 FTest                                 */
  /*                                                                       */
  /*      Perform a F-test between two variances sampled from the same     */
  /*      population (H0 is true).                                         */
  /*                                                                       */
  /*************************************************************************/

  function FTest() {

    let fmt = {minimumFractionDigits: DPL};

    // Grab population parameters from 'sampling.html'

    let mean      = parseFloat(document.getElementById('ftest_avg').value);
    let std       = parseFloat(document.getElementById('ftest_std').value);
    let variance  = parseFloat(document.getElementById('ftest_var').value);
    let n1        = parseInt(document.getElementById('ftest_n1').value);
    let n2        = parseInt(document.getElementById('ftest_n2').value);

    //console.log(mean, std, variance, n1, n2);
    
    // Clear anything in 'ftest_result' <div>s
    
    let result = document.getElementById('ftest_results');
    result.innerHTML = '';

    let stats = document.getElementById('ftest_stats');
    stats.innerHTML = '';

    // Generate a F-tests by sampling two samples with
    // n1 and n2 replicates each, and dividing the variance
    // of sample 1 by the variance of sample 2
    
    let ftest, v1 = [], v2 = [];

    let x, sumx, sumx2;

    x = 0.0, sumx = 0, sumx2 = 0;;
    for ( let j = 0; j < n1; j++ ) {
      x = jStat.normal.sample( mean, std );
      v1.push( x );
      sumx += x;
      sumx2 += Math.pow( x , 2 );
    }
    let var1 = ( sumx2 - Math.pow( sumx, 2 )/n1 )/( n1-1 );

    x = 0.0, sumx = 0, sumx2 = 0;
    for ( let j = 0; j < n2; j++ ) {
      x = jStat.normal.sample( mean, std );
      v2.push( x );
      sumx += x;
      sumx2 += Math.pow( x, 2 );
    }
    let var2 = ( sumx2 - Math.pow( sumx, 2 )/n2 )/(n2-1);

    ftest = var1 / var2;
  
    let text = '<h3>Sample 1</h3>';
    text += '<textarea cols="20" rows="10" id="ttest_results1">';
    for ( let v of v1 )  text += v.toLocaleString( undefined, fmt ) + '\n';
    text += '\n';
    text += '</textarea>';

    text += '<h3>Sample 2</h3>';
    text += '<textarea cols="20" rows="10" id="ttest_results2">';
    for ( let v of v2 )  text += v.toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';

    result.innerHTML = text;
    result.style.display = 'inline-block';

    let p1 = 1 - jStat.centralF.cdf( ftest , n1 - 1, n2 - 1 );

    text = '<h3><em>F</em>-test</h3>' +
           '<table>' +
           '<tr><td>F statistic</td><td>' +
           ftest.toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td>p</td><td>' +
           (p1).toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td>s²<sub>1</sub></td><td>' +
           var1.toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td>s²<sub>2</sub></td><td>' +
           var2.toLocaleString( undefined, fmt ) + '</td></tr>' +
           '<tr><td>&nu;<sub>1</sub></td><td>' +
           (n1 - 1).toString() + '</td></tr>' +
           '<tr><td>&nu;<sub>2</sub></td><td>' +
           (n2 - 1).toString() + '</td></tr></table>';

//     console.log('jStat.centralF.pdf( ftest , n1 - 1, n2 - 1 )', jStat.centralF.pdf( ftest , n1 - 1, n2 - 1 ));
//     console.log('1 - jStat.centralF.pdf( ftest , n1 - 1, n2 - 1 )', 1-jStat.centralF.pdf( ftest , n1 - 1, n2 - 1 ));
//     console.log('jStat.centralF.cdf( ftest , n1 - 1, n2 - 1 )', jStat.centralF.cdf( ftest , n1 - 1, n2 - 1 ));
//     console.log('1 - jStat.centralF.cdf( ftest , n1 - 1, n2 - 1 )', 1-jStat.centralF.cdf( ftest , n1 - 1, n2 - 1 ));

    stats.innerHTML = text;
    stats.style.display = 'inline-block';

  }
