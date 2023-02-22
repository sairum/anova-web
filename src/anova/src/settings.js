  /*************************************************************************/
  /*                                                                       */
  /*          General configuration settings for ANOVA                     */
  /*                                                                       */
  /*************************************************************************/

  /*************************************************************************/
  /*                                                                       */
  /*                               setSettings                             */
  /*                                                                       */
  /* This function appends a list of settings into the <div id="settings"> */
  /*                                                                       */
  /*************************************************************************/

  let sts = [
    {
      name : 'Use rejection criterium (&alpha;)',
      set  : '<input type="checkbox" id="use_alpha"' +
             ' onchange="anova.useAlpha()"',
      desc : 'Check if you want to see in the ANOVA table F probabilities ' +
             'highlighted whenever the F statistic surpasses the critical ' +
             'level for the &alpha; selected. If the probability ' +
             'associated to F is smaller than &alpha;, the probability is ' +
             'displayed in <b><em>emphasized bold</em></b> font. For ' +
             'each term, you should interpret the probabilities in the ' +
             'ANOVA table as the probability of obtaining an F value ' +
             'equal or larger than the observed F value.'
    },
    {
      name : 'Ignore interactions',
      set  : '<input type="checkbox" id="ignore_interactions"' +
             ' onchange="anova.ignoreInteractions()"',
      desc : 'Check if you want to see multiple <em>a posteriori</em> ' +
             'comparison tests for main factors that are involved in ' +
             'significant interactions with other factors.'
    },
    {
      name : '&alpha;',
      set  : '<input type="number" id="anova_alpha" value="0.05" ' +
             'min="0.00000" max="0.999999" step="0.05" onchange="' +
             'anova.setAlpha()"/>',
      desc : 'Rejection criterium for H<sub>0</sub> in main ANOVA tests'
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
  /*                           displaySettings                             */
  /*                                                                       */
  /* This function enables the Settings <div> to be viewd while hidding    */
  /* the ANOVA <div                                                        */
  /*                                                                       */
  /*************************************************************************/

  function displaySettings() {

    let elem = document.getElementById("anovadisplay");
    let sets = document.getElementById("settings");

    if ( elem.style.display == "none" ) {
      elem.style.display = "block";
      sets.style.display = "none";
    } else {
      elem.style.display = "none";
      sets.style.display = "block";
    }
  }


