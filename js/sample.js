"use strict";

var ui = (function () {
     
  /*************************************************************************/
  /*                                                                       */
  /*                             Global Variables                          */
  /*                                                                       */
  /*************************************************************************/  

  // Number of decimal places for floating point numbers
  
  var DPL = 6;


  

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
 
  function reset(tagid) {
    
    /*
     * _avg and _std and _var are common to all simulations
     */
    
    document.getElementById(tagid + "_avg").value = "8.0";  
    document.getElementById(tagid + "_std").value = "1.5";  
    document.getElementById(tagid + "_var").value = "2.25";
    
    /*
     * Only F tests have no 'n' for replicates 
     * (they have n1 and n2)
     */
    
    if ( ( tagid !== 'F' ) ) document.getElementById(tagid + "_n").value = "10";
    else {
      document.getElementById("F_n1").value = "2"; 
      document.getElementById("F_n2").value = "10"; 
    }    
    
    /*
     * All simulations have 'N' (number of samples) except 
     * the one for sampling from the normal distribution
     * ( tagid ='norm' )
     */
    
    if ( tagid !== 'norm' ) document.getElementById(tagid + "_N").value = "100";
    
    /*
     * Clean also the results section (a <textarea>)
     */
    
    document.getElementById(tagid + "_results").value = "";
    
  }
  
  

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
  
  function setPrecision( tag ) {
    let s = document.getElementById( tag + '_precision' ).value;
    DPL = parseInt(s);
    if(DPL < 1) {
      document.getElementById( tag + '_precision' ).value = 1;
      DPL = 1;
    } else {
      if(DPL > 10) {
        document.getElementById( tag + '_precision' ).value = 10;
        DPL = 10;
      } else {
        document.getElementById( tag + '_precision' ).value = DPL;
      }    
    }    
  }

  /*************************************************************************/
  /*                                                                       */
  /* Automatically compute the standard deviation based on the variance    */
  /* that is provided in input '<tagid>_var'                               */
  /*                                                                       */
  /*************************************************************************/

  function setSTD( tagid ) {

    let fmt = {minimumFractionDigits: DPL};

    let s = document.getElementById( tagid + "_var" ).value;
    document.getElementById( tagid + "_std" ).value = Math.sqrt(s);
  }

  /*************************************************************************/
  /*                                                                       */
  /* Automatically compute the variance based on the standard deviation    */
  /* that is provided in input '<tagid>_std'                               */
  /*                                                                       */
  /*************************************************************************/

  function setVar( tagid ) {

    let fmt = {minimumFractionDigits: DPL};

    let s = document.getElementById( tagid + "_std" ).value; 
    document.getElementById( tagid + "_var" ).value = Math.pow(s,2);
  }    
  

  /*************************************************************************/
  /*                                                                       */
  /*                              setupForms                               */
  /*                                                                       */
  /* Setup the various forms needed to simulate sampling from different    */
  /* distributions. Forms are stored in a array of objects with the fields */
  /* necessary for their rendering                                         */
  /*                                                                       */
  /*************************************************************************/

  // Parameters for normal distribution

  let normparams = [
    { name: '&mu; (average)',
      tag : '<input type="number" id="normal_avg" value="8.0">'},
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="normal_std" min="0.1" value="1.5" ' +
            'step="0.1" onchange="ui.setVar(\'normal\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="normal_var" value="2.25" ' +
            'onchange="ui.setSTD(\'normal\')">' },
    { name: '<em>n</em> (replicates)',
      tag : '<input type="number" id="normal_n" min="1" value="10" step="1">'},
    { name: '', tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="normal_precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="ui.setPrecision(\'normal\')">' },
    { name: '',
      tag : '<button class="button" onclick="ui.sampleNormal()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'normal\')">' +
            'Reset</button>' }];

  // Parameters for the central limit theorem

  let cltparams = [
    { name: 'N (num. samples)',
      tag : '<input type="number" id="clt_N" value="100">' },
    { name: '',
      tag : '' },
    { name: '&mu; (average)',
      tag : '<input type="number" id="clt_avg" value="8.0">' },
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="clt_std" min="0.1" value="1.5" ' +
            'step="0.1" onchange="ui.setVar(\'clt\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="clt_var" value="2.25" ' +
            'onchange="ui.setSTD(\'clt\')">' },
    { name: '<em>n</em> (replicates)',
      tag : '<input type="number" id="clt_n" min="1" value="10" step="1">'},
    { name: '',
      tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="clt_precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="ui.setPrecision(\'clt\')">' },
    { name: '',
      tag : '' },
    { name: '',
      tag : '<button class="button" onclick="ui.sampleNormalNTimes()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'clt\')">' +
            'Reset</button>' }];

   // Parameters for the t-test simulation

  let ttestparams = [
    { name: 'Effect size (&mu;<sub>2</sub> - &mu;<sub>1</sub>)',
      tag : '<input type="number" id="ttest_diff" value="0.0">' },
    { name: '',
      tag : '' },
    { name: '&mu;<sub>1</sub> (average)',
      tag : '<input type="number" id="ttest_avg" value="8.0">' },
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="ttest_std" min="0.1" value="1.5" ' +
            'step="0.1"  onchange="sample.setVar(\'ttest\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="ttest_var" value="2.25" ' +
            'onchange="sample.setSTD(\'ttest\')">' },
    { name: 'n (replicates)',
      tag : '<input type="number" id="ttest_n" value="10">' },
    { name: '',
      tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="sample.setPrecision(\'ttest\')">'},
    { name: '',
      tag : '<button class="button" onclick="ui.tTest()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'ttest\')">' +
            'Reset</button>' } ];

  // Parameters for the multiple t-test simulation to build empirical
  // central (effect size = 0) or non-ventral (effect size != 0 )
  // distribution of the t statistic

  let mttestsparams = [
    { name: 'N (num. samples)',
      tag : '<input type="number" id="mttests_N" value="100" step="1" min="2">' },
    { name: '',
      tag : '' },
    { name: '&mu; (average)',
      tag : '<input type="number" id="mttests_avg" value="8.0">' },
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="mttests_std" min="0.1" value="1.5" ' +
            'step="0.1" onchange="ui.setVar(\'mttests\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="mttests_var" value="2.25" ' +
            'onchange="ui.setSTD(\'mttests\')">' },
    { name: '<em>n</em> (replicates)',
      tag : '<input type="number" id="mttests_n" min="1" value="10" step="1">'},
    { name: '',
      tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="mttests_precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="ui.setPrecision(\'mttests\')">' },
    { name: '',
      tag : '' },
    { name: '',
      tag : '<button class="button" onclick="ui.multipleTTests()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'mttests\')">' +
            'Reset</button>' }
    ];

  // Parameters for the F-test simulation

  let ftestparams = [
    { name: '&mu; (average)',
      tag : '<input type="number" id="ftest_avg" value="8.0">' },
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="ftest_std" min="0.1" value="1.5" ' +
            'step="0.1"  onchange="ui.setVar(\'ftest\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="ftest_var" value="2.25" ' +
            'onchange="ui.setSTD(\'ftest\')">' },
    { name: 'n<sub>1</sub> (replicates of sample 1)',
      tag : '<input type="number" id="ftest_n1" value="5">' },
    { name: 'n<sub>2</sub> (replicates of sample 2)',
      tag : '<input type="number" id="ftest_n2" value="10">' },
    { name: '',
      tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="ftest_precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="ui.setPrecision(\'ftest\')">' },
    { name: '',
      tag : '<button class="button" onclick="ui.FTest()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'ftest\')">' +
            'Reset</button>' } ];

  // Parameters for the sampling multiple variances and performing F-tests to
  // build the empirical central F distribution.

  let mftestsparams = [
    { name: 'N (num. samples)',
      tag : '<input type="number" id="mftests_N" value="100" step="1" min="2">' },
    { name: '',
      tag : ''},
    { name: '&mu; (average)',
      tag : '<input type="number" id="mftests_avg" value="8.0">' },
    { name: '&sigma; (stdev)',
      tag : '<input type="number" id="mftests_std" min="0.1" value="1.5" ' +
            'step="0.1"  onchange="ui.setVar(\'mftests\')">' },
    { name: '&sigma;&sup2; (variance)',
      tag : '<input type="number" id="mftests_var" value="2.25" ' +
            'onchange="ui.setSTD(\'mftests\')">' },
    { name: 'n<sub>1</sub> (replicates of sample 1)',
      tag : '<input type="number" id="mftests_n1" value="5">' },
    { name: 'n<sub>2</sub> (replicates of sample 2)',
      tag : '<input type="number" id="mftests_n2" value="10">' },
    { name: '',
      tag : '' },
    { name: 'Precision',
      tag : '<input type="number" id="mftests_precision" min="1" max="10" ' +
            'value="6" step ="1" onchange="ui.setPrecision(\'mftests\')">' },
    { name: '',
      tag : '<button class="button" onclick="ui.multipleFTests()">' +
            'Generate</button>' },
    { name: '',
      tag : '<button class="button" onclick="ui.reset(\'mftests\')">' +
            'Reset</button>' } ];


  // List of main Forms with metadata

  let forms = [
               { name    : 'normal',
                 title   : 'Sampling the normal distribution',
                 subtitle: 'Population\'s parameters',
                 results : 'normal_results',
                 stats   : 'normal_stats',
                 params  : normparams },
               { name    : 'clt',
                 title   : 'The Central Limit Theorem',
                 subtitle: 'Populations\' parameters',
                 results : 'clt_results',
                 stats   : 'clt_stats',
                 params  : cltparams },
               { name    : 'ttest',
                 title   : 'The <i>t</i> test',
                 subtitle: 'Population\'s parameters',
                 results : 'ttest_results',
                 stats   : 'ttest_stats',
                 params  : ttestparams},
               { name    : 'mttests',
                 title   : 'Multiple <i>t</i> tests',
                 subtitle: 'Population\'s parameters',
                 results : 'mttests_results',
                 stats   : 'mttests_stats',
                 params  : mttestsparams},
               { name    : 'ftest',
                 title   : 'The <i>F</i> test',
                 subtitle: 'Population\'s parameters',
                 results : 'ftest_results',
                 stats   : 'ftest_stats',
                 params  : ftestparams},
               { name    : 'mftests',
                 title   : 'Multiple <i>F</i> tests',
                 subtitle: 'Population\'s parameters',
                 results : 'mftests_results',
                 stats   : '',
                 params  :  mftestsparams},
               ];


  function setupForms() {

    // Form for normal distribution sampling

    let text = '';

    for ( let f of forms ) {

      let elem = document.getElementById( f.name );

      let text = '<h3>' + f.title + '</h3>' +
                 '<div class="ct" id="' + f.name + '-parameters">' +
                 '<h4>' + f.subtitle + '</h4>';

      text += '<table>';

      for ( let p of f.params ) {
         text += '<tr><td>' + p.name + '</td><td>' + p.tag + '</td></tr>';
      }

      text += '</table></div>';

      if ( f.results != '' )
        text += '<div class="ct" id="' + f.results +
                '" style="display: none;"></div>';
      if ( f.stats != '' )
        text += '<div class="ct" id="' + f.stats +
                '" style="display: none;"></div>';

      elem.innerHTML = text;
    }
  }

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
  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    reset: reset,
    sampleNormal: sampleNormal,
    sampleNormalNTimes: sampleNormalNTimes,
    setVar: setVar,
    setSTD: setSTD,
    setPrecision: setPrecision,
    multipleFTests: multipleFTests,
    multipleTTests: multipleTTests,
    tTest: tTest,
    FTest: FTest,
    setupForms: setupForms
  } // End of 'return' (exported function)
  
})();


/*************************************************************************/
/*                                                                       */
/* Function used to 'simulate' a tab behaviour for each menu entry in    */
/* the main bar                                                          */
/*                                                                       */
/*************************************************************************/

function selectTab( name ) {

  let tabs = document.getElementsByClassName('tabs');

  for (let t of tabs ) {
    if( t.name == name ) {
      t.classList.toggle('selected');
    }
    else t.classList.remove('selected');
  }

  // Get all elements with class='tabcontent' and hide them
  // showing only the one selected
  let tabcontent = document.getElementsByClassName('tabcontent');

  for (let t of tabcontent ) {
    if ( t.id == name ) {
      t.style.display = 'block';
    }
    else t.style.display = 'none';
  }

  // Enable main tab contents if hidden

  tabs = document.getElementById('tab-contents');
  tabs.style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function () {

  // Hide all tab contents
  let elem = document.getElementsByClassName('tabcontent');
  for (let el of elem ) el.style.display = 'none';

  ui.setupForms();

  
});    
