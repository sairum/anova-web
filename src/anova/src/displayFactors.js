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

    //console.log('displayFactors() called');

    // Get the 'anova_debug' <div> to append data
    
    let d = document.getElementById('debug'); 
    
    // Create the table as a whole text bunch of HTML to avoid
    // multiple calls to the DOM structure
  
    let table = '<h5>Factors</h5><div><table>';
    
    // Append the header
    
    table += '<thead><tr><th>Name</th><th>Subs.</th>' +
             '<th>Type</th><th>Levels</th><th>Levels\' Codes</th>' +
             '<th>Nested</th><th>Nested in</th></tr></thead><tbody>';
    
    // Append rows. Th subscript for the current factor
    // starting in 'i' (the first factor) is given by the
    // formula 'factor index' + 105. The first factor has index = 0
    // so the ASCII charcode 105 is equivalent to 'i'. The second
    // factor 'i = 1' has charcode 106 which is equivalent to 'j',
    // and so on...
    
    for(let i = 0, len = factors.length; i < len; i++ ) {
      table += '<tr><td>' + factors[i].name + '</td>' +
               '<td>' + String.fromCharCode(i+105) + '</td>' +
               '<td>' + factors[i].type + '</td>' +
               '<td>' + factors[i].nlevels.toString() + '</td>' +
               '<td>' + factors[i].levels.toString() + '</td>' +
               '<td>' + (factors[i].nested?'TRUE':'FALSE') + '</td>' +
               '<td>' + factors[i].nestedin.toString() + '</td></tr>';
    }
    
    table += '</tbody></table><div>';
    
    d.innerHTML += table;

  }
  //!DEBUG
