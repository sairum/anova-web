"use strict";

var anova = (function () {
     
  /*************************************************************************/
  /*                                                                       */
  /*                             Global Variables                          */
  /*                                                                       */
  /*************************************************************************/  
  
  /*
   * Define these two constants which denote factor types. The choice of 0 
   * for 'random' is not irrelevant. Terms in a ANOVA may be combinations of 
   * two or more factors, called 'interactions'. An interaction may also 
   * have a "type". If the interaction involes only fixed factors it's also 
   * an interaction of fixed type, but if it involves at least one random factor 
   * it becomes a random type interaction. Hence, to determine the type of any 
   * term in the ANOVA one only has to multiply the types of all factors 
   * involved in the term. A result of zero means a random type interaction!
   */
  
  const RANDOM  = 0;
  
  const FIXED   = 1;
  
  // 'data' is an array holding data values as read from data file
  //
  // value    : the observed value (may be transformed)
  // original : the original value (to reset if transformed)
  // levels   : an array with codes denoting the level for each 
  //            factor; it's size is 'nfactors'; original level
  //            names are kept in 'factors[].levels' array
   
  var data = [];
  
  // Number of factors. Computed from reading the header of
  // the data file

  var nfactors = 0;
 
  // 'factors' is an array with information for each factor
  //
  // name        : the name of the factor, initially read from the  
  //               header of the data file
  // orig_name   : the original name of the factor; factor names maybe 
  //               changed due to hierarchies (nested factors); a reset
  //               should put everything as in the begining 
  // type        : 0 or 1 ("random" or "fixed")
  // nlevels     : number of levels
  // levels      : array with the original names of the levels. the
  //               codes of the levels are the indexes of this array
  // nestedin    : array with size = 'nfactors' filled with 0s, and 
  //               with 1s on cells corresponding to a factor that
  //               nests this one: [0,0,1,0,0] means that this factor
  //               is nested in factor 2.
  // depth       : if factor is nested in others, this tells how 
  //               deep nesting is. If not nested 'depth' is 0; 
  //               a factor nested in the interaction of two other
  //               factors has 'depth' 2.

  var factors = []; 
  
  // 'partials' is an array holding all unique combinations
  // between the levels of the codes involved in the ANOVA
  //
  // codes  : array with level codes per factor; codes are 
  //          just indexes to the true level names stored
  //          in 'factors[].levels'
  // sumx   : sum of observations which have this
  //          combination of level codes
  // sumx2  : squared sum of observations which have this
  //          combination of level codes
  // n      : number of replicates
  // n_orig : original replicates; may be different from 'n' 
  //          if some replicates are missing in some cells
  
  var partials = [];
  
  // 'terms' is an array that holds information for all combinations of 
  // ANOVA terms as if a full orthogonal model was used. For each term 
  // the following information is compiled:                                             
  //                                                                      
  // name    : The name of a term; can be a single name for a main factor
  //           or a combination of names separated by '*' (e.g., A*B*C)  
  //           for interactions
  // codes   : an array with as many cells as the number of factors, filled
  //           with 0s; it will have 1s in cells corresponding to main
  //           factors involved in the term: in a three-way ANOVA, the
  //           codes array [1,0,1] means that factor 0 and 2 are in this
  //           term, which is an interaction
  // order   : 1 if the term denotes main factor (e.g. [1,0,0,0]), 2 if it
  //           denotes a first order interactions (.g. [0,1,1]), etc.         
  // combins : number of expected combinations of levels for a term, 
  //           determined by the product of the involved terms levels  
  //           computed during data file read; this number may be larger
  //           than the real number of combins if some factors are nested
  // nlevels : this is the real number of combinations of terms levels
  //           computed by analyzing the partials (unique combinations
  //           of terms' codes)                                                           
  // levels  : array holding codes for levels. For a single factor ANOVA
  //           with three levels it will be [0,1,2], but for a two-factor
  //           ANOVA with two levels per factor, it will be 
  //           ['0:0','0:1','1:0','1:1']                                                           
  // sumx    : array holding the sum of all observations for each 
  //           combination of levels of this 'term'                                                            
  // sumx2   : array holding the squared sum of all observations for
  //           each combination of levels of this 'term'                                                           
  // n       : array of number of observations for each combination
  //           of levels of this 'term'
  // averages: array of averages of observations for each combination
  //           of levels of this 'term'                                                         
  // ss      : uncorrected sums of squares                                                               
  // df      : degrees of freedom                                                                
  // SS      : corrected sums of squares                                                             
  // ct_codes: array to store coeficients for the Cornfiel-Tukey
  //           table of multipliers
  // varcomp : array to store the components of variation for this
  //           term, used in Cornfield-Tukey rules
  // MS      : array to hold MS (SS/df)
  // F       : the F-test (MS1/MS2)
  // P       : array with probabilities of F-tests
  // against : denominator for the F-test

  var terms = [];
  
  var mcomps = [];
  
  var replicates = 0;

  var corrected_df = 0;

  var total = {df: 0, ss: 0};

  var residual = {name: "Error", df: 0, ss: 0};
  
  // Start by assuming that all factors are orthogonal; if later
  // on it's found that they are not, 'nesting' becomes true
  
  var nesting = false;

  var max_value = Number.MIN_SAFE_INTEGER;

  var min_value = Number.MAX_SAFE_INTEGER;  

  // default rejection criteria for the F tests (alpha)
  var rejection_level = 0.05;
  
  // default rejection criteria for multiple tests (alpha)
  var mt_rejection_level = 0.05;
  
  var filename= "";

  /*************************************************************************/
  /*                                                                       */
  /*                            displayCTRules                             */
  /*                                                                       */
  /* This function displays a table with the Analysis of Variance          */
  /*                                                                       */     
  /*************************************************************************/   
  
  function displayCTRules( ) {
    
    let c = document.getElementById('ctrules'); 
    
    
    let table = '<div class="ct"><table><thead>';
    
    
    /*
     * Build the header of the table. First column for the ANOVA term name
     */
    
    table += '<tr><th>Term</th>';
    
    
    /*
     * Now add one column for each subscript associated with each factor,
     * plus one column for the Error. This is the CT table of multipliers,
     * and its display is just for debugging purposes
     */
    
    
    /*
     * We should build a table with as many columns as ANOVA terms (including
     * the Error term) which will display the components of variance measured
     * by each term. Again, displaying this is only necessary while debugging 
     */
    
    
    /*
     * Finally a column to display which variance components are estimated
     * by each term
     */
    
    table += '<th>Estimates</th></tr></thead><tbody>';
    
    
    /*
     * Compute rows
     */
    
    for(let i = 0, len = terms.length - 1; i < len; i++ ) {
      table += '<tr><td>' + terms[i].name + '</td>';
      
      let est = [], name = "";
      for ( let j = terms.length - 2; j >= 0; j--) {
        if(terms[i].varcomp[j] > 0 ) {
          if( ( terms[j].name === 'Error') || ( terms[j].name === 'Residual' ) ) name = '&epsilon;';
          else name = terms[j].name;
          if( terms[i].varcomp[j] === 1 ) est.push('&sigma;<sup>2</sup><sub>' + name + '</sub>');
          else est.push(terms[i].varcomp[j].toString() + '*&sigma;<sup>2</sup><sub>' + name + '</sub>'); 
        }
      }
      table += '<td>' + est.join(' + ') + '</td></tr>';
      
    }
    
    table += '</tbody></table></div>';
    
    
    c.innerHTML = table;
    
  } 

  
  /*************************************************************************/
  /*                                                                       */
  /*                            computeCTRules                             */
  /*                                                                       */
  /* This function computes Cornfield-Tukey Rules that will determine the  */
  /* denominators of the F statistics in any ANOVA scenario. For a fully   */
  /* orthogonal ANOVA with fixed factors, the denominator for all tests is */
  /* the Error term. For mixed or more complex models the denominator      */
  /* changes according to the CT rules                                     */
  /*                                                                       */ 
  /*************************************************************************/

  function computeCTRules() {
    
    /*
     * Build the table of multipliers for all terms
     * Skip the last two terms. The "total" is not necessary
     * and the ct_codes for the "Error" are already computed
     * [1,1,...,1] for all factors
     */
      
    for ( let i = 0, tl = terms.length - 2; i < tl; i++ ) {
      terms[i].ct_codes = new Array(nfactors+1).fill(0);
      for ( let k = 0; k < nfactors; k++ ) {
        let t = terms[i].codes[k];
        if( t != 0 ) {
            
          /*
           * subscript is in the term
           */
          
          if ( t == 1 ) {
              
            /*
             * it's outside parenthesis
             */
            
            if (factors[k].type === RANDOM) terms[i].ct_codes[k] = 1;
            else terms[i].ct_codes[k] = 0; 
          } else {
              
            /*
             * subscript is within parenthesis
             */
            
            terms[i].ct_codes[k] = 1;  
          } 
        } else {
            
          /*
           * This subscript is not in the term
           */
          
          terms[i].ct_codes[k] = factors[k].nlevels;
        }  
      }
      terms[i].ct_codes[nfactors] = replicates;
    }  
    
    /*
     * Now check wich components contribute to the MS
     * of each term, including the "Error"
     */

    let tl = terms.length - 1;
    for ( let i = 0; i < tl; i++ ) {
        
      /*
       * 'i' is the 'current' component term and should be checked 
       * against all other component terms
       */
      
      for ( let j = 0; j <tl; j++ ) {
        
        /*
         * 'j' is the component term being compared
         * with the current term 'i'
         */
        
        let included = true;
        for ( let k = 0; k < nfactors + 1; k++) {
          if ( ( terms[i].codes[k] > 0 ) && ( terms[j].codes[k] == 0) ) {
            included = false;
            break;
          }  
        }
        if (included) terms[i].varcomp.push(1); 
        else terms[i].varcomp.push(0); 
      }
    }
    
    /* Finally, update the included terms according to the 
     * multipliers of 'ct_codes'. We can skip the "Error"
     * term. For each target 'term' denoted by 'i', compare
     * it with the current 'term', denoted by 'j'. If the 
     * current 'term' contains all the subscripts of 'i'
     * the multiplier for this particular source of variation
     * in the target term is the product of all coeficients
     * of 'j' excluding those which subscripts are present
     * in 'i'.
     */
    
    for ( let i = 0; i < tl; i++ ) {
      for ( let j = 0; j < tl; j++) {
        if( terms[i].varcomp[j] == 1 ) {
          let product = 1;
          for ( let k = 0; k < nfactors + 1; k++) {
            if ( terms[i].codes[k] == 0 ) {
              product *= terms[j].ct_codes[k]; 
            }  
          }
          terms[i].varcomp[j] = product;
        }  
      }    
    }
    
    /* 
     * Now check what are the denominators of the F tests.
     * For each term (excluding the "Error" and "Total"
     * compare them with all others
     */ 
    
    tl = terms.length;
    
    for ( let i = 0; i < tl - 2; i++ ) {
      
      /*
       * for each term 'i' start from the bottom
       * and check if the 'varcomp' of term 'j'
       * has all the components of 'varcomp' for
       * term 'i' except for 'i' itself
       */
      
      //console.log("For " + terms[i].name)
      for ( let j = tl - 2; j >= 0; j-- ) {
        //console.log("  Compare with " + terms[j].name)
        let found = true;
        if (i != j ) {
          for ( let k = 0, vl = terms[i].varcomp.length; k < vl; k++ ) {
            if (k != i) {
              if ( terms[i].varcomp[k] != terms[j].varcomp[k] ) {
                found = false 
                break;
              }
            }
          }
        } else {
          found = false;
        }  
        if (found) {
          terms[i].against = j;
          terms[i].F = terms[i].MS/terms[j].MS;
          terms[i].P = 1 - jStat.centralF.cdf(terms[i].F, terms[i].df, terms[j].df);
          break;
        } else {
          terms[i].against = -1;
          terms[i].F = NaN;
          terms[i].P = NaN;      
          
        }  
      }  
    }  
    
    displayCTRules();
  }
  
  /*************************************************************************/
  /*                                                                       */
  /*                             setAlpha                                  */
  /*                                                                       */
  /* This function sets/changes the rejection criterion (alpha) for the    */
  /* ANOVA by reading the provided value in the <input> tag with 'id'      */
  /* 'alpha'. The only effect is to render any statistical tests with      */
  /* probabilities smaller than 'rejection_level' in italics, to identify  */
  /* them from non-significant tests                                       */
  /*                                                                       */
  /*************************************************************************/
  
  function setAlpha() {
    rejection_level = parseFloat(document.getElementById('anova_alpha').value);
    if(rejection_level > 1) rejection_level = 0.9999999;
    if(rejection_level < 0) rejection_level = 0.0000001;
    //console.log(rejection_level)
    
    /*
     * We should redisplay the ANOVA table as some of the
     * terms may now be statistically significant. Moreover,
     * multiple tests may also have to be run again...
     */
     
    displayANOVA();
    
  }
  
  function setMtAlpha() {
    mt_rejection_level = parseFloat(document.getElementById('mtests_alpha').value);
    if(rejection_level > 1) rejection_level = 0.9999999;
    if(rejection_level < 0) rejection_level = 0.0000001;
    //console.log(mt_rejection_level)
    
    /*
     * We should redisplay the ANOVA table as some of the
     * terms may now be statistically significant. Moreover,
     * multiple tests may also have to be run again...
     */
    buildMultipleComparisons();
    multipleTests();
    //displayANOVA();
    
  }
  /*************************************************************************/
  /*                                                                       */
  /* Here, we use the saved data values for each entry in the data list to */
  /* reset the transformed values.                                         */
  /*                                                                       */
  /*************************************************************************/

  function resetData() {
    
    let h = document.getElementsByClassName("tabcontent");
    for ( let i = 0, len = h.length; i < len; i++ ) h[i].innerHTML = "";
    
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
    
    for( let i = 0; i < data.length; i++ ) {
      data[i].value = data[i].original;
      if ( data[i].value > max_value ) max_value = data[i].value;
      if ( data[i].value < min_value ) min_value = data[i].value;
    }    
    
    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }
    
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    
    displayData();
        
    /*
     * Start the ANOVA by computing 'partials' and then
     * computing the 'terms' of the analysis
     */
        
    computePartials(); 
  }
  /*************************************************************************/
  /*                                                                       */
  /*                            displayFactors                             */
  /*                                                                       */
  /* This function displays a small table with the summary of the factors, */
  /* their types, names and number of levels, derived from the data file   */
  /*                                                                       */
  /*************************************************************************/ 
  

  /*************************************************************************/
  /*                                                                       */
  /*                             resetAnalysis                             */
  /*                                                                       */
  /* This function clears all 'global' variables of this module (anova)    */
  /* and also clears the DOM nodes related with the ANOVA                  */
  /*                                                                       */  
  /*************************************************************************/    
  
  function resetAnalysis() {
      
    /*
     * Clear results in all <divs> of class 'anovaTabContents' which are children
     * of <div id='anova'>
     */
    
    let s = document.getElementsByClassName('tabcontent')
    for( let i = 0, len = s.length; i < len; i++) {
      if (typeof(s[i]) !== 'undefined' && s[i] !== null) s[i].innerHTML = "";
    }

    
    /*
     * Reset main variables
     */
    
    nfactors = 0;
    factors  = [];
    data     = [];
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
  }

  /*************************************************************************/
  /*                                                                       */
  /*                            transformData                              */
  /*                                                                       */
  /* This function applies several possible transformations to data values */
  /* but keeps original data for any possible reset. Transformations are   */
  /* applied sequentially, thus "memorizing" previous transformations.     */
  /* Hence, transforming data using the fourth root is equivalent to apply */
  /* the square root transformation twice.                                 */
  /*                                                                       */
  /*************************************************************************/ 

  function transformData() {
      
    let t = document.getElementsByName("transf");
    let multc = parseFloat(document.getElementById("multc").value);
    let divc  = parseFloat(document.getElementById("divc").value);
    let powc  = parseFloat(document.getElementById("powc").value);
    //console.log(multc,divc,powc);
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
    
    let transf = 0;
    for( let i = 0; i < t.length; i++ ) {
      if( t[i].checked ) {
        transf = i;
        break;
      }  
    }    

    for( let i = 0; i < data.length; i++ ) {
      let v = data[i].value;
      //let text = i.toString() + ' ' + v.toString();
      switch(transf){
          case 1:
            if( v >= 0 ) v = Math.sqrt(v);  
            break;  
          case 2:
            v = Math.pow(v, 1/3);
            break;
          case 3:
            v = Math.pow(v, 0.25);
            break;  
          case 4:
            if( v >= 0 ) v = Math.log(v+1)/Math.log(10);
            break;
          case 5:
            if( v >= 0 ) v = Math.log(v+1);
            break;
          case 6:
            if( (v >= 0) && ( v <= 1 ))v = Math.asin(v);
            break;  
          case 7:
            v *= multc;
            break;  
          case 8:
            if( divc != 0 ) v /= divc;
            break;  
          case 9:
            v = Math.pow(v, powc);
            break;    
      }
      //text += ' ' + v.toString();
      //console.log(text)
      
      data[i].value = v;  
      if ( v > max_value ) max_value = v;
      if ( v < min_value ) min_value = v;
    }    
    
    let h = document.getElementsByClassName("tabcontent");
    for ( let i = 0, len = h.length; i < len; i++ ) h[i].innerHTML = "";
    
    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }
    
    partials = [];
    terms    = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;
    
    displayData();
    
    /*
     * Restart the ANOVA by computing 'partials' 
     */
    
    computePartials(); 

  }
  /*************************************************************************/
  /*                                                                       */
  /*                            displayANOVA                               */
  /*                                                                       */
  /* This function displays a table with the Analysis of Variance          */
  /*                                                                       */     
  /*************************************************************************/   
  
  function displayANOVA() {
       
    let text = '<div class="ct"><table>' +
                '<thead><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th>' +
                '<th>Prob.</th><th>Against</th></tr></thead><tbody>';
     
    for(let i = 0, len = terms.length; i < len; i++ ) {
      text += "<tr>";
      text += "<td>" + terms[i].name + "</td>";
      text += "<td>" + terms[i].SS.toFixed(5).toString() + "</td>";
      text += "<td>" + terms[i].df.toString() + "</td>";
      if( terms[i].name != "Total" ) {
        text += "<td>" + terms[i].MS.toFixed(5).toString() + "</td>";
      } else {
        text += "<td></td>";  
      } 
      let nm = terms[i].against;
      if( ( i < (terms.length - 2 ) ) && ( nm != -1 ) ) {
        text += "<td>" + terms[i].F.toFixed(5).toString() +"</td>";
        let prob = "";
        if ( terms[i].P > rejection_level ) prob = terms[i].P.toFixed(5).toString();
        else prob = "<b><i>" + terms[i].P.toFixed(5).toString() + "</i></b>";     
        text += "<td>" + prob + "</td>";
        text += "<td>" + terms[nm].name + "</td>";
      } else {
        text += "<td></td>";
        text += "<td></td>";
        if ( nm == -1) text += "<td><b>No Test</b></td>";
        else text += "<td></td>";
      }  
      text += "</tr>";
    }
    text += '</tbody></table></div>';
    
    text += '<div class="ct"><p>Rejection criteria (&alpha;):</p>'+
             '<p><input type="number" id="anova_alpha" value="' +
             rejection_level.toString() + 
             '" min="0.00000" max="0.999999" step="0.1" onchange="anova.setAlpha()"/></p>' +
             '</div>';

    /*
     * Update contents of 'display' tab (ANOVA results)
     */
    
    let d = document.getElementById('analysis');
    d.innerHTML = text; 
    
    /*
     * Select ANOVA results tab ('analysis') using ui function 'select
     * hidding all other tabs
     */
    
    selectTab('analysis');
        
  }  


  /*************************************************************************/
  /*                                                                       */
  /*         Compute a list of a posteriori muliple comparisons            */
  /*                                                                       */  
  /* Check for terms that display significant F-statistics (differences    */
  /* between averages of a fixed factor). For the sake of simplicity       */
  /* restrict a posteriori tests to terms denoting up to second order      */
  /* interactions (that is, involving trhee factors). The list is called   */
  /* 'mcomps' and will be fed to a function that actually preforms         */
  /* a posteriori multiple comparison tests                                */
  /*                                                                       */
  /*************************************************************************/
   
  function buildMultipleComparisons() {
    
    //console.log(terms)
      
    mcomps = [];
     
    /*
     * Iterate through all 'terms' that are not the Residual (Error) or 
     * the Total terms (these two are easily identified because their 
     * attribute 'nlevels' = 0 and are in the end of the list of terms) 
     */ 
       
    for(let t = 0, tln = terms.length; t < tln; t++ ) {
      
      /*
       * Consider only those terms which have an F probability smaller than 
       * the rejection level specified (usually 0.05). Also, ignore 
       * interactions with more than three factors for simplicity 
       * (terms with 'order' > 3).  
       */
        
      if( ( terms[t].P < rejection_level ) && ( terms[t].nlevels > 0 ) && 
          ( terms[t].order < 4 ) && ( terms[t].against !== -1 ) ) {
        
        /*
         * Consider only fixed factors or interactions containing fixed 
         * factors. Multiple tests are useless for random factors. Go along 
         * the array 'terms[].codes' for the current term (ignoring the last 
         * element which stands for the Error component) and annotate any 
         * factor involved ('codes[] == 1) which is of type "fixed". This 
         * will be called the target factor. All candidate comparisons will
         * be stored in 'mcomps', an array of JSON objects that will hold
         * all the necessary information for processin an a_posteriori 
         * multiple test
         */

        for (let i = 0, fl = factors.length; i < fl; i++ ) {
            
          if ( ( terms[t].codes[i] === 1 ) && (factors[i].type === FIXED ) ) {
              
            //console.log(t.toString() + " " + terms[t].name + ": " + factors[i].name );  
            //console.log(terms[t]);
            
            /*
             * Identify the target factor for which we want to perform 
             * multiple comparisons. Append the target factor to a list
             * to be provided to multiple comparison tests. For this, build
             * a JSON object ('tgt') that will hold all the information 
             * necessary for the multiple test procedures for a given 
             * target factor, be it a main factor or an interaction.
             * This will be appended to the 'mcomps' list
             * 
             * tgt = {
             *   fcode      : i,
             *   fname      : factors[i].name
             *   term       : term name
             *   averages   : [], 
             *   levels     : [],
             *   n          : [],
             *   df_against : 0,
             *   ms_against : 0,
             * } 
             * 
             * Note that 'tgt.factor' holds the code of the factor being
             * analyzed (i). 
             */
                
            let tgt = { fcode: i };
            
            /*
             * From this, we compute the real name of factor 'i'
             * and store it into 'tgt.name'. 
             */
            
            tgt.fname = factors[i].name;
            
            /*
             * Store the term's name for future reference. 
             */
            
            tgt.term = terms[t].name;
            
            /* 
             * For some multiple tests the 'df' and the 'MS' of the term 
             * used in the denominator of the F test for this particular 
             * term ('term[t].against') is needed, so we pass it through 
             * 'df_against' and 'ms_against'.
             */
           
            tgt.df_against = terms[terms[t].against].df;
            tgt.ms_against = terms[terms[t].against].MS; 

            /*
             * Now a list of averages to perform multiple comparisons is 
             * necessary. These averages are the averages of the levels of 
             * the 'tgt' factor. They will be passed in an array containing 
             * the level 'name' (not its 'code'), the number of replicates 
             * used to compute the average of each level, and the corresponding 
             * variance. This is easy if the 'term' being considered (t) 
             * corresponds to a main factor ('term[t].order' == 1) as all 
             * necessary values are stored in 'terms' array ('average', 'n', 
             * 'sumx', 'sumx2', etc). 
             */
            
            tgt.averages = [];

            if( terms[t].order === 1 ) {
                
              tgt.type = 'factor';
              
              tgt.averages[tgt.term] = [];
              
              /*
               * Go along all levels
               */
              
              for (let j = 0, jl = terms[t].average.length; j < jl; j++) {
                
                /*
                 * Translate level name. Levels are stored as a string separated
                 * by ','. Transform the string into an array splitting by ','.
                 */
                
                let lv = terms[t].levels[j].split(',')[i];
 
                /*
                 * The levels of the factor being considered ('i') are in the 
                 * 'i'th position on the array.
                 */
                                
                let ln = factors[i].levels[lv];
                
                /*
                 * Get the 'average' and 'n' for this level
                 */
                
                let avg = terms[t].average[j];
                let n = terms[t].n[j];
                
                /*
                 * Compute Standard Deviation for later calculation
                 * of standard error
                 */
                
                let std = 0;
                if( n > 1 ) std = (terms[t].sumx2[j] - Math.pow(terms[t].sumx[j],2)/n)/(n-1);
                
                /*
                 * Update the list of averages
                 */
                
                tgt.averages[tgt.term].push({level: ln, average: avg, n: n, std: std}); 
              }
              
              /*
               * Reorder list of averages, from smallest to largest
               */
              
              tgt.averages[tgt.term].sort((a, b) => (a.average > b.average)? 1 : -1);
              
              /*
               * Push new target to the list of 'mcomps' for multiple
               * comparisons
               */
              
              mcomps.push(tgt);

            } else {
              
              /*
               * If the 'terms[t]' where the target factor is contained also 
               * contains other factors, it's because it is an interaction term.
               * The computation of differences between averages is a little 
               * bit more complicated, as it should be done independently for
               * all combinations of the levels of the factors involved in
               * the interaction with the exception of the target term. 
               */
              
              tgt.type = 'interaction';
              

              for ( let j = 0, jl = terms[t].levels.length; j < jl; j++ ) {

                let levs = terms[t].levels[j].split(',');
                
                /*
                 * Translate level name. Levels are stored as a string separated
                 * by ','. Transform the string into an array splitting by ','.
                 * The code for the current level of the target factor is in 
                 * slot 'i'.
                 */
                
                let lv = levs[i];
                
                let ln = factors[i].levels[lv];
                
                
                for(let k = 0, kl = factors.length; k < kl; k++) {
                  if ( ( terms[t].codes[k] != 1 ) || (k == i) ) levs[k] = "-";
                }
                
                /*
                 * Get the 'average' and 'n' for this level
                 */
                
                let avg = terms[t].average[j];
                let n = terms[t].n[j];
                
                /*
                 * Compute Standard Deviation for later calculation
                 * of standard error
                 */
                
                let std = 0;
                if( n > 1 ) std = (terms[t].sumx2[j] - Math.pow(terms[t].sumx[j],2)/n)/(n-1);
                
                /*
                 * Stringify the 'codes' array which will be used as a key
                 * of an associative map for all combinations of levels 
                 * excluding the target factor
                 */
                
                let codes = levs.join();
                
                let c = tgt.averages.hasOwnProperty(codes) ? tgt.averages[codes] : -1;  
                if ( c == -1 )  tgt.averages[codes] = []; 
                tgt.averages[codes].push({level: ln, average: avg, n: n, std: std}); 
                
                /*
                 * Reorder list of averages, from smallest to largest
                 */
              
                tgt.averages[codes].sort((a, b) => (a.average > b.average)? 1 : -1);
              }    
              mcomps.push(tgt);             
            }
          }  
        }  
      }  
    }
    
    // We have scanned all terms. 'target' has a list of all possible
    // comparisons!
    
    //console.log('mcomps: ',mcomps);
    
    
  }
  
  /*************************************************************************/
  /*                                                                       */
  /*                            displayPartials                            */
  /*                                                                       */
  /* This function displays a table with the list of 'partials'. Each      */
  /* partial represents a unique combination between levels of every factor*/
  /* present, and contains the accummulated sums of all observations       */
  /* ('sumx'), and sums of all squared observations ('sumx2)               */
  /*                                                                       */     
  /*************************************************************************/ 
  
 
  /*************************************************************************/
  /*                                                                       */
  /*                        correctTermNames                               */
  /*                                                                       */
  /* After correcting for nesting, by pooling terms with similar           */
  /* uncorrected sums of squares ('ss'), the names of the terms should be  */
  /* changed to denote the nesting hierarchy. A term X nested into a term  */
  /* Y should be named X(Y). A term X nested into an interaction of terms  */
  /* Y and Z should be named X(Y*Z). After correcting the names the dfs    */
  /* of nested factors or interactions involving them should also be       */ 
  /* corrected.                                                            */ 
  /*                                                                       */ 
  /*************************************************************************/ 
  
  function correctTermNames() {
      
    /*
     * For factors that are nested into others, correct the nesting depth 
     * (number of factors where it is nested into, i.e. number of 'nestedin' 
     * codes equal to one (1)). Take this opportunity to correct the levels 
     * of nested factors. Usually the number of levels as computed from the 
     * data file is much larger than the actual number of levels, and is 
     * computed by dividing the observed levels by the number of levels of 
     * factors where the nested factor is nested into. 
     */
    
    for ( let i = 0; i < nfactors; i++ ) {
      for ( let j = 0; j < nfactors; j++ ) {
        if( factors[i].nestedin[j] == 1 ) {
          factors[i].depth++;
          factors[i].nlevels /= factors[j].nlevels;  
        }
      }
    }    
    
    /*
     * Now, correct the names of the factors according to the nesting hierarchy. 
     * To do this we need to build a list of terms ordered by their nesting depth 
     * (i.e. how many factors/interactions are they nested in) in ascending order
     * (lower depths first). This is necessary because we cannot mess with the 
     * order of the 'factors' and 'terms' arrays: the first factor in array 
     * 'factors' (index 0) should correspond to the first term in array 'terms'
     * (with a similar index of 0), and so on. The list will only contain terms
     * which are nested into others
     */
    
    let nfl = [];
    
    for (let i = 0; i < nfactors; i++) {
      let nested = factors[i].depth; 
      if ( nested > 0 ) {
        let f = {};
        f.index = i;
        f.codes = factors[i].nestedin;
        f.depth = factors[i].depth;
        f.name = factors[i].name;
        nfl.push(f);
      }  
    }
    
    /*
     * Sort nested factors from lowest nesting depths to highest nesting depths
     */
    
    nfl.sort(function(a,b){return a.depth - b.depth; });
    
    
    /*
     * Eliminate redundant codes, i.e. those that are associated
     * with a factor which is already nested into another. As an
     * example consider the following 4 factor ANOVA in which 
     * factor B is nested in A, and factor C ins nested in A and B
     *
     * i  Factor nestedin   depth
     * 0  A      [0,0,0,0]  0 
     * 1  B      [1,0,0,0]  1
     * 2  C      [1,1,0,0]  2
     * 3  D      [0,0,0,0]  0
     * 
     * For factor C, nesting in A is redundant because B (in which
     * it nested) is itself nested in A. The 'nestdin' for C should
     * be [0,1,0,0]. Why? Because the name for B will be replaced
     * by B(A) (its depth is 1, so this is done before renaming C,
     * which depth is 2). Now when we replace factor names in C, 
     * there is only one to be replaced (B) and the term will be
     * named C(B(A))
     *
     * Now, suppose now that C is nested in the interaction A*B instead
     * (hence B would not be nested in A, since nested factors do not
     * created interactions with the factors where they are nested in).
     * The codes would be
     *
     * i  Factor nestedin   depth
     * 0  A      [0,0,0,0]  0 
     * 1  B      [0,0,0,0]  0
     * 2  C      [1,1,0,0]  2
     * 3  D      [0,0,0,0]  0    
     *
     * There are no redundancies in this set, and the name of C would
     * become C(A*B)
     */
    
    for (let i = 0, len = nfl.length; i < len; i++) {
      
      /*
       * No need to check for redundancies in factors that
       * are nested into a single one  
       */
      
      if(nfl[i].depth > 1) { 
        for (let j = 0, len = nfl.length; j < len; j++) {
          if ( ( i != j ) && ( nfl[j].depth < nfl[i].depth ) ) { 
            for (let k = 0; k < nfactors; k++ ) {
              if ( ( nfl[i].codes[k] == 1 ) && ( nfl[j].codes[k] == 1 ) ) {
                let f = nfl[j].index;
                if (nfl[i].codes[f] == 1) nfl[i].codes[k] = 0; 
              } 
            }  
          }  
        }
        let nm = [];
        let j = nfl[i].index;
        for (let k = 0; k < nfactors; k++ ) {
          if( nfl[i].codes[k] == 1 ) nm.push(factors[k].name);  
        }
        factors[j].name += "(" + nm.join("*") + ")";
      } else {
        let j = nfl[i].codes.indexOf(1);
        let k = nfl[i].index;
        if ( j != -1 ) factors[k].name += "(" + factors[j].name + ")";   
      }  
    }
   
    /*
     * Finally, replace the new names in all terms. Note that the two 
     * last terms are the Error and the Total, so skip them!
     */
    
    for (let i = 0, len = terms.length - 2; i < len; i++) {
      let nm = [];
      for ( let j = 0; j < nfactors; j++) {
        if (terms[i].codes[j] == 1 ) {
          nm.push(factors[j].name);   
        } 
      }
      terms[i].name = nm.join("*");
    }
    
    //console.table(terms);
  }
  

  /*************************************************************************/
  /*                                                                       */
  /*                            displayAverages                            */
  /*                                                                       */
  /* This function displays a small table with the summary of the averages */
  /* for each term in the ANOVA. This information may be useful to graph   */
  /* data further on or simply to check if the analysis has ben correctly  */
  /* done.                                                                 */
  /*                                                                       */
  /*************************************************************************/ 
  
  function displayAverages() {
        
    let d = document.getElementById('averages'); 
    
    // Create the table as a whole text bunch of HTML to avoid
    // multiple calls to the DOM structure
  
    let table = '';
    
    for(let i = 0, len = terms.length - 2; i < len; i++ ) {
       
      table += '<h3>Averages for ' + terms[i].name + '</h3>'; 
      
      table += '<table><thead><tr>';
      
      let cds = [...terms[i].codes];
      for(let j = 0, jlen = cds.length; j < jlen; j++ ) {
        if( cds[j] != 1 ) cds[j] = '-'; 
        else table += '<th>' + factors[j].name + '</th>';
      }  
      
      table += '<th>Average</th><th>n</th><th>St. Dev.</th><th>Variance</th></tr></thead><tbody>'; 
      
      for(let j = 0, jlen = terms[i].average.length; j < jlen; j++ ) { 
        table += '<tr>';  
        let levs = terms[i].levels[j].split(',');
        for(let k = 0, klen = levs.length; k < klen; k++ ) {
          if( cds[k] == 1 ) {
            table += '<td>' + factors[k].levels[levs[k]] + '</td>'; 
          }  
        }
        table += '<td>' + terms[i].average[j].toString() + '</td>';
        let n = parseInt(terms[i].n[j]);
        table += '<td>' + n.toString() + '</td>';
        
        let std = 0, variance = 0;
        if( n > 1 ) variance = (terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/n)/(n-1);
        std = Math.sqrt(variance,2);
        
        table += '<td>' + std.toString() + '</td>';
        table += '<td>' + variance.toString() + '</td>';
        table += '</tr>'; 
      } 
      table += '</tbody></table>';
    }
    d.innerHTML = table;
  }
  /*************************************************************************/
  /*                                                                       */
  /*                            displayAverages                            */
  /*                                                                       */
  /* This function displays a small table with the summary of the averages */
  /* for each term in the ANOVA. This information may be useful to graph   */
  /*                                                                       */
  /*************************************************************************/ 
  
  function displayMultipleComparisons() {
        
    let d = document.getElementById('mtests'); 
    
    // Create the text as a whole bunch of HTML to avoid
    // multiple calls to the DOM structure
    
    /*
     * Provide two <divs>: one for selecting the type of test and the other
     * to display the results of the multiple tests, identified by the
     * id = 'mtest_results', but invisible (style="display:none") for now. 
     */
    
    let text = '<div class="ct">' +
            '<h3>Multiple Comparison Tests</h3>' +
            '<p><input type="radio" name="test" value="none" checked>None</p>' +
            '<p><input type="radio" name="test" value="snk">Student-Newman-Keuls (SNK)</p>' +
            '<p><input type="radio" name="test" value="tukey">Tukey (HSD)</p>' +
            '<p>Rejection criteria (&alpha;): <input type="number" id="mtests_alpha" value="' +
             mt_rejection_level.toString() + 
             '" min="0.00000" max="0.999999" step="0.01" onchange="anova.setMtAlpha()"/></p>' +
             '<p><button onclick="anova.multipleTests()">Compute</button></p>' +
            '</div>' +
            '<div class="ct" id="mtest_results" style="display: none;"></div>';
    
    d.innerHTML = text;
  }
  
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
        for( let i = 0, len = lines.length; i < len; i++ ) {
            
          // Trim the line 
            
          let li = lines[i].trim();
          
          /*
           * Check if the line is commented (starts with '#') or if
           * it is an empty line. If so, ignore it!
           */
          
          if( ( li[0]!=='#' ) && ( li.length !== 0 ) ) {
              
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
               * named 'DATA' and should be the last column
               */
              
              nfactors = li.length - 1;
              
              for( let j = 0, k = li.length - 1; j < k; j++ ) {
                factors[j] = {};
                let name = li[j];
                
                /*
                 * Factor names ending in '*' are of type 'RANDOM',
                 * otherwise they are of type 'FIXED'
                 */
                
                if( name.endsWith( "*" ) ) {
                  factors[j].type = RANDOM;
                  name = name.slice( 0, name.length-1 );
                } else {
                  factors[j].type = FIXED;
                }
                factors[j].name = name;
                factors[j].orig_name = name;
                factors[j].nlevels = 0;
                factors[j].levels = [];
                factors[j].nestedin = new Array( nfactors ).fill(0);
                factors[j].depth = 0;
                
                /*
                 * Compute the subscript for the current factor
                 * starting in 'i' (the first factor) which has
                 * ASCII charcode 105. This will be needed in 
                 * the CT Rules procedure later on...
                 */
                
                factors[j].subscript = String.fromCharCode( j + 105 );
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
                
                let p = factors[j].levels.indexOf( li[j] );
                
                /*
                 * indexOf return -1 if the argument is not in the array
                 */
                
                if(p == -1 ) {
                  factors[j].levels.push( li[j] );
                  factors[j].nlevels++;   
                }
                
                /*
                 * Add this level to data's new observation 'd'
                 */
                
                d.levels.push( li[j] );
              }
              
              /*
               * Read the data value. It should be the last column
               * of the line, which is equivalent 'li[nfactors]' 
               * because array indexes start on 0!
               */
              
              let n = +li[nfactors].replace( ",", "." );
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
        
        /*
         * Enable all anova tabs as a file was successfully read
         */
        
        let elem = document.getElementsByClassName("tabcontent");
        for ( let i = 0, len = elem.length; i < len; i++ ) elem[i].innerHTML="";
        
        
        displayData();
        
        /*
         * Start the ANOVA by computing 'partials' 
         */
        
        computePartials(); 
        
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
   
  /*************************************************************************/
  /*                                                                       */
  /*                        correctForNesting                              */
  /*                                                                       */
  /* A factor can be nested in another factor or in an interaction of two  */
  /* or more factors. This function checks if the uncorrected sums of      */
  /* squares of a pair of terms is the same. In this case, if one of the   */
  /* terms denote a single factor (the other denoting an interaction where */
  /* this factor is involved) it means that the single factor is nested    */
  /* into any other factor participating in the interaction. If the        */
  /* interaction is of first order (two factors involved) the nesting      */
  /* factor is mandatorily the one which is not designated by the term     */
  /* that denotes a single factor. For complex designs, for example, those */
  /* with factors nested into interactions, the process is more tricky.    */
  /* See detail within the function.                                       */
  /*                                                                       */ 
  /*************************************************************************/ 
  
  function correctForNesting() {
    
    /* 
     * No need to check for nesting if there is only one factor,
     * or if there is no hint on nested factors ('nested' == false). 
     * The latter is determined in the 'getPartialSS' function
     * by comparing the observed number of levels of each term
     * with the expected number of levels given a simple fully
     * orthogonal analysis.
     */  
    
    if( ( nfactors == 1 ) || (!nesting) ) return;
    
    /*
     * Start by denoting the current term by 'current'    
     */
    
    let current = 0; 
    
    /*
     * Skip the two last terms, the "Total" and the "Error" terms!
     */
    
    while(current < terms.length - 2) {
      
      /*
       * Denote the term being compared (target) by 'c'
       */
      
      let c = current + 1;
      
      /*
       * Skip the two last terms, the "Total" and the "Error" terms!
       */
      
      while (c < terms.length - 2) {
          
        // console.log("Comparing " + current.toString() + " with " + c.toString());
          
        if( terms[current].ss == terms[c].ss ) {
            
          /*
           * If the uncorrected sums of squares are similar the 'current' term is 
           * nested into a term involved in term 'c' (which is mandatorly an 
           * interaction in a fully orthogonal analysis). Now compare the two
           * terms to find out if the 'current' is nested in another factor or 
           * within an interaction of factors. 
           */
          
          for ( let k = 0; k < nfactors; k++ ) {
            if ( ( terms[c].codes[k] != terms[current].codes[k] ) ) {
                
              /*
               * In the current term, we set the code's column 'k' to 2 (two) 
               * to denote that factor 'k' nests a factor involved in this term. 
               * Thre may be multiple 'k's if the 'current' term involves a factor 
               * nested in an interaction between two or more factors. This notation
               * will come in handy to compute Cornfield-Tukey Rules later on
               */
              
              terms[current].codes[k] = 2;
              
              /*
               * If the 'current' term denotes a main factor ('order' == 1), having 
               * another term measuring the same amount of variation (uncorrected 'ss')
               * means that the former is a nested factor. Its 'type' should be changed 
               * to 'random', and the list of terms where it is nested in should be
               * updated.
               */
              
              if ( terms[current].order == 1 ) {
                  
                //console.log(current.toString() + ' is nested in ' + k.toString());  
                  
                factors[current].nestedin[k] = 1;
                factors[current].type = RANDOM;
                
                /*
                 * correcting levels of this term will be done later during 
                 * the correction of term's names
                 */
                
              }   
            }
          }
          
          /*
           * Accummulate the corrected sums of squares ('SS'). Use the 'averages', 
           * 'levels', 'sumx', and 'sumx2' of the higher order term, and then 
           * delete it from the list of terms
           */
          
          terms[current].SS += terms[c].SS;
          terms[current].averages = terms[c].averages;
          terms[current].sumx = terms[c].sumx;
          terms[current].sumx2 = terms[c].sumx2;
          terms[current].levels = terms[c].levels;
          terms[current].nlevels = terms[c].nlevels;
          terms[current].combins = terms[c].combins;
          
          /*
           * Remove the redundant term
           */
          
          terms.splice(c, 1);  
             
          //console.log("Removing "+ c.toString());  
          
        } else {
          
          /*
           * We only increment 'c' if no term was deleted from
           * the list. If there was a deletion, the next term
           * in the list (if any) will occupy the position of
           * the deleted term
           */
          
          c++;            
        }
      } 
      current++;  
    }
    
    
    correctTermNames();

    /*
     * Finally, correct the degrees of freedom of each term. 
     * Skip the two last terms, the "total" and the "Error" term!
     */
     
    for (let i = 0, tl = terms.length - 2; i < tl; i++) {
      terms[i].df = 1;
      for (let k = 0; k < nfactors; k++) {
        if( terms[i].codes[k] == 1 ) terms[i].df *= factors[k].nlevels - 1;
        if( terms[i].codes[k] == 2 ) terms[i].df *= factors[k].nlevels;   
      }  
      terms[i].MS = terms[i].SS/terms[i].df;
    }
    
  }
  
  
  /*************************************************************************/
  /*                                                                       */
  /*                            computePartials                            */
  /*                                                                       */
  /* For each data point (observation) read its corresponding value and    */
  /* factor levels and recode the latter into integers, replacing the      */
  /* original label by its corresponding index in 'factors[i].levels'      */
  /* array. The first factor level for any factor will be always 0 (zero), */
  /* the second will be 1, and so on. Take the following example of the    */
  /* first data points of a three factor analysis (two replicates per      */
  /* combination of factors)                                               */
  /*                                                                       */
  /*  Site Type  Light DATA                                                */
  /*  A    B     day   23                                                  */
  /*  A    B     day   21                                                  */
  /*  A    B     night 12                                                  */
  /*  A    B     night 16                                                  */
  /*  A    C     day   13                                                  */
  /*  A    C     day   11                                                  */
  /* ...                                                                   */
  /*                                                                       */
  /* The data array will be coded as                                       */
  /*                                                                       */ 
  /*  [0, 0, 0] 23                                                         */
  /*  [0, 0, 0] 21                                                         */
  /*  [0, 0, 1] 12                                                         */
  /*  [0, 0, 1] 16                                                         */
  /*  [0, 1, 0] 13                                                         */
  /*  [0, 1, 0] 11                                                         */
  /* ...                                                                   */
  /*                                                                       */
  /* For factor 'Site' level 'A' of 'Site' is coded as 0 (no more levels   */
  /* in the example). For factor 'Type', level 'B' is coded as 0 and level */
  /* 'C' is coded as 1. For factor 'Light', level 'day' is coded as 0 and  */
  /* level 'night' is coded as 1                                           */
  /*                                                                       */
  /* During this stage a list of 'partials' is built. A 'partial' is a     */
  /* unique combination of level codes. All data observations that have a  */
  /* similar combination of codes are accummulated into two quantities for */
  /* their corresponding partial: 'sumx' for the sum of observations, and  */
  /* 'sumx2', for the sum of squared observations, and 'n' for the number  */
  /* observations of the partial. For the example above, the corresponding */
  /* list of partials would be                                             */
  /*                                                                       */
  /* {[0, 0, 0], 44, 970, 2},                                              */
  /* {[0, 0, 1], 28, 400, 2},                                              */
  /* {[0, 1, 0], 24, 290, 2},                                              */
  /* ...                                                                   */
  /*                                                                       */
  /*************************************************************************/ 
  
  function computePartials() {
      
    /*
     * To determine if an observation with a particular combination of factor 
     * level codes belongs to an already created partial, we have to compare 
     * two arrays: the codes of the partials against the codes of the data 
     * observation. This is easier to do with strings than iterating through 
     * the two arrays. Hence, an associative array (hash) with the codes of 
     * the 'partials' as keys and the key of the partial in the 'partials'
     * list as a value is built.
     */
    
    let partials_hash = [];
    
    /*
     * Use 'maxn' to estimate the maximum number of replicates per partial. 
     * In a balanced data set, all 'partials' will have the same number of
     * replicates. This variable will allow us to replace missing data in 
     * a given partial by adding as many averages as necessary to complete
     * 'maxn' replicates
     */
    
    let maxn = 0;
    
    /*
     * Now, go along all data aobservations (points) and accummulate the 
     * values in their respective 'partials' or create new 'partials' as 
     * needed
     */
    
    for(let i = 0, ds = data.length; i < ds; i++ ) {
        
      /*
       * Translate the original data level code into the numeric 
       * level code stored previously in 'factors[].levels'
       */
      
      let codes = [];
      
      for(let j = 0, len = data[i].levels.length; j < len; j++ ) {
        let l = data[i].levels[j];
        let k = factors[j].levels.indexOf(l);
        codes[j] = k;
      }  
      
      /*
       * Build the object to store this specific 'partial's information
       */
      
      let p = {};
      
      p.codes  = codes;
      p.sumx   = data[i].value;
      p.sumx2  = Math.pow(data[i].value,2);
      p.n      = 1;
      p.n_orig = 1;
      
      /*
       * If list of 'partials' is empty add a new term
       */
      
      if( partials.length == 0 ) {
          
        /*
         * Method 'push' returns the new array length so use this 
         * information and subtract 1 to store the index of the 
         * newly created partial in the hash array value!  
         */
        
        partials_hash[codes] = partials.push(p) - 1;
        
      } else {
          
        /*
         * Search if this particular combination of levels is already 
         * in 'partials'
         */
        
        let v = partials_hash.hasOwnProperty(codes) ? partials_hash[codes] : -1;
        if( v != -1 ) {
            
          /*
           * A partial with these codes is already in the list. Accummulate 
           * values ('sumx', 'sumx2') and increase replicates ('n')
           */
          
          partials[v].sumx+= p.sumx;
          partials[v].sumx2+= p.sumx2;
          partials[v].n++;
          
          /*
           * Update the maximum number of replicates per combination of factors 
           * (ANOVA cells), if the 'n' for this 'partial' is greater than 'maxn'. 
           */
          
          if( partials[v].n > maxn ) maxn = partials[v].n;
          
        } else {
            
          /*
           * A partial with these codes is not yet in the list of partials, so 
           * create a new one. See above why -1 is used ( partials.length == 0 ) 
           */
          
          partials_hash[codes] = partials.push(p) - 1;
          
        }  
      }
    }
    
    /*
     * Go along all partials and verify that each has a similar number of 
     * replicates ('partials[i].n' should equal 'maxn'). If not, replace 
     * missing values with the average of the partial 
     * (partials[i].sumx/partials[i].n) and increment 'correted_df' to later 
     * decrease the degrees of freedom of the 'Error' (or 'Residual') and 
     * the 'Total' terms of the ANOVA
     */
    
    for(let i = 0, tl = partials.length; i < tl; i++ ) {
      partials[i].n_orig = partials[i].n;
      if( partials[i].n < maxn ) {
        let average = partials[i].sumx/partials[i].n;
        let n = maxn - partials[i].n;
        for( let j = 0; j < n; j++) {
          corrected_df++;
          partials[i].sumx += average;
          partials[i].sumx2 += Math.pow(average,2);
          partials[i].n++;
        }  
      }  
    } 
    
    /* 
     * After rebalancing the data, compute Residual and Total sums of squares 
     * and their respective degrees of freedom. Compute also the squared 
     * differences between observations and their averages for each partial 
     * using the equation:
     * 
     *   SUM(X_i - X_bar)^2 = SUM(X_i^2) - (SUM(X_i))^2/n
     * 
     * where X_i is a particular observation and X_bar is the average for 
     * the set
     */
    
    let tsumx = 0, tsumx2 = 0, tn = 0;
    
    for(let i = 0, tl = partials.length; i < tl; i++ ) {
      partials[i].ss = partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n; 
      residual.df += partials[i].n-1;
      residual.ss += partials[i].ss;
      total.df += partials[i].n;
      tsumx += partials[i].sumx;
      tsumx2 += partials[i].sumx2;
      tn += partials[i].n;
    }
    total.df -= 1;
    total.ss = tsumx2 - Math.pow(tsumx,2)/tn;
    residual.orig_df = residual.df;
    residual.df -= corrected_df;
    total.orig_df = total.df;
    total.df -= corrected_df;
     
    /*
     * The number of replicates can now be taken from any partial 
     * because rebalancing was performed earlier
     */
    
    replicates = partials[0].n;
    
    
    /*
     * It's time to compute homogeneity tests for this data set
     * because most depend only on having information of averages and
     * variances for all possible combinations of levels of all factors
     * involved in the analysis. The 'partials' list has exactly that
     * information!
     */
    
    homogeneityTests();
    
    /*
     * Compute the terms of the linear model
     */
    
    buildTerms(); 

  }
  

  /*************************************************************************/
  /*                                                                       */
  /*                            displayTerms                               */
  /*                                                                       */
  /* This function displays all ANOVA terms and their corresponding        */       
  /* information (SS, DFs, levels, etc.)                                   */
  /*                                                                       */
  /*************************************************************************/   
  
  /*************************************************************************/
  /*                                                                       */
  /*                            displayData                                */
  /*                                                                       */
  /* This function displays all data in a form of a table                  */
  /*                                                                       */
  /*************************************************************************/ 

  function displayData() {
    
    let tb = document.getElementById("data");
    
    // Panel to transform data

    let table = '<div class="ct">' +
        '<h3>Transformations</h3>'+
        '<p><input type="radio" name="transf" value="none" checked>None</p>' +
        '<p><input type="radio" name="transf" value="sqrt">&radic;X</p>' +
        '<p><input type="radio" name="transf" value="sqrt3">&#8731;X</p>' +
        '<p><input type="radio" name="transf" value="sqrt4">&#8732;X</p>' +
        '<p><input type="radio" name="transf" value="log">Log(X+1)</p>' +
        '<p><input type="radio" name="transf" value="ln">Ln(X+1)</p>' +
        '<p><input type="radio" name="transf" value="arcsin">arcsin(X)</p>' +
        '<p><input type="radio" name="transf" value="mult">X &times; <input type="number" id="multc" value="100"></p>' +
        '<p><input type="radio" name="transf" value="div">X &divide; <input type="number"  id="divc" value="100"></p>' +
        '<p><input type="radio" name="transf" value="pow">X&#8319; <input type="number"  id="powc" value="0.25"></p>' +
        '<p><button onclick="anova.transformData()">Apply</button></p>' +
        '<p><button onclick="anova.resetData()">Reset</button></p>' +
        '</div>';
        
    table += '<div class="ct">';
    
    // Build table header with factor names
    
    table += '<table><thead><tr>';
    for(let i = 0, nf = factors.length; i < nf; i++ ) {
      table += '<th>'+factors[i].name+'</th>';
    }  
    table += '<th>DATA</th></tr></thead><tbody>';
    
    // Now insert as much data points rows as needed
    
    for( let i = 0, len = data.length; i < len; i++ ) {
      table += '<tr>';
      for(let j = 0, nf = factors.length; j < nf; j++ ) {
        table += '<td>' + data[i].levels[j] + '</td>';
      }  
      table += '<td>'+data[i].value.toString()+'</td></tr>';
    }  
    table += '</tbody></table></div>';
    


    tb.innerHTML  = table;
  }
  
  /*************************************************************************/
  /*                                                                       */
  /*                            getPartialSS                               */
  /*                                                                       */
  /* This function computes uncorrected sums of squares (ss) and then      */
  /* transform these into corrected sums of squares (SS). The algorithm    */
  /* is complex but is explained inside!                                   */
  /*                                                                       */
  /*************************************************************************/ 
 
  function getPartialSS() {  
    
    /*     
     * We will use these two lengths a lot, so cache them
     */
    
    let tl = terms.length, pl = partials.length;
    
    /*
     * Now, go along all terms...
     */
    
    for( let i = 0; i < tl; i++ ) {
      
      /*
       * Extract the 'codes' for the current term. These are in the form 
       * of an array with ones (for each factor included) and zeros (for 
       * each factor excluded). Note that there is an additional code for 
       * the "Error" in the end which is always 0 except for the "Error" 
       * term itself. For a three-way ANOVA, [1,0,0,0], [0,1,0,0] and 
       * [0,0,1.0] correspond to main factors, [1,1,0,0], [1,0,1,0], and
       * [0,1,1,0] correspond to first order interactions, and [1,1,1,0] 
       * corresponds to the unique second order interaction.   
       */
      
      let c = terms[i].codes;
      
      /*
       * Compute the name of the 'term' by combining all names of included 
       * factors separated by '*'. 'nm' will hold the final name of the 
       * current term ('i')
       */
      
      let nm = [];
      
      for( let j = 0, l = c.length; j < l; j++ ) {
        if( c[j] == 1 ) nm.push( factors[j].name );
      }
      
      terms[i].name = nm.join('*');
      
      /*
       * For each term 'i' accummulate 'sumx', 'sumx2' and 'n' of for all 
       * different levels (or combinations of levels) of factors included 
       * in it. This is done by extracting from each 'partial' the 
       * information about the different level codes filtered by a variable
       * 't' which excludes all factors not included in the current term 'i'. 
       * 
       * Go along all 'partials'...
       */
      
      for( let j = 0; j < pl; j++ ) {
        
        /*
         * Read 'partials[].codes' but exclude information for factors 
         * not in term 'i'  
         */
        
        let t = [];
        
        for( let k = 0; k < nfactors; k++ ) {
          if( c[k] === 1 ) t.push( partials[j].codes[k] );
          else t.push( '-' );
        } 
        
        /*
         * Verify if the combination of 't' codes already exists in the 
         * 'terms[i].levels' array
         */
        
        let idx = terms[i].levels.indexOf( t.toString() );

        if( idx != -1 ) {
            
          /*
           * These combination of code levels is already in the 
           * 'terms[i].levels' array. Accumulate 'sumx', 'sumx2', 
           * and 'n' on the respective slot of the array ('idx')
           */
          
          terms[i].sumx[idx] += partials[j].sumx;
          terms[i].sumx2[idx] += partials[j].sumx2;
          terms[i].n[idx] += partials[j].n;
          
        } else { 
          
          /*
           * Else create a new combination of levels
           */
          
          terms[i].levels.push(t.toString());
          terms[i].sumx.push(partials[j].sumx);
          terms[i].sumx2.push(partials[j].sumx2);
          terms[i].n.push(partials[j].n);
          terms[i].nlevels++;
        }
      }
      
      /*
       * If there is nesting of factors inside other factors or within 
       * interactions, the number of levels of a term denoting an 
       * interaction will differ from the expected number of combinations 
       * computed using al the levels of the terms involved in such 
       * interaction. If so, we set variable 'nesting' to true. This will 
       * be later used to correct SS terms taking into account nesting, 
       * because in such a case some terms will be redundant, measuring
       * the same uncorrected sums of squares ('ss').
       */
      
      if( terms[i].nlevels != terms[i].combins ) nesting = true;
      
      /*
       * Change the name of the "Error" to "Residual" if there are
       * nested factors
       */
      
      if( nesting ) residual.name = "Residual";       
      
      /*
       * Now, for this particular term, check if the replicates ('n') for all 
       * levels or level combinations are similar. If not, the analysis is 
       * asymmetric and cannot be completed!
       */
      
      for( let j = 0, nl = ( terms[i].n.length - 1 ); j < nl; j++ ) {
        if( terms[i].n[j] != terms[i].n[j+1] ) {
          alert("Asymmetrical data set. Analysis stopped!"); 
          return false;
        }  
      }
      
      /*
       * Compute averages and uncorrected sums of squares (ss) for each 
       * combination of code levels.
       */
      
      for( let j = 0, nl = terms[i].nlevels; j < nl; j++ ) {
        terms[i].average[j] = terms[i].sumx[j]/terms[i].n[j];
        terms[i].ss += terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/terms[i].n[j];
      }
      
      /*
       * Now recompute corrected partial sums of squares (SS) for all terms 
       * by subtracting from the error term all partial 'ss' of terms 
       * (factors and interactions) involved in a given term. For example, 
       * consider the following three factor ANOVA list of partials, with
       * factors A, B, and C (note that the last column in codes corresponds 
       * to the "Error" term which is not a factor)
       * 
       *  residuals.ss = 100
       * 
       *  i     codes       ss
       * ------------------------
       *  0 [1, 0, 0, 0] {ss: 10}   // A
       *  1 [0, 1, 0, 0] {ss: 20}   // B
       *  2 [0, 0, 1, 0] {ss: 15}   // C
       *  3 [1, 1, 0, 0] {ss: 25}   // A*B
       *  4 [1, 0, 1, 0] {ss: 18}   // A*C
       *  5 [0, 1, 1, 0] {ss: 14}   // B*C
       *  6 [1, 1, 1, 0] {ss: 12}   // A*B*C
       *  7 [1, 1, 1, 1]            // Error term, 'ss' is in 'residual.ss'
       * 
       * The SS for 'B' ('codes' = [0,1,0,0] and 'i' = 1) is:
       * 
       * residual.ss - terms[1].ss => 100 - 20
       * 
       * For SS for interaction 'B*C' ('codes' = [0,1,1,0], 'i' = 5) is:
       * 
       * residual.ss - terms[1].SS - terms[2].SS - terms[5].ss => 100 - 20 - 15 - 14
       * 
       * and so on...
       * 
       * Note that for interactions we subtract the corrected sums of squares ('SS') 
       * of the terms above the current one, and finally subtract its own 'ss'. 
       * 
       * Note also, that because the array 'terms' is ordered by the 'terms[].order' 
       * of terms (first order terms - main factors - are first, second order terms  
       * - two-factor interactions - are next, and so on, one can compute the above 
       * formula for any current term because during its creation all other terms 
       * involved in its SS are already present in the list of terms! 
       */
      
      if( terms[i].order == 1 ) {
        terms[i].SS = total.ss - terms[i].ss;        
      } else {
          
        /*
         * This is an interaction (the order is higher than 1).
         * Remember that the codes for the current interaction term are 
         * already stored in vriable 'c' (which has at least two 1s). 
         * Now check for all terms inserted before this (current) if they 
         * have at least one of the factors involved in this term and have 
         * none of the factors not involved
         */
        
        let tSS = total.ss;
        for( let j = 0; j < i; j++ ) {
          let cj = terms[j].codes, cjl = c.length;
          let included = true;
          for( let k = 0; k < cjl; k++ ) 
            if( (cj[k] == 1) && (c[k] == 0) ) included = false;
          if( included ) tSS -= terms[j].SS;
        } 
        terms[i].SS = tSS - terms[i].ss;
      }   
    }   
    
    /*
     * Now insert two additional terms, the Error or Residual, 
     * and the Total, with their respective sums of squares and dfs
     */
    
    let te = { idx: tl, name: residual.name, codes: new Array(nfactors+1).fill(1), 
               order: terms[tl-1].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: residual.df,
               SS: residual.ss, ct_codes: new Array(nfactors+1).fill(1), 
               varcomp: [], MS: 0, P: 0, against: -2, F: 0 };
               
    terms.push(te);
    
    let tt = { idx: tl+1, name: "Total", codes: new Array(nfactors+1).fill(1), 
               order: terms[tl].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: total.df,
               SS: total.ss, ct_codes: [], varcomp: [], MS: 0, P: 0, against: -2,
               F: 0 };
               
    terms.push(tt);    
    
    
    return true;
  }   

  function testBartlett() {
      
    /*
     * Compute Bartlett's test   
     * 
     *           (N-k)*ln(s_p²) - Sum[(n_i-1)*ln(s_i²)]
     * X² =     ---------------------------------------
     *          1 + 1/(3*(k-1))*Sum[1/(n_i-1) - 1/(N-k)]
     * 
     * N    = Sum[n_i]
     * s_p² = Sum[(n_i-1)*s_i²]/(N-k)
     * k    = number of means being compared
     * n_i  = size for mean i (sample sizes should be similar: balanced analysis)
     * s_i² = variance of sample i
     * 
     * An easier way to do this, well explained at 
     * https://stattrek.com/online-calculator/bartletts-test.aspx
     * is as follows:
     * 
     *         A - B
     * X² = -----------
     *      1 + (C * D)
     * 
     * with 
     * 
     * A = (N-k)*ln(s_p²)
     * B = Sum[(n_i-1)*ln(s_i²)]
     * C = 1/(3*(k-1))
     * D = Sum[1/(n_i-1) - 1/(N-k)]
     * 
     * 
     */

    /*
     * k denotes the total number of averages involved in the test,
     * determind by all possible combinations between factor levels
     */
    
    let k = partials.length;
    
    /*
     * Compute N, the sum of all sample sizes. Since the present anova-web only
     * works with balanced  data sets, summing all n_i's is equivalent to
     * multyplying the number of replicates by the number of partials
     */
    
    let N = 0;
    for( let i = 0; i < partials.length; i++ ) N += partials[i].n;
    
    /*
     * Compute the pooled variance s_p² (pvar)
     */
    
    let pvar = 0;
    for( let i = 0; i < partials.length; i++ ){
      pvar += (partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n)/(N-k);
    }
    
    let A = (N-k)*Math.log(pvar);

    /*
     * Now compute B = Sum[(n_i-1)*ln(s_i²)]
     */
    
    let B = 0;
    for( let i = 0; i < partials.length; i++ ){
      B += (partials[i].n-1)*Math.log((partials[i].sumx2 - Math.pow(partials[i].sumx,2)/partials[i].n)/(partials[i].n-1));
    }    
    
    /*
     * Now compute C = 1/(3*(k-1))
     */
    
    let C = 1/(3*(k-1));
    
    /*
     * Now compute D = Sum[1/(n_i-1) - 1/(N-k)]
     */

    let D = 0;
    for( let i = 0; i < partials.length; i++ ){
      D += (1/(partials[i].n-1) - 1/(N-k));
    }
    
    /*
     * Now compute Bartlett's K value
     */
    
    let bartlett_k = (A - B)/(1 + (C*D));
    
    let prob = 1.0 - jStat.chisquare.cdf(bartlett_k, k-1);
    if( prob > 1 ) prob = 1;
    if( prob < 0 ) prob = 0;
     
    let result = "";
    result += "<p>Bartlett's Test for <b><i>k</i> = " + k.toString() + "</b> averages and <b>&nu; = ";
    result += (k-1).toString() + "</b> degrees of freedom: <b>" + bartlett_k.toString() + "</b></p>";
    result += "<p>P = <b>" + prob.toString() + "</b></p>"; 
    
//     result += "<p>N = " + N.toString() + " (N-k) = " + (N-k).toString() + " Pvar = " + pvar.toString() + "</p>"; 
//     result += "<p>A = " + A.toString() + "</p>"; 
//     result += "<p>B = " + B.toString() + "</p>"; 
//     result += "<p>C = " + C.toString() + "</p>"; 
//     result += "<p>D = " + D.toString() + "</p>"; 
    
 
    
    return result;
    
  }    
  
  function testCochran() {
      
    /*
     * Compute Cochran's C test which is a ratio between the largest sample 
     * variance over the sum of all sample variances. 'maxvar' will hold
     * the largest variance, whilst 'sumvar' will keep the sum of all 
     * variances
     */
    
    let maxvar = 0;
    let sumvar = 0;
    
    /*
     * k denotes the total number of averages involved in the test,
     * determind by all possible combinations between factor levels
     */
    
    let k = partials.length;
    
    /*
     * The corresponding degrees of freedom for each average (which should be 
     * equal for balanced analysis) are computed from 'replicates' - 1
     */
    
    let df = replicates - 1;
    
    /*
     * Find all variances, sum them all, find the largest and divide
     * by the sum of all variances. This is the Cochran's test
     */
    
    for( let i = 0; i < k; i++ ) {
      let v = partials[i].sumx2 - Math.pow( partials[i].sumx, 2 )/partials[i].n;
      v = v/( partials[i].n - 1 );
      if ( v > maxvar ) maxvar = v;
      sumvar += v;       
    }
    
    let cochran_C = maxvar/sumvar;
    
    /*
     * To compute the probabilty of obtaining a value of the C statistic larger
     * than the resulting C value we use the algorithm which was implemented in 
     * 'mwanova.cgi' which behaves quite well for most cases but produces some 
     * erroneous probabilities in marginal cases. For example, a C = 0.218533, 
     * with 8 means and 2 degrees of freedom (real case in '3-way.txt') produces 
     * a P = 1.42385557279749! According to Igor Baskir <baskir_At_univer.kharkov.ua> 
     * if the probability is larger than 1 one we must use the equation 
     * P = Math.abs( Math.ceil(P) - P ). However, this works when the F function
     * used in the algorithm below actually gives the right tail probability of F
     * ('fprob' in mwanova.cgi does that), but not when it gives the left tail 
     * probability as many functions do (jStat, excel's F.INV, libreoffice FINV, etc)
     * 
     * Apparently the equation  P = Math.abs( Math.floor(P) - P ) seems to hold
     * in many cases...
     */
    
    let prob = 0.0;
    if( ( cochran_C > 0 ) && ( k > 1 ) ) {
      prob = jStat.centralF.cdf(( 1/cochran_C -1 )/(k-1),((k-1)*df),df)*k;
      //console.log(prob, (1/c-1)/(k-1));
      if( prob > 1 ) prob = Math.abs( Math.floor(prob) - prob );
     }
    //let f = (1/c - 1.0)/(k - 1.0);
    //P = jStat.centralF.cdf(f, df * (k - 1.0), df) * k;

    let result = "";
    result += "<p>Cochran's Test for <b><i>k</i> = " + k.toString() + "</b> averages and <b>&nu; = ";
    result += df.toString() + "</b> degrees of freedom: <b>" + cochran_C.toString() + "</b></p>";
    result += "<p>P = <b>" + prob.toString() + "</b></p>";  
    
    /*
     * Because of the abovemention problems, and the fact that there is not 
     * a true CDF function for Cochran's C, we also provide critical values
     * for alpha = 0.1, 0.05 and 0.01 using the formula
     * 
     * C[alpha, df, K] = 1/[1 + (k-1)/(probF(1 - alpha/k, df, df*(k-1)))]
     * 
     * Note that we provide '1 - alpha/k' as first argument to the F inverse 
     * distribution instead of the 'alpha/k' seen in standard formulas because
     * jStat.centralF.inv will return the left tail probability of F instead 
     * of the required right tail probability
     */
    
    let cv10 = 0;
    let cv05 = 0;
    let cv01 = 0;
    
    cv10 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.10/k, df, df*(k-1))));
    cv05 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.05/k, df, df*(k-1))));
    cv01 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.01/k, df, df*(k-1))));
    
    result += "<p>Critical values for &alpha;</p>";
    result += "<p><i>0.10</i>: " + cv10.toString() + ", hence ";
    result += (cochran_C > cv10 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";
    result += "<p><i>0.05</i>: " + cv05.toString() + ", hence ";
    result += (cochran_C > cv05 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";
    result += "<p><i>0.01</i>: " + cv01.toString() + ", hence ";
    result += (cochran_C > cv01 ? "variances are heterogeneous":"variances are homogeneous");
    result += "</p>";

    return result;
    
  }

  /*************************************************************************/
  /*                                                                       */
  /*              Computation of homoscedasticity tests                    */
  /*                                                                       */
  /* Right now, only Cochran's C test is implemented.                      */ 
  /*                                                                       */  
  /*************************************************************************/  
 
  function homogeneityTests() {
      
    let d = document.getElementById('homogen');
    
    d.innerHTML = '<div class="ct">Cochran\'s test' + testCochran() + "</div>";
    
    d.innerHTML += '<div class="ct">Bartlett\'s test' + testBartlett() + "</div>";
    
  }
  
  /*************************************************************************/
  /*                                                                       */
  /*                            buildTerms                                 */
  /*                                                                       */
  /* This function builds the list of terms of any ANOVA with N factors.   */
  /* First it computes all possible combinations of factors as if a fully  */
  /* factorial ANOVA is being made. Then a check for nesting of factors    */
  /* is made and if any factor is found to be nested into another factor   */
  /* or into an interaction, a correction is made by accummulating the     */
  /* appropriate sums of squares, degrees of freedom, averages, levels,    */
  /* and factor name's notation, and removing the edundant term from the   */
  /* list                                                                  */
  /*                                                                       */ 
  /*************************************************************************/  

  function buildTerms() { 
        
            
    /*     
     * Construct a list of 'terms' (denoting either main factors or interactions) 
     * assuming that a fully orthogonal analysis is being done. The number of 
     * terms of any fully orthogonal design is given by 
     * 
     * 2^n 
     * 
     * where n is the number of factors involved 
     * 
     * Note that the formula includes the empty element {} and all possible 
     * combinations of factors ignoring their order. For example, for a 
     * set with three factors {A,B,C} the total number of terms is given by 
     * 
     * 2^3 = 8 
     * 
     * which are
     * 
     * {}, {A}, {B}, {C}, {AB}, {AC}, {BC}, {ABC} 
     * 
     * Note that {BA}, {CA}, {CB}, {ACB}, {BCA}, {BAC}, {CAB}, and {CBA}
     * are not included as the order does not matter
     */
 
    let s = Math.pow(2, nfactors);
    
    /*
     * Now create all combinations of factors, one in each iteration,
     * but exclude i = 0 which corresponds to the empty set {}
     */
    
    for( let i = 1; i < s; i++ ) {
        
      let temp = { idx: 0, name: "", codes: [], order: 0, combins: 1, nlevels: 0,
                   levels: [], sumx: [], sumx2: [], n: [], average: [], ss: 0,
                   df: 1, SS: 0, ct_codes: [], varcomp: [], MS: 0, P: 0, against: -1, 
                   F: 0 };
                   
      for( let j = 0; j < nfactors; j++ ) {
          
        /*
         * Unfortunately, we need an additional attribute 'idx' to keep the order of
         * creation of the terms. The order will be: 
         * idx : term
         * -----------
         * 0   : A 
         * 1   : B
         * 2   : A*B
         * 3   : C
         * 4   : A*C
         * ...
         * Note that the fourth term (idx = 3) is a main factor ('C'), but it is 
         * created after the interaction A*B. Later on, the list of terms of the ANOVA 
         * should be sorted according to the 'order' of terms (1 - for main factors, 
         * 2 - for 1st order interactions, 3 - for second order interactions, and so on). 
         * However, two terms may have the same 'order' (for example, both are first
         * order interactions, and their 'order' is 2). In these cases, we need to have 
         * a way to sort them according to the order they were created during the reading 
         * stage of data. This is particularly important for terms denoting the main 
         * factors. If their order differs from the the order in which main factors 
         * were created during the reading stage of data (see 'factors') problems will 
         * occur because the 'codes' property of 'terms' and 'partials' lists expects 
         * that the order of the main factors is the same as in the 'factors' array
         */
        
        temp.idx = i;  
        if( (i & Math.pow(2,j)) ) {
          temp.codes[j] = 1;
          temp.order++;
          temp.combins *= factors[j].nlevels;
        } else {
          temp.codes[j] = 0;
        }
        
        /*
         * Insert one more code for the "Error" to all terms
         */
        
        temp.codes.push(0);
      }
      terms.push(temp);
    }
    
    
    
    /*
     * Compute the 'partials' list, i.e., a list with all terms potentially
     * included in an ANOVA.
     */
    
    if( getPartialSS() ) {
        
      /*
       * Sort 'terms' by ascending 'terms[].order'. Note that if the terms 'order' 
       * is the same for two or more terms we resort to their 'idx' attribute to 
       * keep the correct order. This is only important for main factors 
       * (terms[].order == 1) because their order should be the same as for the 
       * 'factors[]' order 
       */
      
      terms.sort( function(a,b){return (a.order - b.order) || (a.idx - b.idx)} );
      
      /*
       * Recompute MSs and dfs for all terms. Do not do this for the "Error" and 
       * the "Total" because their SS and df are already computed.
       */
       
      for ( let i = 0, len = terms.length - 2; i < len; i++ ) {
        if( terms[i].order == 1 ) {
          terms[i].df = factors[i].nlevels - 1;
        } else {
          let m = 1;
          for ( let j = 0; j < nfactors; j++ ) {
            if ( terms[i].codes[j] > 0 ) m *= factors[j].nlevels - 1; 
          }  
          terms[i].df = m;
        }
        terms[i].MS = terms[i].SS/terms[i].df;
      } 
        
      /*
       * The df for the "Error" is already computed so we don't overwrite it. 
       * Instead we compute its MS
       */
      
      let e = terms.length - 2;
      terms[e].MS = terms[e].SS/terms[e].df;
      

      /*
       * Check if there are nested factors and correct the
       * ANOVA terms if necessary
       */
      
      correctForNesting();
      
      
      /*
       * Compute Cornfield-Tukey rules to determine
       * denominators for the F-tests
       */
      
      computeCTRules();
      
      
      /*
       * Display tables of averages per factor or combinations of factors
       */
      
      displayAverages();
      
      /*
       * Build the list of multiple comparisons, if any available
       */
      
      buildMultipleComparisons();
      
      /*
       * Display the tab with multiple comparisons if any is selected
       */
      
      displayMultipleComparisons();
        
      /*
       * Finally display the ANOVA table
       */
      
      displayANOVA();
    }  
  }

  
  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the anova object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
  
    setAlpha: setAlpha,   
    setMtAlpha: setMtAlpha,    
    open: openDataFile,
    resetData: resetData,
    transformData: transformData,
    multipleTests: multipleTests
    
  } // End of 'return' (exported function)
  
})();


/*
 * Function used to 'simulate' a tab behaviour for each factor
 * that is created. By selecting the <a> element corresponding
 * to a given factor, the area showing the level names is 
 * displayed. 
 */
 
function selectTab(name) {
  let tabs = document.getElementsByClassName("tabs");
  for (let i = 0, len = tabs.length; i < len; i++) {
    if(tabs[i].name == name ) tabs[i].classList.add("selected"); 
    else tabs[i].classList.remove('selected');  
  }    
    
  // Get all elements with class="tabcontent" and hide them
  // showing only the one selected  
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0, len = tabcontent.length; i < len; i++) {
    if ( tabcontent[i].id == name ) tabcontent[i].style.display = "block";
    else tabcontent[i].style.display = "none";
  }
}
                 
// Start when document is completely loaded 

document.addEventListener('DOMContentLoaded', function () {
    
    
    
    
    // Hide all tab contents
    let b = document.getElementsByClassName('tabcontent');
    for(let i = 0; i < b.length; i++) b[i].style.display = "none";
    

    document.getElementById("openFile").onclick = function() {        
      document.getElementById("loadFile").click() 
    };
    
    document.getElementById("loadFile").onchange = function() { 
      anova.open(); 
    };
    
});
