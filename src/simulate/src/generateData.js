
  /****************************************************************************/
  /*                                                                          */
  /*                                 generateData                             */
  /*                                                                          */
  /*                         Actually generate the data                       */
  /*                                                                          */
  /****************************************************************************/

  function generateData() {

    let fmt = {minimumFractionDigits: DPL};

    //Grab population parameters from HTML fields
    
    let seed = document.getElementById("seed").value,
        average = parseFloat(document.getElementById("average").value),
        stdev = parseFloat(document.getElementById("stdev").value),
        replicates = parseInt(document.getElementById("replicates").value);
    
    // jStat does not handle directly RNGs. To use a custom seed we have
    // to  resort to a user's defined RNG that allows seed setting. Here
    // we implement this with davidbau's "seedrandom.js" available at
    // https://github.com/davidbau/seedrandom
    
    if( seed != "" ) {
      var myRandom = new Math.seedrandom(seed.toString());
      jStat.setRandom(myRandom);
    }    
    
    createEffects( average, stdev );    
            
    let line = [], text = "", effect;
    
    // Build the header for the data
    
    for(let i = 0; i < factors.length; i++) {
      let nm = factors[i].orig_name;
      if(factors[i].ftype == 'random') nm += '*';
      line.push(nm);
    }  
    text = line.join(' ') + ' DATA\n';
    
    // Populate the data array
    
    for(let i = 0; i < recoded.length; i++) {
      line = [];
      effect = 0;
      for(let j = 0; j < factors.length; j++) {
        let level = recoded[i][j];
        effect += factors[j].effects[level];  
        line.push(factors[j].lcodes[level]);
      }
      let c = line.join(' ');
      for(let j = 0; j < replicates; j++ ) {
        let y = jStat.normal.sample(average, stdev);
        text += c + ' ' + (y+effect).toLocaleString( undefined, fmt ) + '\n';
      }
    }        
    
    let elem = document.getElementById("result");  
    elem.value = text;
    
    // Since the data exists, let's enable a button
    // to download it
    
    elem = document.getElementById("download");
    elem.disabled = false;

    //console.log(factors);

  }

