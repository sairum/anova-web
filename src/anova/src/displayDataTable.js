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

    // Now insert as much data points rows as needed

    for( let i = 0, len = data.length; i < len; i++ ) {
      table += '<tr>';
      for(let j = 0, nf = factors.length; j < nf; j++ ) {
        table += '<td>' + data[i].levels[j] + '</td>';
      }
      table += '<td>' + data[i].value.toString() + '</td></tr>';
    }
    table += '</tbody></table>';

    tb.innerHTML = table;
  }

