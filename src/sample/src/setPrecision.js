  
  function setPrecision( tag ) {
    let s = document.getElementById( tag + '_precision' ).value;
    DPL = parseInt(s);
    if(DPL < 1) {
      document.getElementById( tag + '_precision' ).value = 1;
      DPL = 1;
    } else {
      if(DPL > 10) {
        document.getElementById( tag + '_precision' ).value = 10;
        DPL = 10;
      } else {
        document.getElementById( tag + '_precision' ).value = DPL;
      }    
    }    
  }
