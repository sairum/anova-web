  
  function recodeNestedFactors() {
    recoded = [...combins];
    for( let i = 0; i < recoded.length; i++ ) recoded[i] = [...combins[i]];
          
    for( let i = 0; i < factors.length; i++ ) {
      if( factors[i].nested ) {
        // Recode this factor  
        //console.log('Recoding factor ' + factors[i].name );
        let cmb = combins.length;  
        let cumlevs = [];
        var codes = [];
        let nest_list = factors[i].nestedin;
        let other = 1;
        let nestlevs=1;
        //console.log('Nested list     : ', nest_list.join(' '))
        for( let l = 0; l < i; l++ ) {
          let lev = factors[l].levels;
          if( l > 0 ) cumlevs[l]=cumlevs[l-1]*lev;
          else cumlevs[l] = lev; 
        } 
        for( let l = 0; l < factors.length; l++ ) {
          if( l < i ) {
            if( nest_list.indexOf(l) != -1 ) nestlevs *= factors[l].levels;
          } else {
            if (l != i) other *= factors[l].levels;
          }    
        }
        codes = [...Array(nestlevs*factors[i].levels).keys()];
        
        //console.log('Codes     : ', codes)
        //console.log('Cumulative: ', cumlevs)
        //console.log('Other     : ', other)
        //console.log('Nestlevels: ', nestlevs)
        
        for( let l = 0; l < i; l++) {
          if( nest_list.indexOf(l) == -1 ) {
            //split_repeat_codes( codes, cumlevs[l], factors[l].levels ); 
            let newcodes = [];
            let n = factors[l].levels;
            let blocks = cumlevs[l]/n;
            let chunks = codes.length/blocks;
            //console.log("Blocks: ", blocks," Chunks: ", chunks);
            let start = 0;
            for( let i = 0; i < blocks; i++ ){
              let chunk = codes.slice(start, start+chunks);
              //console.log("Block " + i.toString() + ": " + chunk.join("-"));
              for( let j = 0; j < n; j++) for(let c of chunk) newcodes.push(c);
              //console.log("Start ", start," Chunks ", chunks," ", newcodes.join("-"));
              start += chunks;
            }        
            let msg ='Repeating (' + codes.join(' ') + ') x ' + n.toString() + ' times: ';
            msg += '(' +  newcodes.join(' ') + ')';  
            //console.log(msg)                 
            codes = [...newcodes];  
          }
        }
        
        //console.log(codes)   
        let newcodes = [];
        for(let c of codes) {
          for( let l = 0; l < other; l++) newcodes.push(c);
        }  
        
        //let msg ='Expanding (' + codes.join(' ') + ') x ' + other.toString() + ' times: ';
        //msg += '(' +  newcodes.join(' ') + ')';  
        //console.log(msg)   
        for(let j = 0; j < recoded.length; j++) recoded[j][i] = newcodes[j];
      }     
    }    
  }

  
