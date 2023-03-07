  
  /****************************************************************************/
  /*                                                                          */
  /*                               openDataFile                               */
  /*                                                                          */
  /*   Function used to open a data file. It clears the contents of the DOM   */
  /*   that are related with the Analysis of Variance. It also resets the     */
  /*   global variables for the new analysis.                                 */
  /*                                                                          */
  /****************************************************************************/

  function openDataFile() {

    //#DEBUG
    //console.log('openDataFile() called');
    //!DEBUG
      
    // Grab the file object
    
    let selectedFile = document.getElementById('loadFile').files[0];
    
    if(typeof(selectedFile) === 'undefined') return;
    
    // Set the mimetype of files to be read as 'text.*'
    
    let textType = /text.*/;
    
    if ( selectedFile.type.match( textType ) ) {
        
      filename = selectedFile.name;
      
      let h = document.getElementById('filename');
      
      h.innerHTML = 'Current selected file is <b>' + filename + '</b>';   
      
      // Clean any global variables used in previous analysis
      
      resetAnalysis();

      // Create a new reader and set its property 'onload'
      // to parse the data file
      
      let reader = new FileReader();
      
      // Define the function used for 'onload' (i.e., the
      // fcunction that actually reads the values from the
      // data file selected)
      
      reader.onload = function(e) {
        let header = true;
        let text   = reader.result;
        let lines  = text.split('\n');
        for( let i = 0, len = lines.length; i < len; i++ ) {
            
          // Trim the line 
            
          let li = lines[i].trim();
          
          // Check if the line is commented (starts with '#') or if
          // it is an empty line. If so, ignore it!
          
          if( ( li[0]!=='#' ) && ( li.length !== 0 ) ) {
              

            // Split the line using spaces or tabs
            
            li = li.split(/[\s\t]+/); 
            

            // Check if we are reading the first valid line,
            // which should be the header with the names of
            // the factors
            
            if( header ) {
                

              // Number of factors is equal to the number of columns
              // in the data file minus the data column which is usually
              // named 'DATA' and should be the last column

              nfactors = li.length - 1;
              
              for( let j = 0; j < nfactors; j++ ) {
                let f = {};
                let name = li[j];
                
                // Factor names ending in '*' are of type 'RANDOM',
                // otherwise they are of type 'FIXED'

                if( name.endsWith( '*' ) ) {
                  f.type = RANDOM;
                  name = name.slice( 0, name.length-1 );
                } else {
                  f.type = FIXED;
                }
                if ( f.type == FIXED ) f.name = name;
                else f.name = '<span class="random">' + name + '</span>';
                f.orig_name = name;
                f.nlevels = 0;
                f.levels = [];
                f.nestedin = new Array( nfactors ).fill(0);
                f.nested = false;
                f.depth = 0;

                factors.push(f);
              }   
              
              // The header was read. All subsequent lines will be
              // point observations (values) preceded by their
              // respective level codes per factor (each factor
              // will be in a different column). Set variable
              // 'header' to false so that next time we jump to
              // the part that parses values and level codes
              
              header = false; 
              
            } else {
                
              // Reading data...
              // First check if this line has the same number of elements
              // of the header line. If not, abort, because something is
              // missing...
              
              if( li.length != nfactors + 1 ) {
                let ln = i + 1;
                let c = li.length.toString();
                let e = nfactors + 1;
                alert( 'In line ' + ln.toString() + ' number of columns (' +
                      c + ') is different from what is expected (' +
                      e.toString() + ')' );
                return;
              }

              // Read factor level codes and data value. As explained above
              // there should be as many level codes as factor per line, plus
              // the data value in the end. Values will be grouped by unique
              // level code combinations. An array of values will be created
              // for each ANOVA cell, a cell being a unique combination
              // between levels of factors. To do so, the structure gathering
              // these observations should have a 'label' composed by the
              // concatenation of level codes stored in an array named 'levels'.
              // This way, it's always possible to assign any new observation
              // (data value) to a group, even when data values are provided
              // unordered.

              let levels = [], value = 0, original = 0, label='';

              for( let j = 0; j < nfactors; j++ ) {

                // Read factor level codes for this observation 'li[j]'
                // and check if these level codes are already present
                // in 'factors[].levels' array. If not, add them and
                // increase 'factors[].nlevels' accordingly

                let p = factors[j].levels.indexOf( li[j] );

                // indexOf return -1 if the argument is not in the array

                if(p == -1 ) {
                  factors[j].levels.push( li[j] );
                  factors[j].nlevels++;
                }

                // Add this level to 'levels' array

                levels.push( li[j] );

              }

              // Replace commas (',') by dots ('.') as decimal separators
              let n = li[nfactors].replace( ",", "." );
              let a = Number.parseFloat(n);

              //Check if the data value is a number
              if(Number.isNaN(a)) {
                let ln = i + 1;
                alert( 'In line ' + ln.toString() + ' data value (' +
                      n.toString() + ') is not a valid number!');
                return;
              } else {
                value    = a;
                original = a;

                // The following limits are important to determine
                // what types of transformation are applicable to
                // the data: e.g. arcsin() transformation should
                // only be applied to data ranging from 0 to 1!

                if ( a > max_value ) max_value = a;
                if ( a < min_value ) min_value = a;
              }

              // Since all level codes and the data value are read,
              // compute the 'label' for this observation.

              label = levels.join('');

              if ( data.length == 0 ) {

                // If this is the first data value, the 'data' array
                // is empty, so create a structure for a new ANOVA cell

                data.push({ label    : label,
                            levels   : levels,
                            values   : [value],
                            originals: [original],
                            codes    : [],
                            sumx     : 0,
                            sumx2    : 0,
                            ss       : 0,
                            n        : 0,
                            n_orig   : 0,
                            average  : 0,
                            variance : 0,
                            median   : 0,
                            cl95     : 0
                          });

              } else {

                // Check if an ANOVA cell with the current computed
                // 'label' already exists

                let idx = data.findIndex( e => e.label === label);

                if ( idx != -1 ) {

                  // An ANOVA cell with 'label' == label was found!
                  // Update its 'values' and 'originals'

                  data[idx].values.push(value);
                  data[idx].originals.push(original);
                } else {

                  // Add a new structure for the new ANOVA cell

                  data.push( { label    : label,
                               levels   : levels,
                               values   : [value],
                               originals: [original],
                               codes    : [],
                               sumx     : 0,
                               sumx2    : 0,
                               ss       : 0,
                               n        : 0,
                               n_orig   : 0,
                               average  : 0,
                               variance : 0,
                               median   : 0,
                               cl95     : 0
                             });
                }
              }
            }
          }  
        }

        // If we reach this part, enable all ANOVA tabs as a file was
        // successfully read
        
        let elem = document.getElementsByClassName("tabcontent");

        for ( let e of elem ) e.innerHTML="";
        
        //#DEBUG - Display Table of Factors 
        displayFactors();
        //!DEBUG
        
        displayData();
        
        // Start the ANOVA by computing 'partials'
        
        computeCells();

        // Select ANOVA tab to display results for this data

        selectTab('analysis');

      }
      
      reader.readAsText( selectedFile );

      // Reset the file input object so that reloading the same file works!
      
      document.getElementById('loadFile').value = "";
      
    } else {
      alert('File type of ' + filename + ' not supported by your browser.');
    }
  }

