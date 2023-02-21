  /****************************************************************************/
  /*                                                                          */
  /*                              displayDataTable                            */
  /*                                                                          */
  /*    Display the table with data, either original or transformed, on the   */
  /*    data tab or pane.                                                     */
  /*                                                                          */
  /****************************************************************************/

  function displayDataTable() {

    //#DEBUG
    console.log('displayDataTable() called');
    //!DEBUG

    let tb = document.getElementById( 'datatable' );

    // Build table header with factor names

    let table = '<table><thead><tr>';

    for(let i = 0, nf = factors.length; i < nf; i++ ) {
      table += '<th>' + factors[i].name + '</th>';
    }
    table += '<th>DATA</th></tr></thead><tbody>';

    let lcodes = '';

    // Go along all ANOVA cells in 'data'

    for( let i = 0, len = data.length; i < len; i++ ) {

      // Compute the level codes for each factor to be used by
      // all data values belonging to an ANOVA cell

      lcodes = '';

      for(let j = 0, ll = data[i].levels.length; j < ll; j++ ) {
        lcodes += '<td>' + data[i].levels[j] + '</td>';
      }

      // For each ANOVA cell display all of its data 'values' but
      // prepend the factor levels before

      for( let j = 0, cl = data[i].values.length; j < cl; j++ ) {
        table += '<tr>' + lcodes;
        table += '<td>' + data[i].values[j].toString() + '</td>';
        table += '</tr>';
      }
    }
    table += '</tbody></table>';

    tb.innerHTML = table;

  }


