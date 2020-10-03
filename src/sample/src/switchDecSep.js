  
  /*
   * Change decimal separator from dot (.) to comma (,) 
   * and vice-versa. This is important if local language 
   * is not english. For portuguese (and e.g. French,
   * Germany, Spanish, etc) comma is used as a decimal 
   * separator. This allows importing the results directly
   * into excel! The variable tagid is the id of the HTML
   * object holding the results to be modified. Variable 
   * sepid is the id of the button toggled to switch 
   * separator type
   */
  
  function switchDecSep(tagid, sepid) {
    let res = document.getElementById(tagid).value;
    let sep = document.getElementById(sepid).value;
    if(sep == ".") {
      res = res.replace(/\,/g , ".");
      document.getElementById(sepid).value = ",";
      document.getElementById(sepid).innerHTML = ", (comma)";
    }  
    else {
      res = res.replace(/\./g , ","); 
      document.getElementById(sepid).value = ".";
      document.getElementById(sepid).innerHTML = ". (dot)";
    }  
    document.getElementById(tagid).value = res;
  }
