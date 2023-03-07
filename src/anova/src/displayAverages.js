
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
    //console.log('displayAverages() called');
    //!DEBUG
        
    let d = document.getElementById('averages'); 
    
    // Create the table as a whole text bunch of HTML to avoid
    // multiple calls to the DOM structure
  
    let table = '';

    let fmt = {minimumFractionDigits: DPL};
    
    for(let i = 0, len = terms.length - 2; i < len; i++ ) {
       
      table += '<h3>Averages for ' + terms[i].name + '</h3>';
      
      table += '<table><thead><tr>';

      // We need t_(1-alfa/2,n-1) for confidence limits

      let a = 1 - rejection_level/2;

      // Use the number of replicates of first average. This should
      // be equal for all averages!

      let v = terms[i].n[0] - 1;

      let t = jStat.studentt.inv( a, v );

      let cds = [...terms[i].codes];

      for(let j = 0, jlen = cds.length; j < jlen; j++ ) {
        if( cds[j] != 1 ) cds[j] = '-'; 
        else table += '<th>' + factors[j].name + '</th>';
      }  
      
      table += '<th>Average</th><th>n</th><th>St. Dev.</th>' +
               '<th>Variance</th><th>t</th><th>ci</th>' +
               '<th>x&#772;-ci</th><th>x&#772;+ci</th>' +
               '</tr></thead><tbody>';
      
      for(let j = 0, jlen = terms[i].average.length; j < jlen; j++ ) { 
        table += '<tr>';  
        let levs = terms[i].levels[j].split(',');
        for(let k = 0, klen = levs.length; k < klen; k++ ) {
          if( cds[k] == 1 ) {
            table += '<td>' + factors[k].levels[levs[k]] + '</td>'; 
          }  
        }
        table += '<td class="flt">' +
                 terms[i].average[j].toLocaleString(undefined,fmt) +
                 '</td>';

        let n = terms[i].n[j];
        table += '<td>' + n.toString() + '</td>';
        
        let std = 0, variance = 0, ci = 0, cidown = 0, ciup = 0;
        if( n > 1 ) {
          variance = (terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/n);
          variance = variance/(n-1);
          std = Math.sqrt( variance );
          ci  = t*std/Math.sqrt(n);
          cidown = terms[i].average[j] - ci;
          ciup   = terms[i].average[j] + ci;

          // This computes the Confidence Interval value through jStat
          // and is used jusr to check if things are going right.
          //
          // console.log(jStat.tci( terms[i].average[j], 0.05, std, n ))
        }
        
        table += '<td class="flt">' +
                 std.toLocaleString( undefined, fmt ) + '</td>' +
                 '<td class="flt">' +
                 variance.toLocaleString( undefined, fmt ) + '</td>' +
                 '<td>' + t.toLocaleString( undefined, fmt ) + '</td><td>' +
                 ci.toLocaleString( undefined, fmt ) + '</td><td>' +
                 cidown.toLocaleString( undefined, fmt ) + '</td><td>' +
                 ciup.toLocaleString( undefined, fmt ) + '</td></tr>';
      } 
      table += '</tbody></table>';
    }
    d.innerHTML = table;
  }

