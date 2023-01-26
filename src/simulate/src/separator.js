  
  /*
   * Change decimal separator from dot (.) to comma (,) 
   * and vice-versa. This is important if local language 
   * is not english. For portuguese (and e.g. French,
   * Germany, Spain, etc) comma is used as a decimal 
   * separator. This allows importing the results directly
   * into excel!
   */
  
  function separator() {
    let res = document.getElementById("result").value;

    let sep = document.getElementById("separator").value;
    if(sep == ".") {
      res = res.replace(/\,/g , ".");
      document.getElementById("separator").value = ",";
      document.getElementById("separator").innerHTML = "Dec. separator = , (comma)";
    }  
    else {
      res = res.replace(/\./g , ","); 
      document.getElementById("separator").value = ".";
      document.getElementById("separator").innerHTML = "Dec. separator = . (dot)";
    }  
    document.getElementById("result").value = res;
    //console.log(res);
  }
  
  
