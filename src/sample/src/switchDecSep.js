  
  /*
   * Change decimal separator from dot (.) to comma (,) 
   * and vice-versa. This is important if local language 
   * is not english. For portuguese (and e.g. French,
   * Germany, Spain, etc) comma is used as a decimal 
   * separator. This allows importing the results directly
   * into excel!
   */
  
  function switchDecSep() {
    let res = document.getElementById("normres").value;
    //console.log(res);
    let sep = document.getElementById("normsep").value;
    if(sep == ".") {
      res = res.replace(/\,/g , ".");
      document.getElementById("normsep").value = ",";
      document.getElementById("normsep").innerHTML = ", (comma)";
    }  
    else {
      res = res.replace(/\./g , ","); 
      document.getElementById("normsep").value = ".";
      document.getElementById("normsep").innerHTML = ". (dot)";
    }  
    document.getElementById("normres").value = res;
  }
