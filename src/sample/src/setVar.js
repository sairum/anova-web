  
  function setVar() {
    let s = document.getElementById("normstd").value;
    document.getElementById("normvar").value = Math.pow(s,2).toFixed(precision);
  }
