
  /****************************************************************************/
  /*                                                                          */
  /*                              displayAverages                             */
  /*                                                                          */
  /*  This function displays a small table with the summary of the averages   */
  /*  for each term in the ANOVA. This information may be useful to graph     */
  /*  data further on or simply to check if the analysis has ben correctly    */
  /*  done.                                                                   */
  /*                                                                          */
  /****************************************************************************/
  
  function displayAverages() {

    //#DEBUG
    console.log('displayAverages() called');
    //!DEBUG
        
    let d = document.getElementById('averages'); 
    
    // Create the table as a whole text bunch of HTML to avoid
    // multiple calls to the DOM structure
  
    let table = '';
    
    for(let i = 0, len = terms.length - 2; i < len; i++ ) {
       
      table += '<h3>Averages for ' + terms[i].name + '</h3>';
      
      table += '<table><thead><tr>';
      
      let cds = [...terms[i].codes];
      for(let j = 0, jlen = cds.length; j < jlen; j++ ) {
        if( cds[j] != 1 ) cds[j] = '-'; 
        else table += '<th>' + factors[j].name + '</th>';
      }  
      
      table += '<th>Average</th><th>n</th><th>St. Dev.</th>' +
               '<th>Variance</th></tr></thead><tbody>';
      
      for(let j = 0, jlen = terms[i].average.length; j < jlen; j++ ) { 
        table += '<tr>';  
        let levs = terms[i].levels[j].split(',');
        for(let k = 0, klen = levs.length; k < klen; k++ ) {
          if( cds[k] == 1 ) {
            table += '<td>' + factors[k].levels[levs[k]] + '</td>'; 
          }  
        }
        table += '<td>' + terms[i].average[j].toString() + '</td>';
        let n = parseInt(terms[i].n[j]);
        table += '<td>' + n.toString() + '</td>';
        
        let std = 0, variance = 0;
        if( n > 1 ) {
          variance = (terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/n);
          variance = variance/(n-1);
          std = Math.sqrt(variance,2);
        }
        
        table += '<td>' + std.toString() + '</td>';
        table += '<td>' + variance.toString() + '</td>';
        table += '</tr>'; 
      } 
      table += '</tbody></table>';
    }
    d.innerHTML = table;
  }

