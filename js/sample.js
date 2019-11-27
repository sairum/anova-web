"use strict";

var sample = (function () {
     
  /*************************************************************************/
  /*                                                                       */
  /*                             Global Variables                          */
  /*                                                                       */
  /*************************************************************************/  

  /*
   * Number of decimal places for floating point numbers
   */
  
  var precision = 4;
  
  /*
   * Decimal separator. Default is dot (.) but may be
   * a comma (,) for non english languages
   */
  
  var separator = ".";
  
  function setVar() {
    let s = document.getElementById("normstd").value;
    document.getElementById("normvar").value = Math.pow(s,2).toFixed(precision);
  }
  function normGenerate() {
    sampleNormal();
  }
  function sampleNormal() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let mean = parseFloat(document.getElementById("normavg").value);
    let std  = parseFloat(document.getElementById("normstd").value);
    let r    = parseInt(document.getElementById("normn").value);
    
    //console.log(mean, std, r);
    
    /*
     * Clear anything in 'mormres' and 'normstats' <div>s
     */
    
    let result = document.getElementById("norm");
    result.innerHTML = "";
    
    let stats = document.getElementById("normstats");
    stats.innerHTML = "";
    
    /*
     * Generate a sample of n replicates from a population
     * with average = 'mean' and standard deviation = 'std'
     */

    let x = 0, s = [], sumx = 0, sumx2 = 0;
    for ( let i = 0; i < r; i++ ) {
      x = jStat.normal.sample( mean, std );
      sumx += x;
      sumx2 += Math.pow(x,2);
      s.push(x); 
    }
    
    let avg = (sumx/r).toFixed(precision);
    let variance = ((sumx2 - Math.pow(sumx,2)/r)/(r-1)).toFixed(precision);
    let sd = Math.sqrt(variance).toFixed(precision);
    
    let text = "<h3>Sampled values</h3>";
    text += "<textarea cols=\"20\" rows=\"10\" id=\"normres\">";
    for ( let i = 0; i < r; i++ )  text += s[i].toFixed(precision) + "\n";
    text += "</textarea>";    
    result.innerHTML = text;
    result.style.display = "inline-block";  
    
    text = "<h3>Sample statistics</h3>";
    text += "<table><tr><td>x&#772; (average)</td><td>" + avg.toString() + "</td></tr>";
    text += "<tr><td><i>s</i> (stdev)</td><td>" + sd.toString() + "</td></tr>";
    text += "<tr><td><i>s</i>&sup2; (variance)</td><td>" + variance.toString() + "</td></tr>";
    stats.innerHTML = text;
    stats.style.display = "inline-block";  
  }
  function normReset() {
    console.log("Reset");
  }
  
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

  function setAccordion(){
    let acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        /* 
         * Toggle between adding and removing the "active" class,
         * to highlight the button that controls the panel 
         */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        let panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      });
    }
  }

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
  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    normGenerate: normGenerate,
    normReset: normReset,
    setVar: setVar,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep
    
  } // End of 'return' (exported function)
  
})();
 
document.addEventListener('DOMContentLoaded', function () {
    
  sample.setAccordion(); 
});    
