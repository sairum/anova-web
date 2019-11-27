
  /*
   * Changes decimal separator from dot to comma and backwards
   */

  function switchDecSep(button,respane) {
    let res = document.getElementById(respane).value;
    let sep = document.getElementById(button).value;
    if(sep == ".") {
      res = res.replace(/\,/g , ".");
      document.getElementById(button).value = ",";
      document.getElementById(button).innerHTML = ", (comma)";
    }  
    else {
      res = res.replace(/\./g , ","); 
      document.getElementById(button).value = ".";
      document.getElementById(button).innerHTML = ". (dot)";
    }  
    document.getElementById(respane).value = res;
  }
