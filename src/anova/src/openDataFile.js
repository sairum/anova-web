  
  /*************************************************************************/
  /*                                                                       */
  /*                             openDataFile                              */
  /*                                                                       */
  /* Function used to open a data file. It clears the contents of the DOM  */
  /* that are related with the Analysis of Variance. It also resets the    */
  /* global variables for the new analysis.                                */
  /*                                                                       */
  /*************************************************************************/

  function openDataFile() {
      
    /*
     * Grab the file object
     */
    
    let selectedFile = document.getElementById('loadFile').files[0];
    
    if(typeof(selectedFile) === 'undefined') return;
    
    /*
     * Set the mimetype of files to be read as 'text.*'
     */
    
    let textType = /text.*/;
    
    if ( selectedFile.type.match( textType ) ) {
        
      filename = selectedFile.name;
      
      let h = document.getElementById('filename');
      
      h.innerHTML = 'Current selected file is <b>' + filename + '</b>';   
      
      /*
       * Clean any global variables used in previous analysis
       */
      
      resetAnalysis();
      
      /*
       * Create a new reader and set its property 'onload'
       * to parse the data file 
       */
      
      let reader = new FileReader();
      
      /*
       * Define the function used for 'onload' (i.e., the
       * fcunction that actually reads the values from the 
       * data file selected)
       */
      
      reader.onload = function(e) {
        let header = true;
        let text   = reader.result;
        let lines  = text.split('\n');
        for(let i = 0, len = lines.length; i < len; i++) {
          // Trim the line 
          let li = lines[i].trim();
          
          /*
           * Check if the line is commented (starts with '#') or if
           * it is an empty line. If so, ignore it!
           */
          
          if( (li[0]!=='#') && (li.length !== 0) ) {
              
            /*
             * Split the line using spaces or tabs
             */
            
            li = li.split(/[\s\t]+/); 
            
            /*
             * Check if we are reading the first valid line, 
             * which should be the header with the names of 
             * the factors
             */
            
            if( header ) {
                
              /*
               * Number of factors is equal to the number of columns
               * in the data file minus the data column which is usually
               * named 'DATA'
               */
              
              nfactors = li.length - 1;
              
              for( let j = 0, k = li.length - 1; j < k; j++ ) {
                factors[j] = {};
                let name = li[j];
                
                /*
                 * Factor names ending in '*' are of type 'random',
                 * otherwise they are of type 'fixed'
                 */
                
                if(name.endsWith("*")) {
                  factors[j].type = RANDOM;
                  name = name.slice(0,name.length-1);
                } else {
                  factors[j].type = FIXED;
                }
                factors[j].name = name;
                factors[j].nlevels = 0;
                factors[j].levels = [];
                factors[j].nestedin = new Array(nfactors).fill(0);
                factors[j].depth = 0;
                /*
                 * Compute the subscript for the current factor
                 * stating in 'i' (the first factor)
                 * This will be needed in CT Rules
                 */
                
                factors[j].subscript = String.fromCharCode(j+105);
              }   
              
              /*
               * The header was read. All subsequent lines will be 
               * point observations (values) preceded by their 
               * respective level codes per factor (each factor
               * will be in a different column). Set variable
               * 'header' to false so that next time we jump to
               * the part that parses values and level codes
               */
              
              header = false; 
              
            } else {
                
              /*
               * First check if this line has the same number of elements 
               * of the header line. If not, abort, because something is 
               * missing...
               */
              
              if( li.length != nfactors + 1 ) {
                let ln = i + 1;
                let c = li.length.toString();
                let ec = nfactors + 1;
                alert('In line ' + ln.toString() + ' number of columns (' + c + 
                      ') is different from what is expected (' + e.toString() + ')');
                return;
              }
              
              /*
               * Create a new object to hold the new observation
               * corresponding to the line being parsed. 
               * This object will hold the classification criteria
               * for each data observation, i.e. the level codes 
               * per each factor. Moreover, it will also hold the
               * oserved data value into two separate variables: 
               * 'value' and 'original'. The latter will allow 
               * resetting the analysis to the original values 
               * after susbsequent transformation of the data, 
               * thus avoiding reading the data file again!
               */
              
              let d = {};
              d.levels = [];
              for( let j = 0; j < nfactors; j++ ) {
                  
                /*
                 * Read factor level codes for this observation 'li[j]' 
                 * and check if these level codes are already present 
                 * in 'factors[].levels' array. If not, add them and 
                 * increase 'factors[].nlevels' accordingly
                 */
                
                let p = factors[j].levels.indexOf(li[j]);
                
                /*
                 * indexOf return -1 if the argument is not in the array
                 */
                
                if(p == -1 ) {
                  factors[j].levels.push(li[j]);
                  factors[j].nlevels++; 
                }
                
                /*
                 * Add this level to data's new observation 'd'
                 */
                
                d.levels.push(li[j]);
              }
              
              /*
               * Read the data value. It should be the last column
               * of the line, which is equivalent 'li[nfactors]' 
               * because array indexes start on 0!
               */
              
              let n = +li[nfactors].replace(",", ".");
              let a = Number.parseFloat(n);
              if(Number.isNaN(a)) {
                let ln = i + 1;
                alert('In line ' + ln.toString() + ' data value (' + n.toString() + ') is not a valid number!');
                return;
              } else {  
                d.value    = n;
                d.original = n;
                
                /*
                 * The following limits are important to determine 
                 * what types of transformation are applicable to 
                 * the data: e.g. arcsin() transformation should 
                 * only be applied to data ranging from 0 to 1!
                 */
                
                if ( n > max_value ) max_value = n;
                if ( n < min_value ) min_value = n;
              }
              
              /*
               * Insert new observation in array 'data'
               */
              
              data.push( d );
            }  
          }  
        }
        
        // Enable all anova tabs as a file was successfully read
        let elem = document.getElementsByClassName("tabcontent");
        for ( let i = 0, len = elem.length; i < len; i++ ) elem[i].innerHTML="";
        
        //#DEBUG - Display Table of Factors 
        displayFactors();
        //!DEBUG
        
        displayData();
        
        /*
         * Start the ANOVA by computing 'partials' and then
         * computing the 'terms' of the analysis
         */
        
        if( computePartials() ) buildTerms(); 
        
      }
      
      reader.readAsText( selectedFile );

      /*
       * Reset the file input object so that reloading the same file works!
       */
      
      document.getElementById('loadFile').value = "";
      
    } else {
      alert('File type of ' + filename + ' not supported by your browser.');
    }
  }

  
