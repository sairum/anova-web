  /****************************************************************************/
  /*                                                                          */
  /*                              displayANOVA                                */
  /*                                                                          */
  /*   This function displays a table with the Analysis of Variance           */
  /*                                                                          */
  /****************************************************************************/
  
  function displayANOVA() {

    //#DEBUG
    //console.log('displayANOVA() called');
    //!DEBUG

    let fmt = {minimumFractionDigits: DPL};

    let text = '<div class="ct"><table>' +
               '<thead><tr><th>Source</th><th>SS</th><th>df</th>' +
               '<th>MS</th><th>F</th><th>Prob.</th><th>MS Denom.</th>' +
               '</tr></thead><tbody>';

    for(let t of terms ) {
      text += '<tr>' + '<td>' + t.name + '</td>' +
              '<td class=\"flt\">' +
              t.SS.toLocaleString( undefined, fmt ) +
              '</td>' + '<td>' + t.df.toString() + '</td>';
      if( t.name != 'Total' ) {
        text += '<td class=\"flt\">' +
                t.MS.toLocaleString( undefined, fmt ) +
                '</td>';
      } else {
        text += '<td></td>';
      }
      let nm = t.against;
      if( nm > -1 ) {
        text += '<td class=\"flt\">' +
                t.F.toLocaleString( undefined, fmt ) +
                '</td>';
        let p = t.P.toLocaleString( undefined, fmt );
        if( alpha && ( t.P < rejection_level ) ) {
          p = '<b><i>' + p + '</i></b>';
        }
        text += '<td class=\"flt\">' + p + '</td><td>' + terms[nm].name +
                '</td>';
      } else {
        text += '<td></td><td></td>';
        if ( nm == -1) text += '<td><b>No Test</b></td>';
        else text += '<td></td>';
      }
      text += '</tr>';
    }
    text += '</tbody></table>';
    text += '<p style="font-size: 12px;">' +
            'Note: Random factors are displayed in <span class="random">' +
            'Serif</span> font</p></div>';

    // Update contents of 'display' tab (ANOVA results)

    let d = document.getElementById('analysis');
    d.innerHTML = text;
        
  }  
