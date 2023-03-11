
  /*************************************************************************/
  /*                                                                       */
  /*                            sampleNormal                               */
  /*                                                                       */
  /*                  Sample from the Normal distribution.                 */
  /*                                                                       */
  /*************************************************************************/


  function sampleNormal() {

    let fmt = {minimumFractionDigits: DPL};

    //Grab population parameters from 'sample.html'
    
    let mean = parseFloat(document.getElementById('normal_avg').value);
    let std  = parseFloat(document.getElementById('normal_std').value);
    let n    = parseInt(document.getElementById('normal_n').value);
    
    //console.log(mean, std, n);
    
    //Clear anything in 'mormres' and 'normstats' <div>s
    
    let result = document.getElementById('normal_results');
    result.innerHTML = '';
    
    let stats = document.getElementById('normal_stats');
    stats.innerHTML = '';
    
    // Generate a sample of n replicates from a population
    // with average = 'mean' and standard deviation = 'std'

    let x = 0, s = [], sumx = 0, sumx2 = 0;
    for ( let i = 0; i < n; i++ ) {
      x = jStat.normal.sample( mean, std );
      sumx += x;
      sumx2 += Math.pow(x,2);
      s.push(x); 
    }
    
    let avg = ( sumx / n );
    let variance = ((sumx2 - Math.pow(sumx,2)/n)/(n-1));
    let sd = Math.sqrt(variance);
    
    let text = '<h3>Sampled values</h3>' +
               '<textarea cols="20" rows="10" id="norm_results">';
    for ( let i = 0; i < n; i++ )
      text += s[i].toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';

    result.innerHTML = text;
    result.style.display = 'inline-block'; n
    
    text = '<h3>Sample statistics</h3>' +
           '<table><tr><td>x&#772; (average)</td><td>' +
           avg.toLocaleString( undefined, fmt ) + '</td></tr><tr>' +
           '<td><i>s</i> (stdev)</td><td>' +
           sd.toLocaleString( undefined, fmt ) + '</td></tr><tr>' +
           '<td><i>s</i>&sup2; (variance)</td><td>' +
           variance.toLocaleString( undefined, fmt ) + '</td></tr>';

    stats.innerHTML = text;
    stats.style.display = 'inline-block';
    
  }
