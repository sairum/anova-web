  /*************************************************************************/
  /*                                                                       */
  /*                            transformData                              */
  /*                                                                       */
  /* This function applies several possible transformations to data values */
  /* but keeps original data for any possible reset. Transformations are   */
  /* applied sequentially, thus "memorizing" previous transformations.     */
  /* Hence, transforming data using the fourth root is equivalent to apply */
  /* the square root transformation twice.                                 */
  /*                                                                       */
  /*************************************************************************/ 

  function transformData() {
      
    let t = document.getElementsByName("transf");
    let multc = parseFloat(document.getElementById("multc").value);
    let divc  = parseFloat(document.getElementById("divc").value);
    let powc  = parseFloat(document.getElementById("powc").value);
    //console.log(multc,divc,powc);
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
    
    let transf = 0;
    for( let i = 0; i < t.length; i++ ) {
      if( t[i].checked ) {
        transf = i;
        break;
      }  
    }    

    for( let i = 0; i < data.length; i++ ) {
      let v = data[i].value;
      //let text = i.toString() + ' ' + v.toString();
      switch(transf){
          case 1:
            if( v >= 0 ) v = Math.sqrt(v);  
            break;  
          case 2:
            v = Math.pow(v, 1/3);
            break;
          case 3:
            v = Math.pow(v, 0.25);
            break;  
          case 4:
            if( v >= 0 ) v = Math.log(v+1)/Math.log(10);
            break;
          case 5:
            if( v >= 0 ) v = Math.log(v+1);
            break;
          case 6:
            if( (v >= 0) && ( v <= 1 ))v = Math.asin(v);
            break;  
          case 7:
            v *= multc;
            break;  
          case 8:
            if( divc != 0 ) v /= divc;
            break;  
          case 9:
            v = Math.pow(v, powc);
            break;    
      }
      //text += ' ' + v.toString();
      //console.log(text)
      
      data[i].value = v;  
      if ( v > max_value ) max_value = v;
      if ( v < min_value ) min_value = v;
    }    
    
    let h = document.getElementsByClassName("tabcontent");
    for ( let i = 0, len = h.length; i < len; i++ ) h[i].innerHTML = "";
    
    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }
    
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    
    displayData();
    
    /*
     * Restart the ANOVA by computing 'partials' 
     */
    
    computePartials(); 

  }
