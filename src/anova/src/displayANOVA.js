  /*************************************************************************/
  /*                                                                       */
  /*                            displayANOVA                               */
  /*                                                                       */
  /* This function displays a table with the Analysis of Variance          */
  /*                                                                       */     
  /*************************************************************************/   
  
  function displayANOVA() {
       
    let text = '<div class="ct"><table>' +
                '<thead><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th>' +
                '<th>Prob.</th><th>Against</th></tr></thead><tbody>';
     
    for(let i = 0, len = terms.length; i < len; i++ ) {
      text += "<tr>";
      text += "<td>" + terms[i].name + "</td>";
      text += "<td>" + terms[i].SS.toFixed(5).toString() + "</td>";
      text += "<td>" + terms[i].df.toString() + "</td>";
      if( terms[i].name != "Total" ) {
        text += "<td>" + terms[i].MS.toFixed(5).toString() + "</td>";
      } else {
        text += "<td></td>";  
      } 
      let nm = terms[i].against;
      if( ( i < (terms.length - 2 ) ) && ( nm != -1 ) ) {
        text += "<td>" + terms[i].F.toFixed(5).toString() +"</td>";
        let prob = "";
        if ( terms[i].P > rejection_level ) prob = terms[i].P.toFixed(5).toString();
        else prob = "<b><i>" + terms[i].P.toFixed(5).toString() + "</i></b>";     
        text += "<td>" + prob + "</td>";
        text += "<td>" + terms[nm].name + "</td>";
      } else {
        text += "<td></td>";
        text += "<td></td>";
        if ( nm == -1) text += "<td><b>No Test</b></td>";
        else text += "<td></td>";
      }  
      text += "</tr>";
    }
    text += '</tbody></table></div>';
    
    text += '<div class="ct"><p>Rejection criteria (&alpha;):</p>'+
             '<p><input type="number" id="anova_alpha" value="' +
             rejection_level.toString() + 
             '" min="0.00000" max="0.999999" step="0.01" onchange="anova.setAlpha()"/></p>' +
             '</div>';

    /*
     * Update contents of 'display' tab (ANOVA results)
     */
    
    let d = document.getElementById('analysis');
    d.innerHTML = text; 
    
    /*
     * Select ANOVA results tab ('analysis') using ui function 'select
     * hidding all other tabs
     */
    
    selectTab('analysis');
        
  }  
