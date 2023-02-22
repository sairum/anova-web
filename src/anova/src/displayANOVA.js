  /****************************************************************************/
  /*                                                                          */
  /*                              displayANOVA                                */
  /*                                                                          */
  /*   This function displays a table with the Analysis of Variance           */
  /*                                                                          */
  /****************************************************************************/
  
  function displayANOVA() {

    //#DEBUG
    console.log('displayANOVA() called');
    //!DEBUG

    let text = '<div class="ct"><table>' +
               '<thead><tr><th>Source</th><th>SS</th><th>df</th>' +
               '<th>MS</th><th>F</th><th>Prob.</th><th>MS Denom.</th>' +
               '</tr></thead><tbody>';

    for(let i = 0, len = terms.length; i < len; i++ ) {
      text += '<tr>';
      text += '<td>' + terms[i].name + '</td>';
      text += '<td class=\"flt\">' + terms[i].SS.toFixed(DPL).toString() + '</td>';
      text += '<td>' + terms[i].df.toString() + '</td>';
      if( terms[i].name != 'Total' ) {
        text += '<td class=\"flt\">' + terms[i].MS.toFixed(DPL).toString() + '</td>';
      } else {
        text += '<td></td>';
      }
      let nm = terms[i].against;
      if( ( i < (terms.length - 2 ) ) && ( nm != -1 ) ) {
        text += '<td class=\"flt\">' + terms[i].F.toFixed(DPL).toString() +'</td>';
        let prob = '';
        if ( terms[i].P > rejection_level )
             prob = terms[i].P.toFixed(DPL).toString();
        else {
          if( alpha ) {
            prob = '<b><i>' + terms[i].P.toFixed(DPL).toString() + '</i></b>';
          } else prob = terms[i].P.toFixed(DPL).toString();
        }
        text += '<td class=\"flt\">' + prob + '</td>';
        text += '<td>' + terms[nm].name + '</td>';
      } else {
        text += '<td></td>';
        text += '<td></td>';
        if ( nm == -1) text += '<td><b>No Test</b></td>';
        else text += '<td></td>';
      }
      text += '</tr>';
    }
    text += '</tbody></table></div>';

    // Update contents of 'display' tab (ANOVA results)

    let d = document.getElementById('analysis');
    d.innerHTML = text;
        
  }  
