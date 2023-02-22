  /****************************************************************************/
  /*                                                                          */
  /*                                 displayData                              */
  /*                                                                          */
  /*          This function displays all data in a form of a table            */
  /*                                                                          */
  /****************************************************************************/

  function displayData() {

    //#DEBUG
    console.log('displayData() called');
    //!DEBUG
    
    let tb = document.getElementById('datatab');

    let table = '<div class="ct" id="datatable"></div>';

    // Panel to transform data

    table += '<div class="ct" id="transforms">' +
      '<h3>Transformations</h3>'+
      '<p><input type="radio" name="transf" value="none"' +
      ' onclick="anova.transformData(0)" checked>None</p>' +
      '<p><input type="radio" name="transf" value="sqrt"' +
      ' onclick="anova.transformData(1)">&radic;X</p>' +
      '<p><input type="radio" name="transf" value="sqrt3"' +
      ' onclick="anova.transformData(2)">&#8731;X</p>' +
      '<p><input type="radio" name="transf" value="sqrt4"' +
      ' onclick="anova.transformData(3)">&#8732;X</p>' +
      '<p><input type="radio" name="transf" value="log"' +
      ' onclick="anova.transformData(4)">Log(X+1)</p>' +
      '<p><input type="radio" name="transf" value="ln"' +
      ' onclick="anova.transformData(5)">Ln(X+1)</p>' +
      '<p><input type="radio" name="transf" value="arcsin"' +
      ' onclick="anova.transformData(6)">arcsin(X)</p>' +
      '<p><input type="radio" name="transf" value="mult"' +
      ' onclick="anova.transformData(7)">X &times;' +
      ' <input type="number" id="multc" value="100"></p>' +
      '<p><input type="radio" name="transf" value="div"' +
      ' onclick="anova.transformData(8)">X &divide;' +
      ' <input type="number"  id="divc" value="100"></p>' +
      '<p><input type="radio" name="transf" value="pow"' +
      ' onclick="anova.transformData(9)">X&#8319;' +
      ' <input type="number"  id="powc" value="0.25"></p>' +
      '</div>';

    tb.innerHTML  = table;

    // Now calldisplaydataTable() to update data values as
    // a table on <div> 'datatable'

    displayDataTable();
  }

