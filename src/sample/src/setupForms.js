
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
