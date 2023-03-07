  /*************************************************************************/
  /*                                                                       */
  /*          General configuration settings for ANOVA                     */
  /*                                                                       */
  /*************************************************************************/

  /****************************************************************************/
  /*                                                                          */
  /*                                 setSettings                              */
  /*                                                                          */
  /*   This function appends a list of settings into the <div id="settings">  */
  /*                                                                          */
  /****************************************************************************/

  let sts = [
    {
      name : '&alpha;',
      set  : '<input type="number" id="anova_alpha" value="0.05" ' +
             'min="0.00000" max="0.999999" step="0.05" onchange="' +
             'anova.setAlpha()">',
      desc : 'Rejection level for H<sub>0</sub> in main ANOVA tests'
    },
    {
      name : 'Use rejection criterion (&alpha;)',
      set  : '<input type="checkbox" id="use_alpha"' +
             ' onchange="anova.useAlpha()" checked>',
      desc : 'Check if you want to see in the ANOVA table F probabilities ' +
             'highlighted whenever the F statistic surpasses the critical ' +
             'level for the &alpha; selected (above). If the probability ' +
             'associated to F is smaller than &alpha; it is shown in ' +
             '<b><em>emphasized bold</em></b> font.'
    },
    {
      name : 'Ignore interactions',
      set  : '<input type="checkbox" id="ignore_interactions"' +
             ' onchange="anova.ignoreInteractions()">',
      desc : 'Check if you want to see multiple <em>a posteriori</em> ' +
             'comparison tests for main factors that are involved in ' +
             'significant interactions with other factors.'
    },
    {
      name : 'Precision',
      set  : '<input type="number" id="precision" min="2" max="8" step="1"' +
             ' onchange="anova.setPrecision()" value="' + DPL + '" />',
      desc : 'Number of decimal places in tables (1 > x < 9).'
    }
  ];

  function setSettings() {

    let elem = document.getElementById("settings");

    let text = '<table><thead><tr><td>Setting</td><td>Value</td><td>' +
              'Description</td></tr></thead><tbody>';
    for( let s of sts ) {
      text += '<tr><td>' + s.name + '</td><td>' + s.set + '</td><td>' +
               s.desc + '</td></tr>';
    }

    text += '</tbody></table>';

    elem.innerHTML = text;

  }

  /*************************************************************************/
  /*                                                                       */
  /*                            changeSettings                             */
  /*                                                                       */
  /* This function enables the Settings <div> to be viewd while hidding    */
  /* the ANOVA <div                                                        */
  /*                                                                       */
  /*************************************************************************/

  function changeSettings() {

    let elem   = document.getElementById("anovadisplay");
    let sets   = document.getElementById("settings");
    let button = document.getElementById("activate_settings");

    if ( elem.style.display == "none" ) {
      elem.style.display = "block";
      sets.style.display = "none";
      button.innerHTML = 'Settings';
      button.style.background='#EFEFEF';
    } else {
      elem.style.display = "none";
      sets.style.display = "block";
      button.innerHTML = 'Close';
      button.style.background='red';
    }
  }


