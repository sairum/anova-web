  /*************************************************************************/
  /*                                                                       */
  /*                            transformData                              */
  /*                                                                       */
  /* This function applies several possible transformations to data values */
  /* but original data is kept for any possible reset. Transformations are */
  /* applied sequentially, thus previous transformations are "memorized".  */
  /* Hence, transforming data using the fourth root is equivalent to       */
  /* applying the square root transformation twice.                        */
  /*                                                                       */
  /*************************************************************************/ 

  function transformData( t ) {


    let multc = parseFloat(document.getElementById("multc").value);
    let divc  = parseFloat(document.getElementById("divc").value);
    let powc  = parseFloat(document.getElementById("powc").value);

    //console.log(multc,divc,powc);
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
    switch( t ){
      case 0:
        resetData();
        break;
      case 1:
        if( min_value >= 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.sqrt( v );
            });
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 2:
        if( min_value >= 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.pow( v , 1/3 );
            });
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 3:
        if( min_value >= 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.pow( v , 1/4 );
            });
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 4:
        if( min_value > 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.log( v +1 )/Math.log(10);
            });
          }
        } else alert('Cannot apply transformation to negative' +
                     'or null values!');
        break;
      case 5:
        if( min_value > 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.log( v + 1 );
            });
          }
        } else alert('Cannot apply transformation to' +
                     ' negative or null values!');
        break;
      case 6:
        if( (min_value >= 0) && ( max_value <= 1 ) ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = Math.asin( v );
            });
          }
        } else alert('Cannot apply transformation to values larger than 1' +
                     ' or smaller than 0!');
        break;
      case 7:
        for( let d of data ) {
          d.values.forEach( function(v, idx, arr) {
            arr[idx] = v * multc;
          });
        }
        break;
      case 8:
        if( divc != 0 ) {
          for( let d of data ) {
            d.values.forEach( function(v, idx, arr) {
              arr[idx] = v / divc;
            });
          }
        } else alert('Cannot divide by zero!');
        break;
      case 9:
        for( let d of data ) {
          d.values.forEach( function(v, idx, arr) {
            arr[idx] = Math.pow( v, powc );
          });
        }
        break;
    }

    // Reset a few data structures before recomputing cells sums of squares.
    // Keep the 'factors' and 'data' arrays only, but clean some derivd
    // information

    for ( let f of factors ) {
      f.name = f.orig_name;
      f.nlevels = f.levels.length;
      f.nestedin = new Array( nfactors ).fill(0);
      f.depth = 0;
    }

    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates   = 0;
    total    = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting  = false;

    // Display the data table

    displayDataTable();

    // Restart the ANOVA by computing 'cells' or 'partials'

    computeCells();

  }
