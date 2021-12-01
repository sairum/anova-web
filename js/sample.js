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
  function multipleTTests() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let N    = parseInt(document.getElementById("tt_N").value);
    let mean = parseFloat(document.getElementById("tt_avg").value);
    let std  = parseFloat(document.getElementById("tt_std").value);
    let n    = parseInt(document.getElementById("tt_n").value);
    console.log(N, mean, std, n);
    
    /*
     * Clear anything in 't_res' <div>s
     */
    
    let result = document.getElementById("tt_res");
    result.innerHTML = "";

    
    /*
     * Generate N t-tests by sampling two samples with
     * n1 and n2 replicates each from a virtual population
     * with mean = t_avg and variance = (t_std)²
     */
    
     let ttests = [];
     
     let x, sumx, sumx2, x1, var1, x2, var2;
     
     for ( let i = 0; i < N; i++ ) {
       
       /*
        *First sample
        */
       
       sumx = 0, sumx2 = 0;
       for ( let j = 0; j < n; j++ ) {
         x1 = jStat.normal.sample( mean, std );
         sumx += x1;
         sumx2 += Math.pow(x1,2);
       }
       x1 = sumx/n;
       var1 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);
       
       sumx = 0, sumx2 = 0;
       for ( let j = 0; j < n; j++ ) {
         x2 = jStat.normal.sample( mean, std );
         sumx += x2;
         sumx2 += Math.pow(x2,2);
       }  
       x2 = sumx/n;
       var2 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);
       
       ttests.push((x1-x2)/Math.sqrt(var1/n+var2/n));
     }  
  
     let text = "<h3>Multiple <em>t</em>-tests</h3>";
     text += "<textarea cols=\"20\" rows=\"10\" id=\"tt_results\">";
     for ( let i = 0; i < N; i++ )  text += ttests[i].toFixed(precision) + "\n";
     text += "</textarea>";    
     result.innerHTML = text;
     result.style.display = "inline-block";  

    /*
     * Enable decimal separator switch
     */
    
    document.getElementById("tt_sep").disabled = false;
    
  }
 
  function reset(tagid) {
    
    /*
     * _avg and _std and _var are common to all simulations
     */
    
    document.getElementById(tagid + "_avg").value = "8.0";  
    document.getElementById(tagid + "_std").value = "1.5";  
    document.getElementById(tagid + "_var").value = "2.25";
    
    /*
     * Only F tests have no 'n' for replicates 
     * (they have n1 and n2)
     */
    
    if ( ( tagid !== 'F' ) ) document.getElementById(tagid + "_n").value = "10";
    else {
      document.getElementById("F_n1").value = "2"; 
      document.getElementById("F_n2").value = "10"; 
    }    
    
    /*
     * All simulations have 'N' (number of samples) except 
     * the one for sampling from the normal distribution
     * ( tagid ='norm' )
     */
    
    if ( tagid !== 'norm' ) document.getElementById(tagid + "_N").value = "100";
    
    /*
     * Clean also the results section (a <textarea>)
     */
    
    document.getElementById(tagid + "_results").value = "";
    
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
  function sampleNormalNTimes() {
      
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

  /*
   * Automatically compute the variance
   * based on the standard deviation that is
   * provided in input '_std'
   */
  
  function setVar( tagid ) {
    let s = document.getElementById( tagid + "_std" ).value; 
    document.getElementById( tagid + "_var" ).value = Math.pow(s,2).toFixed(precision);
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
  function tTest() {
      
    /*
     * Grab population parameters from 'sample.html'
     */
    
    let diff    = parseInt(document.getElementById("t_diff").value);
    let mean = parseFloat(document.getElementById("t_avg").value);
    let std  = parseFloat(document.getElementById("t_std").value);
    let n    = parseInt(document.getElementById("t_n").value);
    //console.log(diff, mean, std, n);
    
    /*
     * Clear anything in 't_res' <div>s
     */
    
    let result = document.getElementById("t_res");
    result.innerHTML = "";

    let stats = document.getElementById("t_stats");
    stats.innerHTML = "";
    
    /*
     * Generate N t-tests by sampling two samples with
     * n1 and n2 replicates each from a virtual population
     * with mean = t_avg and variance = (t_std)²
     */
    
     let s1 = [],
         s2 = [];
     
     let x, sumx, sumx2, x1, var1, x2, var2;
     
       
     /*
      * First sample
      */
       
     sumx = 0, sumx2 = 0;
     //let v1 = [11.2, 12.4, 10.3, 10.5, 7.7, 12.1, 8.3, 9.4, 10.5]; n=9;
     for ( let i = 0; i < n; i++ ) {
       x = jStat.normal.sample( mean, std );
       //x = v1[i];
       sumx += x;
       sumx2 += Math.pow(x,2);
       s1.push(x);  
     }
     x1 = sumx/n;
     var1 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);

     sumx = 0, sumx2 = 0;
     //let v2 = [12.2, 13.4, 12.1, 11.4, 5.7, 10.9, 9.2, 9.0, 11.5]; n=9;
     for ( let i = 0; i < n; i++ ) {
       //x = v2[i];
       x = jStat.normal.sample(mean + diff, std );
       sumx += x;
       sumx2 += Math.pow(x,2);
       s2.push(x);  
     }
     x2 = sumx/n;
     var2 = (sumx2 - Math.pow(sumx,2)/n)/(n-1);
     
     //console.log(x1,var1,x2,var2)
  
     let text = "<h3>Population 1</h3>";
     text += "<textarea cols=\"20\" rows=\"10\" id=\"t_results1\">";
     for ( let i = 0, ln = s1.length; i < ln; i++ )  text += s1[i].toFixed(precision) + "\n";
     text += "\n";
     text += "</textarea>";  
     
     text += "<h3>Population 2</h3>";
     text += "<textarea cols=\"20\" rows=\"10\" id=\"t_results2\">";
     for ( let i = 0, ln = s2.length; i < ln; i++ )  text += s2[i].toFixed(precision) + "\n";
     text += "</textarea>";  
     
     
     result.innerHTML = text;
     result.style.display = "inline-block";  
     
     // We use Math.abs(x1-x2) because otherwise the t-test may yeld negative values.
     // This, per se, is not a problem but the jstat function studentt(t,df) will
     // return the probability of observing a value <= t. We want the reciprocal
     // (1-p) of this, that is, the probability of obtaining a t value equal or
     // larger than the one observed. However, if the value of t is negative, we will
     // want to obrain the probability of obtaining a value equal or smaller than he
     // one observed. In such cases, this is given directly by jstat's studentt(t,df),
     // and there is no need to compute 1-p. To avoid this, we always compute the
     // probability of observing a positive value of t or larger. Moreover, doing this,
     // the two-tailed probability will also be always the double of the observed
     // one tail probability returned by jstat's studentt(t,df).
     //
     // t = 15, df = 10
     // p one tail   = 0.999999982519
     // 1-p one tail = 0.000000017481
     //
     // t = -15, df = 10
     // p one tail   = 0.000000017481
     // 1-p one tail = 0.999999982519
     //

     let t = Math.abs(x1-x2)/Math.sqrt(var1/n+var2/n);
     let p1 = 1-jStat.studentt.cdf(t,2*(n-1)),
         p2 = p1*2;

     
     text = "<h3><em>t</em>-test</h3>";
     text += "<textarea cols=\"20\" rows=\"10\" id=\"t_ttest\">";
     
     text += "t statistic = " + t.toFixed(precision) + "\n";
     text += "p (two tailed) = " + (p2).toFixed(precision) + "\n";
     text += "p (one tailed) = " + (p1).toFixed(precision) + "\n";
     text += "</textarea>";
     
     stats.innerHTML = text;
     stats.style.display = "inline-block"; 
     
    /*
     * Enable decimal separator switch
     */
    
    document.getElementById("t_sep").disabled = false;
    
  }
  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    reset: reset,
    sampleNormal: sampleNormal,
    sampleNormalNTimes: sampleNormalNTimes,
    setVar: setVar,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep,
    multipleFTests: multipleFTests,
    multipleTTests: multipleTTests,
    tTest: tTest
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
