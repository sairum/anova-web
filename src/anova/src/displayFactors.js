  /****************************************************************************/
  /*                                                                          */
  /*                              displayFactors                              */
  /*                                                                          */
  /*   This function displays a small table with the summary of the factors,  */
  /*   their types, names and number of levels, derived from the data file    */
  /*                                                                          */
  /****************************************************************************/

  //#DEBUG


  function displayFactors() {

    console.log('displayFactors() called');

    // Get the 'anova_debug' <div> to append data
    
    let d = document.getElementById('debug'); 
    
    // Create the table as a whole text bunch of HTML to avoid
    // multiple calls to the DOM structure
  
    let table = '<h5>Factors</h5><div><table>';
    
    // Append the header
    
    table += '<thead><tr><th>Name</th><th>Subs.</th>' +
             '<th>Type</th><th>Levels</th><th>Levels\' Codes</th>' +
             '<th>Nested in</th></tr></thead><tbody>';
    
    // Append rows
    
    for(let i = 0, len = factors.length; i < len; i++ ) {
      table += '<tr>';
      table += '<td>' + factors[i].name + '</td>';
      table += '<td>' + factors[i].subscript + '</td>';
      table += '<td>' + factors[i].type + '</td>';
      table += '<td>' + factors[i].nlevels.toString() + '</td>';
      table += '<td>' + factors[i].levels.toString(); + '</td>';
      table += '<td>' + factors[i].nestedin.toString(); + '</td>';
      table += '</tr>';
    }
    
    table += '</tbody></table><div>';
    
    d.innerHTML += table;

  }
  //!DEBUG
