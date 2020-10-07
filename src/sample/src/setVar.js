
  /*
   * Automatically compute the variance
   * based on the standard deviation that is
   * provided in input '_std'
   */
  
  function setVar( tagid ) {
    let s = document.getElementById( tagid + "_std" ).value; 
    document.getElementById( tagid + "_var" ).value = Math.pow(s,2).toFixed(precision);
  }    
  
