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
  function sampleNormalMultipleTimes() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let N    = parseInt(document.getElementById("clt_N").value);
    let mean = parseFloat(document.getElementById("clt_avg").value);
    let std  = parseFloat(document.getElementById("clt_std").value);
    let n    = parseInt(document.getElementById("clt_n").value);
    
    //console.log(N, mean, std, r);
    
    /*
     * Clear anything in 'ctl_res' and 'ctl_stats' <div>s
     */
    
    let result = document.getElementById("clt_res");
    result.innerHTML = "";
    
    let stats = document.getElementById("clt_stats");
    stats.innerHTML = "";
    
    /*
     * Generate N samples of n replicates from a population
     * with average = 'mean' and standard deviation = 'std'
     */
    
    let averages = [], sumx = 0, sumx2 = 0;;
    
    for ( let i = 0; i < N; i++ ) {
      let x = 0.0;
      for ( let j = 0; j < n; j++ ) {
        x += jStat.normal.sample( mean, std );
      }
      x = x/n;
      averages.push(x);
      sumx += x;
      sumx2 += Math.pow(x,2);
    }  
    
    let avg = (sumx/N).toFixed(precision);
    let variance = ((sumx2 - Math.pow(sumx,2)/N)/(N-1)).toFixed(precision);
    let sd = Math.sqrt(variance).toFixed(precision);
    
    let text = "<h3>Sampled averages</h3>";
    text += "<textarea cols=\"20\" rows=\"10\" id=\"clt_results\">";
    for ( let i = 0; i < N; i++ )  text += averages[i].toFixed(precision) + "\n";
    text += "</textarea>";    
    result.innerHTML = text;
    result.style.display = "inline-block";  
    
    text = "<h3>Sample statistics</h3>";
    text += "<table><tr><td>x&#772;&#772; (average of averages)</td><td>" + avg.toString() + "</td></tr>";
    text += "<tr><td><i>s&#772;</i> (stdev of averages)</td><td>" + sd.toString() + "</td></tr>";
    text += "<tr><td><i>s&#772;</i>&sup2; (variance of averages)</td><td>" + variance.toString() + "</td></tr>";
    stats.innerHTML = text;
    stats.style.display = "inline-block";  
    
    /*
     * Enable decimal separator switch
     */
    document.getElementById("clt_sep").disabled = false;
    
  }
  
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
  function multipleFTests() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let N    = parseInt(document.getElementById("F_N").value);
    let mean = parseFloat(document.getElementById("F_avg").value);
    let std  = parseFloat(document.getElementById("F_std").value);
    let n1   = parseInt(document.getElementById("F_n1").value);
    let n2   = parseInt(document.getElementById("F_n2").value);
    console.log(N, mean, std, n1, n2);
    
    /*
     * Clear anything in 'F_res' <div>s
     */
    
    let result = document.getElementById("F_res");
    result.innerHTML = "";

    
    /*
     * Generate N F-tests by sampling two samples with
     * n1 and n2 replicates each, and dividing the variance 
     * of sample 1 by the variance of sample 2
     */
    
     let ftests = [], 
         v1 = [], 
         v2 = [];
     
     let x, sumx, sumx2;
     
     for ( let i = 0; i < N; i++ ) {
       x = 0.0, sumx = 0, sumx2 = 0;;
       for ( let j = 0; j < n1; j++ ) {
         x = jStat.normal.sample( mean, std );
         sumx += x;
         sumx2 += Math.pow(x,2);
       }
       let var1 = (sumx2 - Math.pow(sumx,2)/n1)/(n1-1);
       
       x = 0.0, sumx = 0, sumx2 = 0;
       for ( let j = 0; j < n2; j++ ) {
         x = jStat.normal.sample( mean, std );
         sumx += x;
         sumx2 += Math.pow(x,2);
       }  
       let var2 = (sumx2 - Math.pow(sumx,2)/n2)/(n2-1);
       
       v1.push(var1);
       v2.push(var2);
       ftests.push(var1/var2);
     }  
  
     let text = "<h3>Multiple F-tests</h3>";
     text += "<textarea cols=\"20\" rows=\"10\" id=\"F_results\">";
     //for ( let i = 0; i < N; i++ )  text += v1[i].toFixed(precision) + "\t" + v2[i].toFixed(precision) + "\t" + ftests[i].toFixed(precision) + "\n";
     for ( let i = 0; i < N; i++ )  text += ftests[i].toFixed(precision) + "\n";
     text += "</textarea>";    
     result.innerHTML = text;
     result.style.display = "inline-block";  
//     
//     text = "<h3>Sample statistics</h3>";
//     text += "<table><tr><td>X&#772;&#772; (average of averages)</td><td>" + avg.toString() + "</td></tr>";
//     text += "<tr><td><i>s&#772;</i> (stdev of averages)</td><td>" + sd.toString() + "</td></tr>";
//     text += "<tr><td><i>s&#772;</i>&sup2; (variance of averages)</td><td>" + variance.toString() + "</td></tr>";
//     stats.innerHTML = text;
//     stats.style.display = "inline-block";  
    
    /*
     * Enable decimal separator switch
     */
    document.getElementById("F_sep").disabled = false;
    
  }
  function sampleNormal() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let mean = parseFloat(document.getElementById("norm_avg").value);
    let std  = parseFloat(document.getElementById("norm_std").value);
    let r    = parseInt(document.getElementById("norm_n").value);
    
    //console.log(mean, std, r);
    
    /*
     * Clear anything in 'mormres' and 'normstats' <div>s
     */
    
    let result = document.getElementById("norm_res");
    result.innerHTML = "";
    
    let stats = document.getElementById("norm_stats");
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
    text += "<textarea cols=\"20\" rows=\"10\" id=\"norm_results\">";
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
    
    /*
     * Enable decimal separator switch
     */
    
    document.getElementById("norm_sep").disabled = false;
    
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
 
 
  function normReset() {
    //console.log("Reset");
    document.getElementById("norm_avg").value = "8.0";
    document.getElementById("norm_std").value = "1.5";
    document.getElementById("norm_n").value = "10";
    document.getElementById("norm_var").value = "2.25";
  }
  
  function cltReset() {
    //console.log("Reset");
    document.getElementById("clt_N").value = "100";
    document.getElementById("clt_avg").value = "8.0";
    document.getElementById("clt_std").value = "1.5";
    document.getElementById("clt_n").value = "10";
    document.getElementById("clt_var").value = "2.25";
  }
  
  function FReset() {
    //console.log("Reset");
    document.getElementById("F_N").value = "100";
    document.getElementById("F_avg").value = "8.0";
    document.getElementById("F_std").value = "1.5";
    document.getElementById("F_n1").value = "2"; 
    document.getElementById("F_n2").value = "10";
    document.getElementById("F_var").value = "2.25";
  }
  
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
  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    sampleNormal: sampleNormal,
    sampleNormalMultipleTimes: sampleNormalMultipleTimes,
    normReset: normReset,
    cltReset: cltReset,
    set_normVar: set_normVar,
    set_cltVar: set_cltVar,
    set_FVar: set_FVar,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep,
    multipleFTests: multipleFTests,
    
  } // End of 'return' (exported function)
  
})();

//  /*
//   * Automatically change variance when standard deviation changes
//   */
// 
// document.getElementById("norm_std").addEventListener("onchange", sample.set_normVar());
// document.getElementById("clt_std").addEventListener("onchange", sample.set_cltVar());
// 

document.addEventListener("DOMContentLoaded", function () {
    
  sample.setAccordion();
  
  
});    
