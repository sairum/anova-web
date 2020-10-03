  
  function set_normVar() {
    let s = document.getElementById("norm_std").value;
    document.getElementById("norm_var").value = Math.pow(s,2).toFixed(precision);
  }
  
  function set_cltVar() {
    let s = document.getElementById("clt_std").value;
    document.getElementById("clt_var").value = Math.pow(s,2).toFixed(precision);
  }
  
  function set_FVar() {
    let s = document.getElementById("F_std").value;
    document.getElementById("F_var").value = Math.pow(s,2).toFixed(precision);
  }
