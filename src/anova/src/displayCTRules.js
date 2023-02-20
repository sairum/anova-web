  /****************************************************************************/
  /*                                                                          */
  /*                              displayCTRules                              */
  /*                                                                          */
  /*     This function displays a table with the Analysis of Variance         */
  /*                                                                          */
  /****************************************************************************/
  
  function displayCTRules( ) {

    //#DEBUG
    console.log('displayCTRules() called');
    //!DEBUG
    
    let c = document.getElementById('ctrules'); 

    //#DEBUG
    let d = document.getElementById('debug');
    //!DEBUG
    
    let table = '<div class="ct"><table><thead>';

    //#DEBUG
    let dbgtable = '<h5>Cornfield-Tukey Rules</h5>' + table;
    //!DEBUG

    // Build the header of the table. First column for the ANOVA term name

    table += '<tr><th>Term</th>';

    //#DEBUG
    dbgtable += '<tr><th>Term</th>';
    //!DEBUG

    // Now add one column for each subscript associated with each factor,
    // plus one column for the Error. This is the CT table of multipliers,
    // and its display is just for debugging purposes

    //#DEBUG
    for ( let i = 0, len = factors.length + 1; i < len; i++) {
      dbgtable += '<th>' + String.fromCharCode(i+105) + '</th>';
    }
    //!DEBUG

    // We should build a table with as many columns as ANOVA terms (including
    // the Error term) which will display the components of variance measured
    // by each term. Again, displaying this is only necessary while debugging

    //#DEBUG
    for ( let i = terms.length - 2; i >= 0; i--) {
      dbgtable += '<th>' + terms[i].name + '</th>';
    }
    //!DEBUG

    // Finally a column to display which variance components are estimated
    // by each term

    table += '<th>Estimates</th></tr></thead><tbody>';

    //#DEBUG
    dbgtable += '<th>Estimates</th></tr></thead><tbody>';
    //!DEBUG
    
    // Compute CT rows. If DEBUG is set the table is more complex than
    // for regular operation, where we need only the factor or interaction
    // names and the list of variance components involved in the term (these
    // are stored in 'terms[i].varcomp[j]' for term 'i' and component 'j')
    //
    // For displaying the CT Rules in DEBUG mode we also need the list of
    // CT coefficients per subscript, one subscript per factor plus the
    // Error term. These are stored in 'terms[i].ct_codes[j]' for term 'i'
    // and component 'j'.
    //
    // The 'terms[i].varcomp[j]' should be printed in reverse order because
    // the members of this vector are stored according to the order of terms,
    // main factors first, first order interactions next, and so on, the
    // error term being the last entry. When displaying variance components
    // in CT Rules, practice dictates that we should start by the Error or
    // Residual and move up to main factors.
    //
    // The above rule is solved by using a reverse 'for' loop for all the
    // 'terms[i].varcomp[j]' of term 'i', and works well in all cases.
    // However, there are specific cases where the last variance component
    // might not be the factor or interaction corresponding to row 'i'. Even
    // though all computations still work, the CT Rules table is not the best.
    // Consider the case of three factors (A,B, and C) where C is nested in
    // the A*B (interaction). Using the simple reverse for loop the result
    // would be:
    //
    // Term      Estimates
    // A         σ²ε + 4σ²C(A*B) + 16Σ²A
    // B         σ²ε + 4σ²C(A*B) + 16Σ²B
    // C(A*B)    σ²ε + 4σ²C(A*B)
    // A*B       σ²ε + 8Σ²A*B + 4σ²C(A*B)
    // Residual  σ²ε
    //
    // Note that A*B should be "σ²ε + 4σ²C(A*B) + 8Σ²A*B", that is the
    // component 8Σ²A*B should be the last component. But because it is an
    // interaction, the main factor C (nested inside it) has precedence and
    // created this effect. So, to achieve the desired effect, while
    // traversing the list of components from the Error/Residual to the main
    // factors, we "save" the component corresponding to the term being
    // considered ('i') into a buffer and only add it to the list of
    // components ('components') after all other variance components have
    // been added.


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
      let components = [], name = '', vc = '&sigma', compname = '', maincomp='';

      // Start in the Error term ( index terms.length-2 ) and go upwards
      // until term 0 (first main factor)

      for ( let j = terms.length - 2; j >= 0; j--) {
        if( terms[i].varcomp[j] > 0 ) {
          if( ( terms[j].name === 'Error' ) || ( terms[j].name === 'Residual' ) ) name = '&epsilon;';
          else name = terms[j].name;
          if( terms[j].type === RANDOM ) vc = '&sigma;';
          else vc = '&Sigma;';
          if( terms[i].varcomp[j] === 1 ) compname = vc+'<sup>2</sup><sub>' + name + '</sub>';
          else compname = terms[i].varcomp[j].toString() + '&middot;'+vc+'<sup>2</sup><sub>' + name + '</sub>';
          if ( i != j ) components.push( compname );
          else maincomp = '<span class="ctcomp">'+compname+'</span>';
        }
      }
      components.push(maincomp);

      table += '<td>' + components.join(' + ') + '</td></tr>';
      
      //#DEBUG
      dbgtable += '<td>' + components.join(' + ') + '</td></tr>';
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
