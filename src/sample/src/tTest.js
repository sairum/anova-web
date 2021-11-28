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
     
     
     let t = (x1-x2)/Math.sqrt(var1/n+var2/n);
     let p1 = jStat.studentt.cdf(t,2*(n-1)),
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
