  /*************************************************************************/
  /*                                                                       */
  /*                            displayData                                */
  /*                                                                       */
  /* This function displays all data in a form of a table                  */
  /*                                                                       */
  /*************************************************************************/ 

  function displayData() {
    
    let tb = document.getElementById("data");
    
    // Panel to transform data

    let table = '<div class="ct">' +
        '<h3>Transformations</h3>'+
        '<p><input type="radio" name="transf" value="none" checked>None</p>' +
        '<p><input type="radio" name="transf" value="sqrt">&radic;X</p>' +
        '<p><input type="radio" name="transf" value="sqrt3">&#8731;X</p>' +
        '<p><input type="radio" name="transf" value="sqrt4">&#8732;X</p>' +
        '<p><input type="radio" name="transf" value="log">Log(X+1)</p>' +
        '<p><input type="radio" name="transf" value="ln">Ln(X+1)</p>' +
        '<p><input type="radio" name="transf" value="arcsin">arcsin(X)</p>' +
        '<p><input type="radio" name="transf" value="mult">X &times; <input type="number" id="multc" value="100"></p>' +
        '<p><input type="radio" name="transf" value="div">X &divide; <input type="number"  id="divc" value="100"></p>' +
        '<p><input type="radio" name="transf" value="pow">X&#8319; <input type="number"  id="powc" value="0.25"></p>' +
        '<p><button onclick="anova.transformData()">Apply</button></p>' +
        '<p><button onclick="anova.resetData()">Reset</button></p>' +
        '</div>';
        
    table += '<div class="ct">';
    
    // Build table header with factor names
    
    table += '<table><thead><tr>';
    for(let i = 0, nf = factors.length; i < nf; i++ ) {
      table += '<th>'+factors[i].name+'</th>';
    }  
    table += '<th>DATA</th></tr></thead><tbody>';
    
    // Now insert as much data points rows as needed
    
    for( let i = 0, len = data.length; i < len; i++ ) {
      table += '<tr>';
      for(let j = 0, nf = factors.length; j < nf; j++ ) {
        table += '<td>' + data[i].levels[j] + '</td>';
      }  
      table += '<td>'+data[i].value.toString()+'</td></tr>';
    }  
    table += '</tbody></table></div>';
    


    tb.innerHTML  = table;
  }
