
  /*************************************************************************/
  /*                                                                       */
  /*                                 tTest                                 */
  /*                                                                       */
  /*    Perform a t-test between two samples. The default is to have an    */
  /*    effect size of 0, meaning that we are sampling from the same       */
  /*    population (H0 is true)                                            */
  /*                                                                       */
  /*************************************************************************/

  function tTest() {

    let fmt = {minimumFractionDigits: DPL};

    //Grab population parameters from 'sample.html'

    let diff = parseInt(document.getElementById('ttest_diff').value);
    let mean = parseFloat(document.getElementById('ttest_avg').value);
    let std  = parseFloat(document.getElementById('ttest_std').value);
    let n    = parseInt(document.getElementById('ttest_n').value);
    //console.log(diff, mean, std, n);
    
    //Clear anything in 't_res' <div>s
    
    let result = document.getElementById('ttest_results');
    result.innerHTML = '';

    let stats = document.getElementById('ttest_stats');
    stats.innerHTML = '';
    
    // Generate N t-tests by sampling two samples with
    // n1 and n2 replicates each from a virtual population
    // with mean = t_avg and variance = (t_std)²

    let s1 = [], s2 = [];
     
    let x, sumx, sumx2, x1, var1, x2, var2;
     
    // First sample
       
    sumx = 0, sumx2 = 0;

    //let v1 = [11.2, 12.4, 10.3, 10.5, 7.7, 12.1, 8.3, 9.4, 10.5]; n=9;
    for ( let i = 0; i < n; i++ ) {
      x = jStat.normal.sample( mean, std );
      sumx += x;
      sumx2 += Math.pow(x,2);
      s1.push(x);
    }
    x1 = sumx/n;
    var1 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);

    sumx = 0, sumx2 = 0;

    for ( let i = 0; i < n; i++ ) {
      x = jStat.normal.sample(mean + diff, std );
      sumx += x;
      sumx2 += Math.pow(x,2);
      s2.push(x);
    }
    x2 = sumx/n;
    var2 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);
     
    //console.log(x1,var1,x2,var2)
  
    let text = '<h3>Sample 1</h3>';
    text += '<textarea cols="20" rows="10" id="ttest_results1">';
    for ( let i = 0, ln = s1.length; i < ln; i++ )
      text += s1[i].toLocaleString( undefined, fmt ) + '\n';
    text += '\n';
    text += '</textarea>';

    text += '<h3>Sample 2</h3>';
    text += '<textarea cols="20" rows="10" id="ttest_results2">';
    for ( let i = 0, ln = s2.length; i < ln; i++ )
      text += s2[i].toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';
     
     
    result.innerHTML = text;
    result.style.display = 'inline-block';
     
    // We use Math.abs(x1-x2) because otherwise the t-test may yeld negative
    // values. This, per se, is not a problem but the jstat function
    // studentt(t,df) will return the probability of observing a value <= t
    // (i.e. the probability of observing a value smaller than the passed calue
    // of t). We want the reciprocal of this probability (1-p), that is, the
    // probability of observing a t value equal or larger than the one passed
    // to the function. However, if the value of t is negative, we will want
    // to get the probability of obtaining a value equal or smaller than the
    // value of t passed. In such cases, this is given directly by jstat's
    // studentt(t,df), and there is no need to compute 1-p. To avoid this, we
    // always compute the probability of obtaining a positive value of t or
    // larger. Moreover, doing this, the two-tailed probability will also be
    // always the double of the one tail probability returned by jstat's
    // studentt(t,df).
    //
    // t = 15, df = 10
    // p one tail   = 0.999999982519
    // 1-p one tail = 0.000000017481
    //
    // t = -15, df = 10
    // p one tail   = 0.000000017481
    // 1-p one tail = 0.999999982519
    //

    let t = Math.abs(x1-x2)/Math.sqrt(var1/n+var2/n);
    let p1 = 1-jStat.studentt.cdf(t,2*(n-1));
    let p2 = p1*2;

     
    text = '<h3><em>t</em>-test</h3>';
    text += '<textarea cols="20" rows="10">';

    text += 't statistic = ' + t.toLocaleString( undefined, fmt ) + '\n';
    text += 'p (two tailed) = ' + (p2).toLocaleString( undefined, fmt ) + '\n';
    text += 'p (one tailed) = ' + (p1).toLocaleString( undefined, fmt ) + '\n';
    text += '</textarea>';

    //     console.log('jStat.studentt.pdf( t , 2*(n-1) )', jStat.studentt.pdf( t , 2*(n-1) ));
    //     console.log('1 - jStat.studentt.pdf( t , 2*(n-1) )', 1-jStat.studentt.pdf( t , 2*(n-1) ));
    //     console.log('jStat.studentt.cdf( t , 2*(n-1) )', jStat.studentt.cdf( t , 2*(n-1) ));
    //     console.log('1 - jStat.studentt.cdf( t , 2*(n-1) )', 1-jStat.studentt.cdf( t , 2*(n-1) ));

    stats.innerHTML = text;
    stats.style.display = 'inline-block';
     
    
  }
