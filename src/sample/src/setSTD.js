 

  /*
   * Automatically compute the standard deviation
   * based on the variance that is provided in
   * input '_var
   */

  function setSTD( tagid ) {
    let s = document.getElementById( tagid + "_var" ).value;
    document.getElementById( tagid + "_std" ).value = Math.sqrt(s).toFixed(precision);
  }
