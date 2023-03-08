
  /****************************************************************************/
  /*                                                                          */
  /*                                setupLevels                               */
  /*                                                                          */
  /* This function sets up a HTML Form to allow changing the names of the     */
  /* levels of a factor. By default, levels are labeled with numeric codes    */
  /* (0, 1, 2, ...) but stored as strings. The fcunction makes sure that no   */
  /* duplicate level names are allowed per each factor.                       */
  /*                                                                          */
  /****************************************************************************/

  function setupLevels(fnum) {

    let f = factors[fnum];
    f.true_levels = f.levels;
    for ( let i = 0; i < f.nestedin.length; i++ ) {
      f.true_levels *= factors[f.nestedin[i]].levels;
    }  

    // Add an entry to the tab labels 

    let t = document.getElementById('tabs');
    let r = document.getElementById('tresults');
    let b = document.createElement('a'); 
    b.name = f.name;
    b.className = 'tabs';
    b.href = "#!";
    b.innerHTML = f.name;
    b.onclick = function () { selectFcator(f.name) };
    t.insertBefore(b, r);

    // Add also a correspondent content area for the new factor
    // Label names will be defined here

    let cts = document.getElementById('tab-contents');
    let res = document.getElementById('results');
    let d = document.createElement('div'); 
    d.className = 'tabcontent';
    d.id = f.name;
    
    // At this stage the matrix 'recoded' holds
    //console.log(fnum,combins)

    console.log(f,combins,recoded);
    let text = '<h3>Labels for levels of Factor ' + f.name + '</h3><table>';
    for ( let i = 0; i < f.true_levels; i++ ) {
      text += '<tr><td><b>Level ' + (i+1).toString();
      // If this is a nested factor compute nesting levels
      if( f.nested ) {
        text += '</b> nested in ';
        let lst = [];
        for ( let j = 0; j < f.nestedin.length; j++ ) {
          lst.push( ' Level ' + factors[f.nestedin[j]].lcodes[combins[i][j]] +
                    ' of Factor ' + factors[f.nestedin[j]].name );
        }
        text += lst.join(' and ');
      }    
      text += '</td><td><input type="text" class="label" value="' +
              i.toString() + '" onchange="ui.changeLevelLabel(this)" ' +
              ' id="flabel.' + fnum + '.' + i.toString() + '"></td></tr>';
    }

    //console.log(f);
    //console.log(factors);
    //console.log(combins);

    text += "</table>";
    d.innerHTML = text;
    d.style.display = 'none';
    cts.insertBefore(d, res);      

  }    
