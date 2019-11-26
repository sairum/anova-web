  
  /*
   * Randomly create effects by sampling deviations
   * to the overall average using a normal distribution
   * of "errors". The code used a simulated "coin" throw
   * to decide if differences existes or not between a
   * given factor. This is currently commented out
   * below: all factors are candidates to display
   * differences, but chance may create so small differences
   * that they don't show up as significant!
   */
  
  
  function createEffects( average, stdev) {
    for( let i = 0; i < factors.length; i++) {
      // let x = jStat.uniform.sample( 0, 1 );
      factors[i].effects=[];
      for( let j = 0; j < factors[i].true_levels; j++ ) {
        //if( x > 0.5 ) {
          let e = jStat.normal.sample( average, stdev ); 
          factors[i].effects.push(e - average);
        //} else factors[i].effects.push(0);     
      } 
    }    
  }
 
