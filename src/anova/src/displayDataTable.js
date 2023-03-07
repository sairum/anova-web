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
    //console.log('displayDataTable() called');
    //!DEBUG

    let tb = document.getElementById( 'datatable' );

    // Build table header with factor names

    let table = '<table><thead><tr>';

    for(let i = 0, nf = factors.length; i < nf; i++ ) {
      table += '<th>' + factors[i].name + '</th>';
    }
    table += '<th>DATA</th></tr></thead>';

    // Build a line to denote if factors are 'FIXED' or 'RANDOM'
    // This will allow one to change this attribute if the factor
    // is not nested, in which case it is 'RANDOM' (mandatory)

    table += '<tbody>'

    let lcodes;

    // Go along all ANOVA cells in 'data'

    for( let c of data ) {

      // Compute the level codes for each factor to be used by
      // all data values belonging to an ANOVA cell

      lcodes = '';

      for(let l of c.levels ) {
        lcodes += '<td>' + l + '</td>';
      }

      // For each ANOVA cell display all of its data 'values' but
      // prepend the factor levels before

      for( let v of c.values ) {
        table += '<tr>' + lcodes;
        table += '<td class="flt">' +
                 v.toLocaleString(undefined, { minimumFractionDigits: DPL }) +
                 '</td>';
        table += '</tr>';
      }
    }
    table += '</tbody></table>';

    tb.innerHTML = table;

  }


