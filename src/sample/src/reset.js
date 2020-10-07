 
  function reset(tagid) {
    
    /*
     * _avg and _std and _var are common to all simulations
     */
    
    document.getElementById(tagid + "_avg").value = "8.0";  
    document.getElementById(tagid + "_std").value = "1.5";  
    document.getElementById(tagid + "_var").value = "2.25";
    
    /*
     * Only F tests have no 'n' for replicates 
     * (they have n1 and n2)
     */
    
    if ( ( tagid !== 'F' ) ) document.getElementById(tagid + "_n").value = "10";
    else {
      document.getElementById("F_n1").value = "2"; 
      document.getElementById("F_n2").value = "10"; 
    }    
    
    /*
     * All simulations have 'N' (number of samples) except 
     * the one for sampling from the normal distribution
     * ( tagid ='norm' )
     */
    
    if ( tagid !== 'norm' ) document.getElementById(tagid + "_N").value = "100";
    
    /*
     * Clean also the results section (a <textarea>)
     */
    
    document.getElementById(tagid + "_results").value = "";
    
  }
  
  
