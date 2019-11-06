  /*************************************************************************/
  /*                                                                       */
  /*                            displayCTRules                             */
  /*                                                                       */
  /* This function displays a table with the Analysis of Variance          */
  /*                                                                       */     
  /*************************************************************************/   
  
  function displayCTRules( ) {
    
    let c = document.getElementById('ctrules'); 
    
    //#DEBUG
    let d = document.getElementById("debug"); 
    //!DEBUG
    
    let table = '<div class="ct"><table><thead>';
    
    //#DEBUG
    let dbgtable = '<h5>Cornfield-Tukey Rules</h5>' + table;
    //!DEBUG
    
    /*
     * Build the header of the table. First column for the ANOVA term name
     */
    
    table += '<tr><th>Term</th>';
    
    //#DEBUG
    dbgtable += '<tr><th>Term</th>';
    //!DEBUG
    
    /*
     * Now add one column for each subscript associated with each factor,
     * plus one column for the Error. This is the CT table of multipliers,
     * and its display is just for debugging purposes
     */
    
    //#DEBUG
    for ( let i = 0, len = factors.length + 1; i < len; i++) {
      dbgtable += '<th>' + String.fromCharCode(i+105) + '</th>';  
    }  
    //!DEBUG
    
    /*
     * We should build a table with as many columns as ANOVA terms (including
     * the Error term) which will display the components of variance measured
     * by each term. Again, displaying this is only necessary while debugging 
     */
    
    //#DEBUG
    for ( let i = terms.length - 2; i >= 0; i--) {
      dbgtable += '<th>' + terms[i].name + '</th>';  
    }
    //!DEBUG
    
    /*
     * Finally a column to display which variance components are estimated
     * by each term
     */
    
    table += '<th>Estimates</th></tr></thead><tbody>';
    
    //#DEBUG
    dbgtable += '<th>Estimates</th></tr></thead><tbody>';
    //!DEBUG
    
    /*
     * Compute rows
     */
    
    for(let i = 0, len = terms.length - 1; i < len; i++ ) {
      table += '<tr><td>' + terms[i].name + '</td>';
      
      //#DEBUG
      dbgtable += '<tr><td>' + terms[i].name + '</td>';
      
      for ( let j = 0, len = factors.length +1; j < len; j++) {
        dbgtable += '<td>' + terms[i].ct_codes[j].toString() + '</td>';
      }    
      for ( let j = terms.length - 2; j >= 0; j--) {
        dbgtable += '<td>' + terms[i].varcomp[j].toString() + '</td>';  
      }
      //!DEBUG
      let est = [], name = "";
      for ( let j = terms.length - 2; j >= 0; j--) {
        if(terms[i].varcomp[j] > 0 ) {
          if( ( terms[j].name === 'Error') || ( terms[j].name === 'Residual' ) ) name = '&epsilon;';
          else name = terms[j].name;
          if( terms[i].varcomp[j] === 1 ) est.push('&sigma;<sup>2</sup><sub>' + name + '</sub>');
          else est.push(terms[i].varcomp[j].toString() + '*&sigma;<sup>2</sup><sub>' + name + '</sub>'); 
        }
      }
      table += '<td>' + est.join(' + ') + '</td></tr>';
      
      //#DEBUG
      dbgtable += '<td>' + est.join(' + ') + '</td></tr>';
      //!DEBUG
    }
    
    table += '</tbody></table></div>';
    
    //#DEBUG
    dbgtable += '</tbody></table></div>';
    //!DEBUG
    
    c.innerHTML = table;
    
    //#DEBUG
    d.innerHTML += dbgtable;
    //!DEBUG
  } 
