  
  function setPrecision() {
    let s = document.getElementById("precision").value;
    precision = parseInt(s);
    if(precision < 1) {
      document.getElementById("precision").value = 1;
      precision = 1;
    } else {
      if(precision > 10) { 
        document.getElementById("precision").value = 10;
        precision = 10; 
      } else {
        document.getElementById("precision").value = precision;
      }    
    }    
  }
