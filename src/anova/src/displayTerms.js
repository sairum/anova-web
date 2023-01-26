
  /*************************************************************************/
  /*                                                                       */
  /*                            displayTerms                               */
  /*                                                                       */
  /* This function displays all ANOVA terms and their corresponding        */       
  /* information (SS, DFs, levels, etc.)                                   */
  /*                                                                       */
  /*************************************************************************/   
  
  //#DEBUG
  function displayTerms( title = '') {
  
    let d = document.getElementById('debug'); 
    
    let table = '<h5>' + title + '</h5><table>';
    
    // Build the table header
    
    table += '<thead><tr><th>idx</th><th>Order</th><th>Name</th><th>Type</th><th>Codes</th><th>levels</th>'
    table += '<th>combins</th><th>df</th><th>level codes</th><th>n</th>';
    table += '<th>averages</th><th>sumx</th><th>sumx2</th><th>ss</th><th>SS</th>'
    table += '<th>MS</th><th>F</th><th>Against</th></tr></thead><tbody>'; 
    
    let a  = [];
    let tp = "";

    for(let i = 0, len = terms.length; i < len; i++ ) {
      table += '<tr><td>' + terms[i].idx.toString() + '</td>';
      table += '<td>'+terms[i].order.toString()+'</td>';
      table += '<td>'+terms[i].name+'</td>';
      //table += '<td></td>';

      (terms[i].type===RANDOM)?tp='RANDOM':tp='FIXED';
      table += '<td>'+tp+'</td>';
      table += '<td>'+terms[i].codes.toString();+'</td>';
      table += '<td>'+terms[i].nlevels.toString()+'</td>';
      table += '<td>'+terms[i].combins.toString()+'</td>';
      table += '<td>'+terms[i].df.toString()+'</td>';
      a = terms[i].levels.slice();
      table += '<td>'+a.join(' : ')+'</td>';
      a = terms[i].n.slice();
      table += '<td>'+a.join(' : ')+'</td>';
      a = terms[i].average.slice();
      for(let j = 0, l = a.length; j < l; j++ ) a[j] = a[j].toFixed(3);
      table += '<td>'+a.join(' : ')+'</td>';
      a = terms[i].sumx.slice();
      for(let j = 0, l = a.length; j < l; j++ ) a[j] = a[j].toFixed(3);
      table += '<td>'+a.join(' : ')+'</td>';
      a = terms[i].sumx2.slice();
      for(let j = 0, l = a.length; j < l; j++ ) a[j] = a[j].toFixed(3);
      table += '<td>'+a.join(' : ')+'</td>';
      table += '<td>'+terms[i].ss.toFixed(3)+'</td>';
      table += '<td>'+terms[i].SS.toFixed(3)+'</td>';
      table += '<td>'+terms[i].MS.toFixed(3)+'</td>';
      table += '<td>'+terms[i].F.toFixed(3)+'</td>';
      table += '<td>'+terms[i].against+'</td>';
    }
    table +='</tbody></table>';
    d.innerHTML += table;
  }
  //!DEBUG
