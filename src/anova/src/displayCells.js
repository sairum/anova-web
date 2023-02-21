  /****************************************************************************/
  /*                                                                          */
  /*                              displayCells                                */
  /*                                                                          */
  /* This function displays a table with the list of ANOVA 'cell' also called */
  /* 'partials'. Each cell represents a unique combination between levels of  */
  /* all factors involved in the analysis, and contains the accummulated sums */
  /* of all observations ('sumx'), and sums of all squared observations       */
  /* ('sumx2'), together with other important quantities, such as 'average',  */
  /* 'median', 'variance' and number of replicates ('n')                      */
  /*                                                                          */
  /****************************************************************************/
  
  //#DEBUG
  function displayCells() {

    console.log('displayCells() called');

    let d = document.getElementById('debug'); 
    
    let table = '<h5>List of Partials</h5><div><table><thead>';
    
    table += '<tr>';
    for(let i = 0, len = factors.length; i < len; i++ ) {
      table += '<th>' + factors[i].name + '</th>';
    }
    
    table += '<th>n orig.</th><th>n</th><th>sumx</th>' +
             '<th>sumx2</th><th>ss</th></thead><tbody>';
    
    for(let i = 0, len = data.length; i < len; i++ ) {
      table += '<tr>';
      for(let j = 0, l = data[i].codes.length; j < l; j++ ) {
        let c = data[i].codes[j];
        let name = factors[j].levels[c];
        table += '<td>' + name + '</td>';
      }
      table += '<td>' + data[i].n_orig.toString() + '</td>';
      table += '<td>' + data[i].n.toString() + '</td>';
      table += '<td>' + data[i].sumx.toString() + '</td>';
      table += '<td>' + data[i].sumx2.toString() + '</td>';
      table += '<td>' + data[i].ss.toString() + '</td>';
      table += '</tr>';
    }

    table += "</tbody></table></div>";

    table += '<h5>Replicates</h5><div class="contentor"><table><thead>';
    table += '<tr><td>Replicates</td></tr></thead><tbody><tr><td>';
    table += replicates + '</td></tr></tnody></table></div>';
    
    d.innerHTML += table;
  }
  //!DEBUG

