
  /*************************************************************************/
  /*                                                                       */
  /* Automatically compute the standard deviation based on the variance    */
  /* that is provided in input '<tagid>_var'                               */
  /*                                                                       */
  /*************************************************************************/

  function setSTD( tagid ) {

    let fmt = {minimumFractionDigits: DPL};

    let s = document.getElementById( tagid + "_var" ).value;
    document.getElementById( tagid + "_std" ).value = Math.sqrt(s);
  }
