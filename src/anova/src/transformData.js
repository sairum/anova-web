  /*************************************************************************/
  /*                                                                       */
  /*                            transformData                              */
  /*                                                                       */
  /* This function applies several possible transformations to data values */
  /* but original data is kept for any possible reset. Transformations are */
  /* applied sequentially, thus previous transformations are "memorized".  */
  /* Hence, transforming data using the fourth root is equivalent to       */
  /* applying the square root transformation twice.                        */
  /*                                                                       */
  /*************************************************************************/ 

  function transformData( t ) {


    let multc = parseFloat(document.getElementById("multc").value);
    let divc  = parseFloat(document.getElementById("divc").value);
    let powc  = parseFloat(document.getElementById("powc").value);
    //console.log(multc,divc,powc);
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
    switch( t ){
      case 0:
        resetData();
        break;
      case 1:
        if( min_value >= 0 ) data.forEach( e => e.value = Math.sqrt( e.value ) );
        else alert("Cannot apply transformation to negative values!");
        break;
      case 2:
        if( min_value >= 0 ) data.forEach( e => e.value = Math.pow( e.value, 1/3 ) );
        else alert("Cannot apply transformation to negative values!");
        break;
      case 3:
        if( min_value >= 0 ) data.forEach( e => e.value = Math.pow( e.value, 1/4 ) );
        else alert("Cannot apply transformation to negative values!");
        break;
      case 4:
        if( min_value > 0 ) data.forEach( e => e.value = Math.log( e.value + 1 )/Math.log(10) );
        else alert("Cannot apply transformation to negative or null values!");
        break;
      case 5:
        if( min_value > 0 ) data.forEach( e => e.value = Math.log( e.value + 1 ) );
        else alert("Cannot apply transformation to negative or null values!");
        break;
      case 6:
        if( (min_value >= 0) && ( max_value <= 1 ) ) data.forEach( e => e.value = Math.asin( e.value ) );
        else alert("Cannot apply transformation to values larger than 1 or smaller than 0!");
        break;
      case 7:
        data.forEach( e => e.value *= multc );
        break;
      case 8:
        if( divc != 0 ) data.forEach( e => e.value /= divc );
        else alert("Cannot divide by zero!");
        break;
      case 9:
        data.forEach( e => Math.pow( e.value, powc ) );
        break;
    }

    //   console.log(data)

    /*
     * Reset data structures
     */

    cleanVariables();

    /*
     * Restart the ANOVA by computing 'partials'
     */

    computePartials();

    displayDataTable();

  }
