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
