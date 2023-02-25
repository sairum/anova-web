


  function studentizedComparisons(test, fact, df, ms, avgs) {
    //console.log(avgs)  
    let t = "";
    let comps = [], p = 0;
    //t += '<p>' + fact.toString() + ' ' + df.toString() + ' ' + ms.toString() +'</p>';
    let total_range = avgs.length;
    let range = total_range;
    do {
      let times = total_range - range + 1; 
      for( let i = 0; i < times; i++ ) {
        let j = i + range - 1;

        //console.log('Compare level ' + avgs[i].level + ' against level ' + avgs[j].level);
        
        let q = Math.abs(avgs[i].average - avgs[j].average)/Math.sqrt( ms / avgs[i].n );
        if(test == 'tukey') p = 1 - jStat.tukey.cdf(q, total_range, df);
        if(test == 'snk')   p = 1 - jStat.tukey.cdf(q, range, df);
        
        if( p > mt_rejection_level ) {
          let included = false;
          for( let k = 0, kl = comps.length; k < kl; k++ ) { 
            if( ( i >= comps[k][0] ) && (j <= comps[k][1]) ) {
              included = true;
              break;
            }    
          }
          if(!included) {
            //comps.push({a1: i, a2: j, q: q, p: p});   
            comps.push([ i, j ]);  
            //t += '<p>' + i.toString() + ' == ' + j.toString() + '</p>';  
            //t += '<p>' + avgs[i].level + ' = ' + avgs[j].level + '    <i>(' + i.toString() + ' = ' + j.toString() + ')</i></p>'; 
            //console.log(q,p); 
          }  
        }
        //console.log(q,p); 
      }
      range--;  
    } while(range > 1);
    
    /*
     * Check wich levels of the target factor fall outside the homogeneous
     * groups in 'comps' and add them to the list.
     */
    
    for( let i = 0, il = avgs.length; i < il; i++ ) {
      let included = false;  
      for ( let j = 0, jl = comps.length; j < jl; j++) {
        if( ( i >= comps[j][0] ) && ( i <=  comps[j][1] ) ) {
          included = true;
          break;
        }    
      }    
      if( !included ) {
        comps.push([i, i]);  
      }    
    }    
    
    comps.sort((a, b) => (a[0] >  b[0])? 1 : -1); 
    
    //console.log(comps)
    
    t += '<table>';
    t += '<tr><th>Level</th><th>Average</th><th>n</th>';
    for( let i = 0, il = comps.length; i < il; i++ ) t += '<th>&nbsp;</th>';
    t += '</tr>';
    for( let i = 0, il = avgs.length; i < il; i++ ) {
      t += '<tr><td>'+avgs[i].level+'</td><td>'+avgs[i].average.toString()+'</td><td>'+avgs[i].n.toString()+'</td>';
      for(let j = 0, jl = comps.length; j < jl; j++) {
        if(( i >= comps[j][0] ) && (i <= comps[j][1])) t += '<td>&#9679;</td>';
        else t += '<td>&nbsp;</td>';
      }
      t += '</tr>'; 
    }    
    t += '</table>';
    return t;
  }    


  function multipleTests() {
    
    //console.log(mcomps)
      
    /*
     * studentized range statistics. Student Newman Keuls, Tuket, Duncan are
     * all based on studentized range Q. 
     */  
    
    let studentized = ['snk', 'tukey', 'duncan'];
    
    /*
     * Grab the <select> element which holds the type of multiple test 
     * to apply which is denoted by id='test'
     */
    
    let elem = document.getElementsByName("test");
    
    let testName = 0;
    for( let i = 0; i < elem.length; i++ ) {
      if( elem[i].checked ) {
        testName = elem[i].value;
        break;
      }  
    } 
    
    /*
     * use 'elem' to point to a <div> which will hold the results
     * of the multiple tests (id='mtest_results')
     */
    
    elem = document.getElementById("mtest_results"); 
    
    /*
     * If the selection is not 'None' (index 0)...
     */
    
    if( testName != 'none' ) {
      let text = "";
      
      for(let i = 0, len = mcomps.length; i < len; i++ ) {
       
        let dferr = mcomps[i].df_against,
            mserr = mcomps[i].ms_against,
            fcode = mcomps[i].fcode;
            
        /*
         * Display a header for the multiple comparison
         */
        
        text += '<h3>Multiple comparisons for levels of factor ' + mcomps[i].fname;
        if(mcomps[i].type == 'interaction') text += ' within levels of ' + mcomps[i].term + '</h3>';
        else text += '</h3>'; 
         
        /*
         * Go along the whole list of comparisons for this term. It may be just
         * a single test if 'mcomps' is of type 'factor' (involves comparisons
         * between multiple averages), or it can be a series of tests, one for
         * each combination of levels of facto.rs whith which the one being 
         * compared interacts with
         */
        
        for(let a in mcomps[i].averages) {
            
          /*
           * Check if this is an interaction. If so, specify the combination
           * of levels of interacting factors within which multiple tests are
           * being carried for factor 'mcomps[i].fcode'. The 'key' for the
           * 'mcomps[i].averages[]' array holds the combination of levels
           * involved with '-' for factors not included in the interaction
           * or the target factor itself.
           */

          if( mcomps[i].type == 'interaction' ) {
            let f = a.split(',');
            //console.log(f);
            let t = [];
            for(let j = 0, jlen = f.length; j < jlen; j++ ) {
              if( f[j] != '-' ) {  
                t.push('level <i>' + factors[j].levels[f[j]] + '</i> of factor ' + factors[j].name);
              }
            }
            text += '<h4>For ' + t.join(' and ') + '</h4>';
          }    

          /*
           * Check if the multiple test is of type 'studentized range'
           */
          
          if( studentized.indexOf(testName) != -1 ) {
            text += studentizedComparisons(testName, fcode, dferr, mserr, mcomps[i].averages[a] );  
          }  
        }    
      }

      if( text == "" ) text="<h3>No multiple tests available!</h3>Are you sure there are significant differences in fixed factors?";
      elem.innerHTML = text;
      elem.style.display = 'inline-block';
      
        
    } else {
      elem.innerHTML = "";  
      elem.style.display = 'none';
    }    

  }
