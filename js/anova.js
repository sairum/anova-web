"use strict";

var anova = (function () {
     
  /****************************************************************************/
  /*                                                                          */
  /*                              Global Variables                            */
  /*                                                                          */
  /****************************************************************************/

  const DPL  = 4; // Number of decimal places

  // Define these two constants which denote factor types. The choice of 0
  // for 'random' is not irrelevant. Terms in a ANOVA may be combinations of
  // two or more factors, called 'interactions'. An interaction may also
  // have a "type". If the interaction involes only fixed factors it's also
  // an interaction of fixed type, but if it involves at least one random
  // factor it becomes a random type interaction. Hence, to determine the
  // type of any term in the ANOVA one only has to multiply the types of all
  // factors involved in the term. A result of zero means a random type
  // interaction!

  
  const RANDOM  = 0;
  
  const FIXED   = 1;
  
  // The array 'data' holds data values read from the data file. However
  // a data file is 'organized' according to a specific format, described
  // below. The file is read line by line. All information relative to
  // a given datum should be on a single line! The format is as follows:
  //
  // 1) All lines started with a '#' are ignored (comment lines)
  //
  // 2) The first non-comment line is treated as a header with names of
  // factors separated by one or more spaces/tabs followed by the name
  // of the column with data values. Data values should always be on the
  // last column! Names of factors should not contain spaces! They should
  // be formed by a 'single' word or a few compound words joined by an
  // underscore '_' (e.g., 'fenced_squares') or hyphen '-' (e.g, 'sq-10').
  // Random factors should be denoted by adding an '*' at the end of the
  // name. Ideally, factor names should not contain any non ASCII characters.
  // All characters within the sets a-z, A-Z, 0-9, plus '_', '+', and '-'
  // are allowed (but not spaces). An example for a three factor data set
  // would be
  //
  // A B C* DATA
  //
  // The remaining non-comment lines should have as many label names as
  // there are factors, plus the numeric value for the data variable.
  // Numeric values can use the dot or the comma as decimal separator.
  // For a three factor example the line
  //
  // a 2 k 23,6
  //
  // means, level 'a' of factor 'A', level '2' of factor 'B' and level 'k'
  // of factor C, with DATA value equal to 23.6 (note comma replaced by dot)
  //
  // the 'data' array is a structured array. It will contain the set of
  // all data values for each unique combination of factor levels in the
  // same record. For example, consider an example with two factors each
  // with two levels: Factor A, levels {1,2} and factor B, levels {a,b},
  // and 6 replicates per cell (a cell being any possible combination
  // of levels of all factors involved). The 'data' array in JSON format
  // would be:
  //
  // [{values   : [23,12,11,12,14,12],
  //   originals: [23,12,11,12,14,12],
  //   levels   : ['1','a']
  //   label    : '1a', ...},
  //  {values   : [15,13,10,12,14,10],
  //   originals: [15,13,10,12,14,10],
  //   levels   : ['2','b']
  //   label    : '2a', ...},
  // [{values   : [18,16,14,15,16,15],
  //   originals: [18,16,14,15,16,15],
  //   levels   : ['1','b']
  //   label    : '1b', ...},
  //  {values   : [17,19,16,18,18,16],
  //   originals: [17,19,16,18,18,16],
  //   levels   : ['2','b']
  //   label    : '2b', ...}];
  //
  // values   : array of observed values (may be transformed)
  //            for a given combination of levels of factors
  //            as identified by 'levels' or 'label'
  // originals: the original values (to allow one to reset them
  //            if transformations have been applied)
  // levels   : an array with codes denoting the levels for each
  //            factor; it's size is 'nfactors'; original level
  //            names are kept in 'factors[].levels' array
  // label    : a string concatenation of level codes to allow
  //
  // codes    : array with level codes per factor; codes are
  //            just indexes to the true level names stored
  //            in 'factors[].levels'
  // sumx     : sum of observations which have this
  //            combination of level codes
  // sumx2    : squared sum of observations which have this
  //            combination of level codes
  // ss       : partial sums of squares
  // n        : number of replicates
  // n_orig   : original replicates; may be different from 'n'
  //            if some replicates are missing in some cells
  // average  : average of values for this cell
  // variance : variance for this cell
  // median   : median for this cell
  // cl95     : unsigned 95 confidence limit
   
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
  
  // 'terms' is an array that holds information for all combinations of 
  // ANOVA terms as if a full orthogonal model was used. For each term 
  // the following information is compiled:                                             
  //                                                                      
  // name    : The name of a term; can be a single name for a main factor
  //           or a combination of names separated by 'x' (e.g., AxBxC)
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

  var residual = {name: 'Error', df: 0, ss: 0};
  
  // Start by assuming that all factors are orthogonal; if later
  // on it's found that they are not, 'nesting' becomes true
  
  var nesting = false;

  // Do not show multiple tests for main factors that
  // participate in significant interactions

  var ignoreinteractions = false;


  var max_value = Number.MIN_SAFE_INTEGER;

  var min_value = Number.MAX_SAFE_INTEGER;  

  // default rejection level (alpha)
  const DEFAULT_REJECTION_LEVEL = 0.05;

  // set default rejection level for ANOVA F tests
  var rejection_level = DEFAULT_REJECTION_LEVEL;
  
  // set default rejection level for multiple tests
  var mt_rejection_level = DEFAULT_REJECTION_LEVEL;
  
  var filename= '';




  /****************************************************************************/
  /*                                                                          */
  /*           Compute a list of a posteriori muliple comparisons             */
  /*                                                                          */
  /* Check for terms that display significant F-statistics (differences       */
  /* between averages of a fixed factor). For the sake of simplicity restrict */
  /* a posteriori tests to terms denoting up to second order interactions     */
  /* (that is, involving trhee factors). The list is called 'mcomps' and will */
  /* be fed to a function that actually preforms a posteriori multiple        */
  /* comparison tests.                                                        */
  /*                                                                          */
  /****************************************************************************/
   
  function buildMultipleComparisons() {

    
    //console.log(terms)
      
//     mcomps = [];
//
//     // Iterate through all 'terms' that are not the Residual (Error) or
//     // the Total terms (these two are easily identified because their
//     // attribute 'nlevels' = 0 and are in the end of the list of terms)
//
//     for(let t = 0, tln = terms.length; t < tln; t++ ) {
//
//       // Consider only those terms which have an F probability smaller than
//       // the rejection level specified (usually 0.05). Also, ignore
//       // interactions with more than three factors for simplicity
//       // (terms with 'order' > 3).
//
//       if( ( terms[t].P < rejection_level ) && ( terms[t].nlevels > 0 ) &&
//           ( terms[t].order < 4 ) && ( terms[t].against !== -1 ) ) {
//
//         // Consider only fixed factors or interactions containing fixed
//         // factors. Multiple tests are useless for random factors. Go along
//         // the array 'terms[].codes' for the current term (ignoring the last
//         // element which stands for the Error component) and annotate any
//         // factor involved ('codes[] == 1) which is of type "fixed". This
//         // will be called the target factor. All candidate comparisons will
//         // be stored in 'mcomps', an array of JSON objects that will hold
//         // all the necessary information for processin an a_posteriori
//         // multiple test
//
//         for (let i = 0, fl = factors.length; i < fl; i++ ) {
//
//           if ( ( terms[t].codes[i] === 1 ) && (factors[i].type === FIXED ) ) {
//
//             //console.log(t.toString() + ' ' + terms[t].name +
//             //            ': ' + factors[i].name );
//             //console.log(terms[t]);
//
//             // Identify the target factor for which we want to perform
//             // multiple comparisons. Append the target factor to a list
//             // to be provided to multiple comparison tests. For this, build
//             // a JSON object ('tgt') that will hold all the information
//             // necessary for the multiple test procedures for a given
//             // target factor, be it a main factor or an interaction.
//             // This will be appended to the 'mcomps' list
//             //
//             // tgt = {
//             //   fcode      : i,
//             //   fname      : factors[i].name
//             //   term       : term name
//             //   averages   : [],
//             //   levels     : [],
//             //   n          : [],
//             //   df_against : 0,
//             //   ms_against : 0,
//             // }
//             //
//             // Note that 'tgt.factor' holds the code of the factor being
//             // analyzed (i).
//
//             let tgt = { fcode: i };
//
//             // From this, we compute the real name of factor 'i'
//             // and store it into 'tgt.name'.
//
//             tgt.fname = factors[i].name;
//
//             // Store the term's name for future reference.
//
//             tgt.term = terms[t].name;
//
//             // For some multiple tests the 'df' and the 'MS' of the term
//             // used in the denominator of the F test for this particular
//             // term ('term[t].against') is needed, so we pass it through
//             // 'df_against' and 'ms_against'.
//
//             tgt.df_against = terms[terms[t].against].df;
//             tgt.ms_against = terms[terms[t].against].MS;
//
//             // Now a list of averages to perform multiple comparisons is
//             // necessary. These averages are the averages of the levels of
//             // the 'tgt' factor. They will be passed in an array containing
//             // the level 'name' (not its 'code'), the number of replicates
//             //used to compute the average of each level, and the
//             // corresponding variance. This is easy if the 'term' being
//             // considered (t) corresponds to a main factor (which has
//             // 'term[t].order' == 1) as all necessary values are stored in
//             // 'terms' array ('average', 'n', 'sumx', 'sumx2', etc).
//
//             tgt.averages = [];
//
//             if( terms[t].order === 1 ) {
//
//               tgt.type = 'factor';
//
//               tgt.averages[tgt.term] = [];
//
//               // Go along all levels
//
//               for (let j = 0, jl = terms[t].average.length; j < jl; j++) {
//
//                 // Translate level name. Levels are stored as a string
//                 // separated by ','. Transform the string into an array
//                 // splitting by ','.
//
//                 let lv = terms[t].levels[j].split(',')[i];
//
//                 // The levels of the factor being considered ('i') are in
//                 // the 'i'th position on the array.
//
//                 let ln = factors[i].levels[lv];
//
//                 // Get the 'average' and 'n' for this level
//
//                 let avg = terms[t].average[j];
//                 let n = terms[t].n[j];
//
//                 // Compute Standard Deviation for later calculation
//                 // of standard error
//
//                 let std = 0;
//                 if( n > 1 ) {
//                   std = terms[t].sumx2[j] - Math.pow(terms[t].sumx[j],2)/n;
//                   std = std/(n-1);
//                 }
//
//                 // Update the list of averages
//
//                 tgt.averages[tgt.term].push({level: ln,
//                                              average: avg,
//                                              n: n,
//                                              std: std});
//               }
//
//               // Reorder list of averages, from smallest to largest
//
//               tgt.averages[tgt.term].sort((a, b)=>(a.average>b.average)?1:-1);
//
//               // Push new target to the list of 'mcomps' for multiple
//               // comparisons
//
//               mcomps.push(tgt);
//
//             } else {
//
//               // If the 'terms[t]' where the target factor is contained also
//               // contains other factors, it's because it is an interaction
//               // term. The computation of differences between averages is a
//               // little bit more complicated, as it should be done
//               // independently for all combinations of the levels of the
//               // factors involved in the interaction with the exception of
//               // the target term.
//
//               tgt.type = 'interaction';
//
//               for ( let j = 0, jl = terms[t].levels.length; j < jl; j++ ) {
//
//                 let levs = terms[t].levels[j].split(',');
//
//                 // Translate level name. Levels are stored as a string separated
//                 // by ','. Transform the string into an array splitting by ','.
//                 // The code for the current level of the target factor is in
//                 // slot 'i'.
//
//                 let lv = levs[i];
//
//                 let ln = factors[i].levels[lv];
//
//                 for(let k = 0, kl = factors.length; k < kl; k++) {
//                   if ( ( terms[t].codes[k] != 1 ) || (k == i) ) levs[k] = "-";
//                 }
//
//                 // Get the 'average' and 'n' for this level
//
//                 let avg = terms[t].average[j];
//                 let n = terms[t].n[j];
//
//                 // Compute Standard Deviation for later calculation
//                 // of standard error
//
//                 let std = 0;
//                 if( n > 1 ) {
//                   std = terms[t].sumx2[j] - Math.pow(terms[t].sumx[j], 2)/n;
//                   std = std/(n-1);
//                 }
//
//                 // Stringify the 'codes' array which will be used as a key
//                 // of an associative map for all combinations of levels
//                 // excluding the target factor
//
//                 let codes = levs.join();
//
//                 let c = tgt.averages.hasOwnProperty(codes)?tgt.averages[codes]:-1;
//                 if ( c == -1 )  tgt.averages[codes] = [];
//                 tgt.averages[codes].push({level: ln,
//                                           average: avg,
//                                           n: n,
//                                           std: std});
//
//                 // Reorder list of averages, from smallest to largest
//
//                 tgt.averages[codes].sort((a, b)=>(a.average>b.average)?1:-1);
//               }
//               mcomps.push(tgt);
//             }
//           }
//         }
//       }
//     }
    
    // We have scanned all terms. 'target' has a list of all possible
    // comparisons!
    
    //console.log('mcomps: ',mcomps);
  }
  
  
  /****************************************************************************/
  /*                                                                          */
  /*                               buildTerms                                 */
  /*                                                                          */
  /* This function builds the list of terms of any ANOVA with N factors.      */
  /* First it computes all possible combinations of factors as if a fully     */
  /* factorial ANOVA is being made. Then a check for nesting of factors is    */
  /* made and if any factor is found to be nested into another factor or into */
  /* an interaction, a correction is made by accummulating the appropriate    */
  /* sums of squares, degrees of freedom, averages, levels, and factor name's */
  /* notation, and removing the edundant term from the list                   */
  /*                                                                          */
  /****************************************************************************/

  function buildTerms() { 
        

    // Construct a list of 'terms' (denoting either main factors or
    // interactions) assuming that a fully orthogonal analysis is being done.
    // The number of terms of any fully orthogonal design is given by
    //
    // 2^n
    //
    // where n is the number of factors involved
    //
    // Note that the formula includes the empty element {} and all possible
    // combinations of factors ignoring their order. For example, for a
    // set with three factors {A,B,C} the total number of terms is given by
    //
    // 2^3 = 8
    //
    // which are
    //
    // {}, {A}, {B}, {C}, {AB}, {AC}, {BC}, {ABC}
    //
    // Note that {BA}, {CA}, {CB}, {ACB}, {BCA}, {BAC}, {CAB}, and {CBA}
    // are not included as the order does not matter
    //
 
    let s = Math.pow(2, nfactors);
    
    // Now create all combinations of factors, one in each iteration,
    // but exclude i = 0 which corresponds to the empty set {}
    
    for( let i = 1; i < s; i++ ) {
        
      let temp = { idx: 0, name: "", codes: [], order: 0, combins: 1,
                   nlevels: 0, levels: [], sumx: [], sumx2: [], n: [],
                   average: [], ss: 0, df: 1, SS: 0, ct_codes: [],
                   varcomp: [], MS: 0, P: 0, against: -1, F: 0,
                   type: FIXED };
                   
      for( let j = 0; j < nfactors; j++ ) {
          
        //
        // Unfortunately, we need an additional attribute 'idx' to keep the
        // order of creation of the terms. The order will be:
        //
        // idx : term
        // -----------
        // 1   : A
        // 2   : B
        // 3   : A*B
        // 4   : C
        // 5   : A*C
        // ...
        // Note that the fourth term (idx = 4) is a main factor ('C'), but it
        // is created after the interaction A*B. Later on, the list of terms
        // of the ANOVA should be sorted according to the 'order' of terms
        // (1 - for main factors, 2 - for 1st order interactions, 3 - for
        // second order interactions, and so on).
        //
        // However, two terms may have the same 'order' (for example, both are
        // first order interactions, and their 'order' is 2). In these cases,
        // we need to have a way to sort them according to the order they were
        // created during the reading stage of data. This is particularly
        // important for terms denoting the main factors. If their order
        // differs from the the order in which main factors were created
        // during the reading stage of data (see 'factors') problems will
        // occur because the 'codes' property of 'terms' and 'partials' lists
        // expects that the order of the main factors is the same as in the
        // 'factors' array
        //
        
        temp.idx = i;  
        if( (i & Math.pow(2,j)) ) {
          temp.codes[j] = 1;
          temp.order++;
          temp.combins *= factors[j].nlevels;
          temp.type *= factors[j].type;
        } else {
          temp.codes[j] = 0;
        }
        
        // Insert one more code for the "Error" to all terms
        
        temp.codes.push(0);
      }
      terms.push(temp);
    }
    
    
    
    // Compute the 'partials' list, i.e., a list with all terms potentially
    // included in an ANOVA.

    if( getCellsSS() ) {

      // Sort 'terms' by ascending 'terms[].order'. Note that if the terms
      // 'order' is the same for two or more terms we resort to their 'idx'
      // attribute to keep the correct order. This is only important for
      // main factors (terms[].order == 1) because their order should be
      // the same as for the 'factors[]' order

      terms.sort( function(a,b){return (a.order-b.order) || (a.idx - b.idx)} );


      // Recompute MSs and dfs for all terms. Do not do this for the 'Error'
      // and the 'Total' because their SS and df are already computed.

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

      // The df for the 'Error' is already computed so we don't overwrite it.
      // Instead we compute its MS

      let e = terms.length - 2;
      terms[e].MS = terms[e].SS/terms[e].df;


      // Check if there are nested factors and correct the
      // ANOVA terms if necessary

      correctForNesting();


      // Compute Cornfield-Tukey rules to determine
      // denominators for the F-tests

      computeCTRules();


      // Display tables of averages per factor or combinations of factors

      displayAverages();

      // Build the list of multiple comparisons, if any available

      buildMultipleComparisons();

      // Display the tab with multiple comparisons if any is selected

      displayMultipleComparisons();

      // Finally display the ANOVA table

      displayANOVA();
    }
  }

  

  
  /****************************************************************************/
  /*                                                                          */
  /*                              computeCTRules                              */
  /*                                                                          */
  /*   This function computes Cornfield-Tukey Rules that will determine the   */
  /*   denominators of the F statistics in any ANOVA scenario. For a fully    */
  /*   orthogonal ANOVA with fixed factors, the denominator for all tests is  */
  /*   the Error term. For mixed or more complex models the denominator       */
  /*   changes according to the Cornfield-Tukey rules                         */
  /*                                                                          */
  /****************************************************************************/

  function computeCTRules() {

    
    // Build the table of multipliers for all terms
    // Skip the last two terms. The 'Total' is not necessary
    // and the ct_codes for the 'Error' are already computed
    // [1,1,...,1] for all factors
      
    for ( let i = 0, tl = terms.length - 2; i < tl; i++ ) {
      terms[i].ct_codes = new Array(nfactors+1).fill(0);
      for ( let k = 0; k < nfactors; k++ ) {
        let t = terms[i].codes[k];
        if( t != 0 ) {
            
          // subscript is in the term
          
          if ( t == 1 ) {
              
            // it's outside parenthesis
            
            if (factors[k].type === RANDOM) terms[i].ct_codes[k] = 1;
            else terms[i].ct_codes[k] = 0; 
          } else {
              
            // subscript is within parenthesis
            
            terms[i].ct_codes[k] = 1;  
          } 
        } else {
            
          // This subscript is not in the term
          
          terms[i].ct_codes[k] = factors[k].nlevels;
        }  
      }
      terms[i].ct_codes[nfactors] = replicates;
    }

    // Now check wich components contribute to the MS
    // of each term, including the 'Error'

    let tl = terms.length - 1;
    for ( let i = 0; i < tl; i++ ) {
        
      // 'i' is the 'current' component term and should be checked
      // against all other component terms
      
      for ( let j = 0; j <tl; j++ ) {
        
        // 'j' is the component term being compared
        // with the current term 'i'
        
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
    
    // Finally, update the included terms according to the
    // multipliers of 'ct_codes'. We can skip the "Error"
    // term. For each target 'term' denoted by 'i', compare
    // it with the current 'term', denoted by 'j'. If the
    // current 'term' contains all the subscripts of 'i'
    // the multiplier for this particular source of variation
    // in the target term is the product of all coeficients
    // of 'j' excluding those which subscripts are present
    // in 'i'.
    
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
    
    // Now check what are the denominators of the F tests.
    // For each term (excluding the 'Error' and 'Total'
    // compare them with all others
    
    tl = terms.length;
    
    for ( let i = 0; i < tl - 2; i++ ) {
      
      // for each term 'i' start from the bottom
      // and check if the 'varcomp' of term 'j'
      // has all the components of 'varcomp' for
      // term 'i' except for 'i' itself
      
      //console.log('For ' + terms[i].name)

      let pf;
      for ( let j = tl - 2; j >= 0; j-- ) {
        //console.log('  Compare with ' + terms[j].name)
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
          pf = jStat.centralF.cdf(terms[i].F, terms[i].df, terms[j].df);
          terms[i].P = 1 - pf;
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
  
  /****************************************************************************/
  /*                                                                          */
  /*                              computeCells                                */
  /*                                                                          */
  /*  Data were gathered into structures corresponding to NOVA cells also     */
  /*  known as 'partials'. Each element of array 'data' holds an array with   */
  /*  the factor level codes ('levels'), another with data values ('values')  */
  /*  and a copy of the latter just to be able to revert any modifications    */
  /*  to the data ('originals'). Besides these variables, we compute several  */
  /*  quantities that are fundamental for the next computations.              */
  /*                                                                          */
  /*  'levels' are recoded into integers, replacing the original label by its */
  /*  corresponding index in 'factors[i].levels' array. The first factor      */
  /*  level for any factor will always be 0 (zero), the second will be 1, and */
  /*  so on. Take the following example of the first data points of a three   */
  /*  factor analysis (two replicates per combination of factors)             */
  /*                                                                          */
  /*    Site Type  Light DATA                                                 */
  /*    A    B     day   23                                                   */
  /*    A    B     day   21                                                   */
  /*    A    B     night 12                                                   */
  /*    A    B     night 16                                                   */
  /*    A    C     day   13                                                   */
  /*    A    C     day   11                                                   */
  /*   ...                                                                    */
  /*                                                                          */
  /*  The 'codes' and 'values' in the 'data' array will be                    */
  /*                                                                          */
  /*   data[i]   'codes'  'values'                                            */
  /*     0      [0, 0, 0] [23, 21]                                            */
  /*     1      [0, 0, 1] [12, 16]                                            */
  /*     2      [0, 1, 0] [13, 11]                                            */
  /*   ...                                                                    */
  /*                                                                          */
  /*  For factor 'Site' level 'A' of 'Site' is coded as 0 (no more levels in  */
  /*  the example). For factor 'Type', level 'B' is coded as 0 and level 'C'  */
  /*  is coded as 1. For factor 'Light', level 'day' is coded as 0 and level  */
  /*  'night' is coded as 1.                                                  */
  /*                                                                          */
  /*  During this stage we accummulate the sums of all values and the sums of */
  /*  all squared values into two 'sumx' and 'sumx2', respectively, together  */
  /*  with the total number of replicates ('n'). For the example above, the   */
  /*  corresponding 'data' entries would be                                   */
  /*                                                                          */
  /*  [                                                                       */
  /*   {[0, 0, 0], [23, 21], 44, 970, 2},                                     */
  /*   {[0, 0, 1], [12, 16], 28, 400, 2},                                     */
  /*   {[0, 1, 0], [13, 11], 24, 290, 2},                                     */
  /*   ...                                                                    */
  /*  ]                                                                       */
  /*                                                                          */
  /****************************************************************************/
  
  // This is a implementation of a function to compute medians of lists.
  // Medians are necessary to implement the version of Levene's test with
  // medians, instead of means.

  function median( l ) {
    if (l.length == 0) return;
    l.sort((a, b) => a - b);
    let mid = Math.floor( l.length / 2 );
    // If odd length, take midpoint, else take average of midpoints
    let median = l.length % 2 === 1 ? l[mid] : ( l[mid - 1] + l[mid] ) / 2;
    return median;
  }

  function computeCells() {


    // Use 'maxn' to estimate the maximum number of replicates per cell.
    // In a balanced data set, all 'cells' will have the same number of
    // replicates. This variable will allow us to replace missing data in
    // a given partial by adding as many averages as necessary to complete
    // 'maxn' replicates
    
    let maxn = 0;

    // We will use this a lot

    let dl = data.length;

    // Now, go along all ANOVA cells and for each compute some important
    // quantities:
    // 1) n (number of replicates)
    // 2) sumx (sum of all data values)
    // 3) sum2x (sum of squared data values)

    for(let i = 0; i < dl; i++ ) {
        
      // Translate the original data level code into the numeric
      // level code stored previously in 'factors[].levels'
      
      for(let j = 0, len = data[i].levels.length; j < len; j++ ) {
        let l = data[i].levels[j];
        let k = factors[j].levels.indexOf(l);
        data[i].codes[j] = k;
      }  
      
      // Compute 'n', 'sumx' and 'sumx2'

      data[i].sumx  = 0;
      data[i].sumx2 = 0;

      data[i].n = data[i].values.length;

      for(let j = 0; j < data[i].n; j++ ) {
        data[i].sumx  += data[i].values[j];
        data[i].sumx2 += Math.pow( data[i].values[j], 2 );
      }

      // Save 'n_orig' for this cell. So far lets assume it is
      // equal to the number of observations on 'values' array

      data[i].n_orig = data[i].n;

      // Update the maximum number of replicates per ANOVA cell
      // if the 'n' for this 'data' cell is greater than 'maxn'.

      if( data[i].n > maxn ) maxn = data[i].n;

      // Compute the average of values

      data[i].average = data[i].sumx/data[i].n;

      // Compute the variance of values

      data[i].variance = data[i].sumx2 - Math.pow(data[i].sumx,2)/data[i].n;
      data[i].variance = data[i].variance/(data[i].n-1);

      // Sort data values to compute the median

      data[i].median = median( data[i].values );

    }
    
    // Go along all cells and verify that each has a similar number of
    // replicates ('data[i].n' should equal 'maxn'). If not, replace
    // missing values with the average of the cell (data[i].average)
    // and increment the global variable 'correted_df' to later
    // decrease the degrees of freedom of the 'Error' (or 'Residual')
    // and the 'Total' terms of the ANOVA
    
    for(let i = 0; i < dl; i++ ) {
      if( data[i].n < maxn ) {
        let diff = maxn - data[i].n;
        for( let j = 0; j < diff; j++) {
          corrected_df++;
          data[i].sumx += data[i].average;
          data[i].sumx2 += Math.pow( data[i].average, 2 );
          data[i].n++;
        }
      }
    }
    
    // After rebalancing the data, compute Residual and Total sums of squares
    // and their respective degrees of freedom. Compute also the squared
    // differences between observations and their averages for each partial
    // using the equation:
    //
    //   SUM(X_i - X_bar)^2 = SUM(X_i^2) - (SUM(X_i))^2/n
    //
    // where X_i is a particular observation and X_bar is the average for
    // the set

    let tsumx = 0, tsumx2 = 0, tn = 0;

    for(let i = 0; i < dl; i++ ) {
      data[i].ss =
        data[i].sumx2 - Math.pow( data[i].sumx, 2 )/data[i].n;
      residual.df += data[i].n-1;
      residual.ss += data[i].ss;
      total.df += data[i].n;
      tsumx += data[i].sumx;
      tsumx2 += data[i].sumx2;
      tn += data[i].n;
    }
    total.df -= 1;
    total.ss = tsumx2 - Math.pow( tsumx, 2 )/tn;
    residual.orig_df = residual.df;
    residual.df -= corrected_df;
    total.orig_df = total.df;
    total.df -= corrected_df;
     
    // The number of replicates can now be taken from any ANOVA cell
    // because rebalancing was performed earlier
    
    replicates = data[0].n;
    
    
    // It's time to compute homogeneity tests for this data set
    //because most depend only on having information of averages and
    //variances for all possible combinations of levels of all factors
    //involved in the analysis. The 'partials' list has exactly that
    //information!
    
    homogeneityTests();
    
    // Compute the terms of the linear model
    
    buildTerms();

  }
  
   
  /****************************************************************************/
  /*                                                                          */
  /*                           correctForNesting                              */
  /*                                                                          */
  /* A factor can be nested in another factor or in an interaction of two or  */
  /* more factors. This function checks if the uncorrected sums of squares    */
  /* of a pair of terms is the same. In this case, if one of the terms denote */
  /* a single factor (the other denoting an interaction where this factor is  */
  /* involved) it means that the single factor is nested into any other       */
  /* factor participating in the interaction. If the interaction is of first  */
  /* order (two factors involved) the nesting factor is mandatorily the one   */
  /* which is not designated by the term that denotes a single factor. For    */
  /* complex designs, for example, those with factors nested into             */
  /* interactions, the process is more tricky. See details within the code of */
  /* this function.                                                           */
  /*                                                                          */
  /****************************************************************************/
  
  function correctForNesting() {



    // No need to check for nesting if there is only one factor,
    // or if there is no hint on nested factors ('nested' == false).
    // The latter is determined in the 'getPartialSS' function
    // by comparing the observed number of levels of each term
    // with the expected number of levels given a simple fully
    // orthogonal analysis.
    
    if( ( nfactors == 1 ) || (!nesting) ) return;
    
    // Start by caching the current term in variable 'current'
    
    let current = 0; 
    
    // Skip the two last terms, the 'Total' and the 'Error' terms!
    
    while(current < terms.length - 2) {
      
      // Cache the term being compared (target) in variable 'c'
      
      let c = current + 1;
      
      // Skip the two last terms, the 'Total' and the 'Error' terms!
      
      while (c < terms.length - 2) {
          
        // console.log('Comparing ' + current.toString() +
        //             ' with ' + c.toString());
          
        if( terms[current].ss == terms[c].ss ) {
            
          // If the uncorrected sums of squares are similar the 'current'
          // term is nested into a term involved in term 'c' (which is
          // mandatorly an interaction in a fully orthogonal analysis).
          // Now compare the two terms to find out if the 'current' is
          // nested in another factor or within an interaction of factors.
          
          for ( let k = 0; k < nfactors; k++ ) {
            if ( ( terms[c].codes[k] != terms[current].codes[k] ) ) {
                
              // In the current term, we set the code's column 'k' to 2 (two)
              // to denote that factor 'k' nests a factor involved in this
              // term. Thre may be multiple 'k's if the 'current' term
              // involves a factor nested in an interaction between two or
              // more factors. This notation will come in handy to compute
              // Cornfield-Tukey Rules later on
              
              terms[current].codes[k] = 2;
              
              // If the 'current' term denotes a main factor ('order' == 1),
              // having another term measuring the same amount of variation
              // (uncorrected 'ss') means that the former is a nested factor.
              // Its 'type' should be changed to 'random', and the list of
              // terms where it is nested in should be updated.
              
              if ( terms[current].order == 1 ) {
                  
                //console.log(current.toString() + ' is nested in ' +
                //            k.toString());
                  
                factors[current].nestedin[k] = 1;
                factors[current].type = RANDOM;
                
                // correcting levels of this term will be done later during
                // the correction of term's names
                
              }   
            }
          }
          
          // Accummulate the corrected sums of squares ('SS'). Use the
          // 'averages', 'levels', 'sumx', and 'sumx2' of the higher order
          // term, and then delete it from the list of terms
          
          terms[current].SS += terms[c].SS;
          terms[current].averages = terms[c].averages;
          terms[current].sumx = terms[c].sumx;
          terms[current].sumx2 = terms[c].sumx2;
          terms[current].levels = terms[c].levels;
          terms[current].nlevels = terms[c].nlevels;
          terms[current].combins = terms[c].combins;
          
          // Remove the redundant term
          
          terms.splice(c, 1);  
             
          //console.log('Removing ' + c.toString());
          
        } else {
          
          // We only increment 'c' if no term was deleted from
          // the list. If there was a deletion, the next term
          // in the list (if any) will occupy the position of
          // the deleted term
          
          c++;            
        }
      } 
      current++;  
    }
    
    
    correctTermNames();

    // Finally, correct the degrees of freedom of each term.
    // Skip the two last terms, the 'Total' and the 'Error' term!
     
    for (let i = 0, tl = terms.length - 2; i < tl; i++) {
      terms[i].df = 1;
      for (let k = 0; k < nfactors; k++) {
        if( terms[i].codes[k] == 1 ) terms[i].df *= factors[k].nlevels - 1;
        if( terms[i].codes[k] == 2 ) terms[i].df *= factors[k].nlevels;   
      }  
      terms[i].MS = terms[i].SS/terms[i].df;
    }
    
  }
  
 
  /****************************************************************************/
  /*                                                                          */
  /*                          correctTermNames                                */
  /*                                                                          */
  /* After correcting for nesting, by pooling terms with similar uncorrected  */
  /* sums of squares ('ss'), the names of the terms should be changed to      */
  /* denote the nesting hierarchy. A term X nested into a term Y should be    */
  /* renamed X(Y). A term X nested into an interaction Y*Z should renamed     */
  /* X(Y*Z). After correcting the names the dfs of nested factors or          */
  /* interactions involving them should also be corrected.                    */
  /*                                                                          */
  /****************************************************************************/
  
  function correctTermNames() {

      
    // For factors that are nested into others, correct the nesting depth
    // (number of factors where it is nested into, i.e. number of 'nestedin'
    // codes equal to one (1)). Take this opportunity to correct the levels
    // of nested factors. Usually the number of levels as computed from the
    // data file is much larger than the actual number of levels, and is
    // computed by dividing the observed levels by the number of levels of
    // factors where the nested factor is nested into.
    
    for ( let i = 0; i < nfactors; i++ ) {
      for ( let j = 0; j < nfactors; j++ ) {
        if( factors[i].nestedin[j] == 1 ) {
          factors[i].depth++;
          factors[i].nlevels /= factors[j].nlevels;  
        }
      }
    }    
    
    // Now, correct the names of the factors according to the nesting
    // hierarchy. To do this we need to build a list of terms ordered by
    // their nesting depth (i.e. how many factors/interactions are they nested
    // in) in ascending order (lower depths first). This is necessary because
    // we cannot mess with the order of the 'factors' and 'terms' arrays: the
    // first factor in array 'factors' (index 0) should correspond to the
    // first term in array 'terms' (with a similar index of 0), and so on.
    // The list will only contain terms which are nested into others
    
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
    
    // Sort nested factors from lowest nesting depths to highest nesting depths
    
    nfl.sort(function(a,b){return a.depth - b.depth; });
    
    // Eliminate redundant codes, i.e. those that are associated
    // with a factor which is already nested into another. As an
    // example consider the following 4 factor ANOVA in which
    // factor B is nested in A, and factor C ins nested in A and B
    //
    // i  Factor nestedin   depth
    // 0  A      [0,0,0,0]  0
    // 1  B      [1,0,0,0]  1
    // 2  C      [1,1,0,0]  2
    // 3  D      [0,0,0,0]  0
    //
    // For factor C, nesting in A is redundant because B (in which
    // it nested) is itself nested in A. The 'nestdin' for C should
    // be [0,1,0,0]. Why? Because the name for B will be replaced
    // by B(A) (its depth is 1, so this is done before renaming C,
    // which depth is 2). Now when we replace factor names in C,
    // there is only one to be replaced (B) and the term will be
    // named C(B(A))
    //
    // Now, suppose now that C is nested in the interaction A*B instead
    // (hence B would not be nested in A, since nested factors do not
    // created interactions with the factors where they are nested in).
    // The codes would be
    //
    // i  Factor nestedin   depth
    // 0  A      [0,0,0,0]  0
    // 1  B      [0,0,0,0]  0
    // 2  C      [1,1,0,0]  2
    // 3  D      [0,0,0,0]  0
    //
    // There are no redundancies in this set, and the name of C would
    // become C(A*B)
    ///
    
    for (let i = 0, len = nfl.length; i < len; i++) {
      
      // No need to check for redundancies in factors that
      // are nested into a single one
      
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
        factors[j].name += '(' + nm.join('&times;') + ')';
      } else {
        let j = nfl[i].codes.indexOf(1);
        let k = nfl[i].index;
        if ( j != -1 ) factors[k].name += '(' + factors[j].name + ')';
      }  
    }
   
    // Finally, replace the new names in all terms. Note that the two
    // last terms are the Error and the Total, so skip them!
    
    for (let i = 0, len = terms.length - 2; i < len; i++) {
      let nm = [];
      for ( let j = 0; j < nfactors; j++) {
        if (terms[i].codes[j] == 1 ) {
          nm.push(factors[j].name);   
        } 
      }
      terms[i].name = nm.join('&times;');
    }
    
    //console.table(terms);
  }
  
  /****************************************************************************/
  /*                                                                          */
  /*                              displayANOVA                                */
  /*                                                                          */
  /*   This function displays a table with the Analysis of Variance           */
  /*                                                                          */
  /****************************************************************************/
  
  function displayANOVA() {


    let text = '<div class="ct"><table>' +
               '<thead><tr><th>Source</th><th>SS</th><th>df</th>' +
               '<th>MS</th><th>F</th><th>Prob.</th><th>MS Denom.</th>' +
               '</tr></thead><tbody>';

    for(let i = 0, len = terms.length; i < len; i++ ) {
      text += '<tr>';
      text += '<td>' + terms[i].name + '</td>';
      text += '<td>' + terms[i].SS.toFixed(DPL).toString() + '</td>';
      text += '<td>' + terms[i].df.toString() + '</td>';
      if( terms[i].name != 'Total' ) {
        text += '<td>' + terms[i].MS.toFixed(DPL).toString() + '</td>';
      } else {
        text += '<td></td>';
      }
      let nm = terms[i].against;
      if( ( i < (terms.length - 2 ) ) && ( nm != -1 ) ) {
        text += '<td>' + terms[i].F.toFixed(DPL).toString() +'</td>';
        let prob = '';
        if ( terms[i].P > rejection_level ) prob = terms[i].P.toFixed(DPL).toString();
        else prob = '<b><i>' + terms[i].P.toFixed(DPL).toString() + '</i></b>';
        text += '<td>' + prob + '</td>';
        text += '<td>' + terms[nm].name + '</td>';
      } else {
        text += '<td></td>';
        text += '<td></td>';
        if ( nm == -1) text += '<td><b>No Test</b></td>';
        else text += '<td></td>';
      }
      text += '</tr>';
    }
    text += '</tbody></table></div>';

    // Update contents of 'display' tab (ANOVA results)

    let d = document.getElementById('analysis');
    d.innerHTML = text;

    // Select ANOVA results tab ('analysis') using ui function 'select
    // hidding all other tabs
    //
    // selectTab('analysis');
        
  }  

  /****************************************************************************/
  /*                                                                          */
  /*                              displayAverages                             */
  /*                                                                          */
  /*  This function displays a small table with the summary of the averages   */
  /*  for each term in the ANOVA. This information may be useful to graph     */
  /*  data further on or simply to check if the analysis has ben correctly    */
  /*  done.                                                                   */
  /*                                                                          */
  /****************************************************************************/
  
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
      
      table += '<th>Average</th><th>n</th><th>St. Dev.</th>' +
               '<th>Variance</th></tr></thead><tbody>';
      
      for(let j = 0, jlen = terms[i].average.length; j < jlen; j++ ) { 
        table += '<tr>';  
        let levs = terms[i].levels[j].split(',');
        for(let k = 0, klen = levs.length; k < klen; k++ ) {
          if( cds[k] == 1 ) {
            table += '<td>' + factors[k].levels[levs[k]] + '</td>'; 
          }  
        }
        table += '<td>' + terms[i].average[j].toFixed(DPL) + '</td>';
        let n = parseInt(terms[i].n[j]);
        table += '<td>' + n.toFixed(DPL) + '</td>';
        
        let std = 0, variance = 0;
        if( n > 1 ) {
          variance = (terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/n);
          variance = variance/(n-1);
          std = Math.sqrt(variance,2);
        }
        
        table += '<td>' + std.toFixed(DPL) + '</td>';
        table += '<td>' + variance.toFixed(DPL) + '</td>';
        table += '</tr>'; 
      } 
      table += '</tbody></table>';
    }
    d.innerHTML = table;
  }

  /****************************************************************************/
  /*                                                                          */
  /*                              displayCTRules                              */
  /*                                                                          */
  /*     This function displays a table with the Analysis of Variance         */
  /*                                                                          */
  /****************************************************************************/
  
  function displayCTRules( ) {

    
    let c = document.getElementById('ctrules'); 

    
    let table = '<div class="ct"><table><thead>';


    // Build the header of the table. First column for the ANOVA term name

    table += '<tr><th>Term</th>';


    // Now add one column for each subscript associated with each factor,
    // plus one column for the Error. This is the CT table of multipliers,
    // and its display is just for debugging purposes


    // We should build a table with as many columns as ANOVA terms (including
    // the Error term) which will display the components of variance measured
    // by each term. Again, displaying this is only necessary while debugging


    // Finally a column to display which variance components are estimated
    // by each term

    table += '<th>Estimates</th></tr></thead><tbody>';

    
    // Compute CT rows. If DEBUG is set the table is more complex than
    // for regular operation, where we need only the factor or interaction
    // names and the list of variance components involved in the term (these
    // are stored in 'terms[i].varcomp[j]' for term 'i' and component 'j')
    //
    // For displaying the CT Rules in DEBUG mode we also need the list of
    // CT coefficients per subscript, one subscript per factor plus the
    // Error term. These are stored in 'terms[i].ct_codes[j]' for term 'i'
    // and component 'j'.
    //
    // The 'terms[i].varcomp[j]' should be printed in reverse order because
    // the members of this vector are stored according to the order of terms,
    // main factors first, first order interactions next, and so on, the
    // error term being the last entry. When displaying variance components
    // in CT Rules, practice dictates that we should start by the Error or
    // Residual and move up to main factors.
    //
    // The above rule is solved by using a reverse 'for' loop for all the
    // 'terms[i].varcomp[j]' of term 'i', and works well in all cases.
    // However, there are specific cases where the last variance component
    // might not be the factor or interaction corresponding to row 'i'. Even
    // though all computations still work, the CT Rules table is not the best.
    // Consider the case of three factors (A,B, and C) where C is nested in
    // the A*B (interaction). Using the simple reverse for loop the result
    // would be:
    //
    // Term      Estimates
    // A         σ²ε + 4σ²C(A*B) + 16Σ²A
    // B         σ²ε + 4σ²C(A*B) + 16Σ²B
    // C(A*B)    σ²ε + 4σ²C(A*B)
    // A*B       σ²ε + 8Σ²A*B + 4σ²C(A*B)
    // Residual  σ²ε
    //
    // Note that A*B should be "σ²ε + 4σ²C(A*B) + 8Σ²A*B", that is the
    // component 8Σ²A*B should be the last component. But because it is an
    // interaction, the main factor C (nested inside it) has precedence and
    // created this effect. So, to achieve the desired effect, while
    // traversing the list of components from the Error/Residual to the main
    // factors, we "save" the component corresponding to the term being
    // considered ('i') into a buffer and only add it to the list of
    // components ('components') after all other variance components have
    // been added.


    for(let i = 0, len = terms.length - 1; i < len; i++ ) {

      table += '<tr><td>' + terms[i].name + '</td>';
      
      let components = [], name = '', vc = '&sigma', compname = '', maincomp='';

      // Start in the Error term ( index terms.length-2 ) and go upwards
      // until term 0 (first main factor)

      for ( let j = terms.length - 2; j >= 0; j--) {
        if( terms[i].varcomp[j] > 0 ) {
          if( ( terms[j].name === 'Error' ) || ( terms[j].name === 'Residual' ) ) name = '&epsilon;';
          else name = terms[j].name;
          if( terms[j].type === RANDOM ) vc = '&sigma;';
          else vc = '&Sigma;';
          if( terms[i].varcomp[j] === 1 ) compname = vc+'<sup>2</sup><sub>' + name + '</sub>';
          else compname = terms[i].varcomp[j].toString() + '&middot;'+vc+'<sup>2</sup><sub>' + name + '</sub>';
          if ( i != j ) components.push( compname );
          else maincomp = '<span class="ctcomp">'+compname+'</span>';
        }
      }
      components.push(maincomp);

      table += '<td>' + components.join(' + ') + '</td></tr>';
      
    }
    
    table += '</tbody></table></div>';
    
    
    c.innerHTML = table;
    
  } 
  /****************************************************************************/
  /*                                                                          */
  /*                              displayCells                                */
  /*                                                                          */
  /* This function displays a table with the list of ANOVA 'cell' also called */
  /* 'partials'. Each cell represents a unique combination between levels of  */
  /* all factors involved in the analysis, and contains the accummulated sums */
  /* of all observations ('sumx'), and sums of all squared observations       */
  /* ('sumx2'), together with other important quantities, such as 'average',  */
  /* 'median', 'variance' and number of replicates ('n')                      */
  /*                                                                          */
  /****************************************************************************/
  

  /****************************************************************************/
  /*                                                                          */
  /*                                 displayData                              */
  /*                                                                          */
  /*          This function displays all data in a form of a table            */
  /*                                                                          */
  /****************************************************************************/

  function displayData() {

    
    let tb = document.getElementById('datatab');

    let table = '<div class="ct" id="datatable"></div>';

    // Panel to transform data

    table += '<div class="ct">' +
      '<h3>Transformations</h3>'+
      '<p><input type="radio" name="transf" value="none"' +
      ' onclick="anova.transformData(0)" checked>None</p>' +
      '<p><input type="radio" name="transf" value="sqrt"' +
      ' onclick="anova.transformData(1)">&radic;X</p>' +
      '<p><input type="radio" name="transf" value="sqrt3"' +
      ' onclick="anova.transformData(2)">&#8731;X</p>' +
      '<p><input type="radio" name="transf" value="sqrt4"' +
      ' onclick="anova.transformData(3)">&#8732;X</p>' +
      '<p><input type="radio" name="transf" value="log"' +
      ' onclick="anova.transformData(4)">Log(X+1)</p>' +
      '<p><input type="radio" name="transf" value="ln"' +
      ' onclick="anova.transformData(5)">Ln(X+1)</p>' +
      '<p><input type="radio" name="transf" value="arcsin"' +
      ' onclick="anova.transformData(6)">arcsin(X)</p>' +
      '<p><input type="radio" name="transf" value="mult"' +
      ' onclick="anova.transformData(7)">X &times;' +
      ' <input type="number" id="multc" value="100"></p>' +
      '<p><input type="radio" name="transf" value="div"' +
      ' onclick="anova.transformData(8)">X &divide;' +
      ' <input type="number"  id="divc" value="100"></p>' +
      '<p><input type="radio" name="transf" value="pow"' +
      ' onclick="anova.transformData(9)">X&#8319;' +
      ' <input type="number"  id="powc" value="0.25"></p>' +
      '</div>';

    tb.innerHTML  = table;

    // Now calldisplaydataTable() to update data values as
    // a table on <div> 'datatable'

    displayDataTable();
  }

  /****************************************************************************/
  /*                                                                          */
  /*                              displayDataTable                            */
  /*                                                                          */
  /*    Display the table with data, either original or transformed, on the   */
  /*    data tab or pane.                                                     */
  /*                                                                          */
  /****************************************************************************/

  function displayDataTable() {


    let tb = document.getElementById( 'datatable' );

    // Build table header with factor names

    let table = '<table><thead><tr>';

    for(let i = 0, nf = factors.length; i < nf; i++ ) {
      table += '<th>' + factors[i].name + '</th>';
    }
    table += '<th>DATA</th></tr></thead><tbody>';

    let lcodes = '';

    // Go along all ANOVA cells in 'data'

    for( let i = 0, len = data.length; i < len; i++ ) {

      // Compute the level codes for each factor to be used by
      // all data values belonging to an ANOVA cell

      lcodes = '';

      for(let j = 0, ll = data[i].levels.length; j < ll; j++ ) {
        lcodes += '<td>' + data[i].levels[j] + '</td>';
      }

      // For each ANOVA cell display all of its data 'values' but
      // prepend the factor levels before

      for( let j = 0, cl = data[i].values.length; j < cl; j++ ) {
        table += '<tr>' + lcodes;
        table += '<td>' + data[i].values[j].toString() + '</td>';
        table += '</tr>';
      }
    }
    table += '</tbody></table>';

    tb.innerHTML = table;

  }


  /****************************************************************************/
  /*                                                                          */
  /*                              displayFactors                              */
  /*                                                                          */
  /*   This function displays a small table with the summary of the factors,  */
  /*   their types, names and number of levels, derived from the data file    */
  /*                                                                          */
  /****************************************************************************/

  /****************************************************************************/
  /*                                                                          */
  /*                        displayMultipleComparisons                        */
  /*                                                                          */
  /*  This function displays multiple comparison between averages of factors  */
  /*  or interactions levels for which the F statistics surpasses a given     */
  /*  rejection criterion, usually set in 'Settings' (default is 0.05)        */
  /*                                                                          */
  /****************************************************************************/
  
  function displayMultipleComparisons() {

        
    let d = document.getElementById('mtests'); 
    
    // Create the text as a whole bunch of HTML to avoid
    // multiple calls to the DOM structure
    
    // Provide two <divs>: one for selecting the type of test and the other
    // to display the results of the multiple tests, identified by the
    // id = 'mtest_results', but invisible (style="display:none") for now.

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

  /*******************************************************************************/
  /*                                                                             */
  /*                                 displayTerms                                */
  /*                                                                             */
  /* This function displays all ANOVA terms and their corresponding information  */
  /* (SS, DFs, levels, etc.)                                                     */
  /*                                                                             */
  /*******************************************************************************/
  
  
  /****************************************************************************/
  /*                                                                          */
  /*                               getCellsSS                                 */
  /*                                                                          */
  /*   This function computes uncorrected sums of squares (ss) and then       */
  /*   transform these into corrected sums of squares (SS). The algorithm is  */
  /*   complex and is explained below!                                        */
  /*                                                                          */
  /****************************************************************************/
 
  function getCellsSS() {

    
    // We will use these two lengths a lot, so cache them
    
    let tl = terms.length, dl = data.length;
    
    // Now, go along all terms...
    
    for( let i = 0; i < tl; i++ ) {
      
      // Extract the 'codes' for the current term. These are in the form
      // of an array with ones (for each factor included) and zeros (for
      // each factor excluded). Note that there is an additional code for
      // the "Error" in the end which is always 0 except for the "Error"
      // term itself. For a three-way ANOVA, [1,0,0,0], [0,1,0,0] and
      // [0,0,1,0] correspond to main factors, [1,1,0,0], [1,0,1,0], and
      // [0,1,1,0] correspond to first order interactions, and [1,1,1,0]
      // corresponds to the unique second order interaction.
      
      let c = terms[i].codes;
      
      // Compute the name of the 'term' by combining all names of included
      // factors separated by 'x'. 'nm' will hold the final name of the
      // current term ('i')
      
      let nm = [];
      
      for( let j = 0, l = c.length; j < l; j++ ) {
        if( c[j] == 1 ) nm.push( factors[j].name );
      }
      
      terms[i].name = nm.join('&times;');
      
      // For each term 'i' accummulate 'sumx', 'sumx2' and 'n' of for all
      // different levels (or combinations of levels) of factors included
      // in it. This is done by extracting from each 'cell' the
      // information about the different level codes filtered by a variable
      // 't' which excludes all factors not included in the current term 'i'.
      //
      // Go along all 'cells'...
      
      for( let j = 0; j < dl; j++ ) {
        
        // Read 'cells[].codes' but exclude information for factors
        // not in term 'i'
        
        let t = [];
        
        for( let k = 0; k < nfactors; k++ ) {
          if( c[k] === 1 ) t.push( data[j].codes[k] );
          else t.push( '-' );
        } 
        
        // Verify if the combination of 't' codes already exists in the
        // 'terms[i].levels' array
        
        let idx = terms[i].levels.indexOf( t.toString() );

        if( idx != -1 ) {
            
          // These combination of code levels is already in the
          // 'terms[i].levels' array. Accumulate 'sumx', 'sumx2',
          // and 'n' on the respective slot of the array ('idx')
          
          terms[i].sumx[idx] += data[j].sumx;
          terms[i].sumx2[idx] += data[j].sumx2;
          terms[i].n[idx] += data[j].n;
          
        } else { 
          
          // Else create a new combination of levels
          
          terms[i].levels.push(t.toString());
          terms[i].sumx.push(data[j].sumx);
          terms[i].sumx2.push(data[j].sumx2);
          terms[i].n.push(data[j].n);
          terms[i].nlevels++;
        }
      }
      
      // If there is nesting of factors inside other factors or within
      // interactions, the number of levels of a term denoting an
      // interaction will differ from the expected number of combinations
      // computed using al the levels of the terms involved in such
      // interaction. If so, we set variable 'nesting' to true. This will
      // be later used to correct SS terms taking into account nesting,
      // because in such a case some terms will be redundant, measuring
      // the same uncorrected sums of squares ('ss').
      
      if( terms[i].nlevels != terms[i].combins ) nesting = true;
      
      // Change the name of the "Error" to "Residual" if there are
      // nested factors
      
      if( nesting ) residual.name = 'Residual';
      
      // Now, for this particular term, check if the replicates ('n') for all
      // levels or level combinations are similar. If not, the analysis is
      //asymmetric and cannot be completed!
      
      for( let j = 0, nl = ( terms[i].n.length - 1 ); j < nl; j++ ) {
        if( terms[i].n[j] != terms[i].n[j+1] ) {
          alert('Asymmetrical data set. Analysis stopped!');
          return false;
        }  
      }
      
      // Compute averages and uncorrected sums of squares (ss) for each
      // combination of code levels.
      
      let v;
      for( let j = 0, nl = terms[i].nlevels; j < nl; j++ ) {
        terms[i].average[j] = terms[i].sumx[j]/terms[i].n[j];
        v = terms[i].sumx2[j] - Math.pow(terms[i].sumx[j],2)/terms[i].n[j];
        terms[i].ss += v;
      }
      
      // Now recompute corrected cells' sums of squares (SS) for all terms
      // by subtracting from the error term all cells' 'ss' of terms
      // (factors and interactions) involved in a given term. For example,
      // consider the following three factor ANOVA list of cells, with
      // factors A, B, and C (note that the last column in codes corresponds
      // to the "Error" term which is not a factor)
      //
      //  residuals.ss = 100
      //
      //  i     codes       ss
      // ------------------------
      //  0 [1, 0, 0, 0] {ss: 10}   // A
      //  1 [0, 1, 0, 0] {ss: 20}   // B
      //  2 [0, 0, 1, 0] {ss: 15}   // C
      //  3 [1, 1, 0, 0] {ss: 25}   // AxB
      //  4 [1, 0, 1, 0] {ss: 18}   // AxC
      //  5 [0, 1, 1, 0] {ss: 14}   // BxC
      //  6 [1, 1, 1, 0] {ss: 12}   // AxBxC
      //  7 [1, 1, 1, 1]            // Error term, 'ss' is in 'residual.ss'
      //
      // The SS for 'B' ('codes' = [0,1,0,0] and 'i' = 1) is:
      //
      // residual.ss - terms[1].ss => 100 - 20
      //
      // For SS for interaction 'B*C' ('codes' = [0,1,1,0], 'i' = 5) is:
      //
      // residual.ss - terms[1].SS - terms[2].SS - terms[5].ss =>
      //
      //                           => 100 - 20 - 15 - 14
      //
      // and so on...
      //
      // Note that for interactions we subtract the corrected sums of squares
      // ('SS') of the terms above the current one, and finally subtract its
      // own 'ss'.
      //
      // Note also, that because the array 'terms' is ordered by the
      // 'terms[].order' of terms (first order terms - main factors - are
      // first, second order terms - two-factor interactions - are next, and
      // so on, one can compute the above formula for any current term because
      // during its creation all other terms involved in its SS are already
      // present in the list of terms!
      
      if( terms[i].order == 1 ) {
        terms[i].SS = total.ss - terms[i].ss;        
      } else {
          
        // This is an interaction (the order is higher than 1).
        // Remember that the codes for the current interaction term are
        // already stored in vriable 'c' (which has at least two 1s).
        // Now check for all terms inserted before this (current) if they
        // have at least one of the factors involved in this term and have
        // none of the factors not involved

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
    
    let te = { idx: tl, name: residual.name,
               codes: new Array(nfactors+1).fill(1),
               order: terms[tl-1].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: residual.df,
               SS: residual.ss, ct_codes: new Array(nfactors+1).fill(1), 
               varcomp: [], MS: 0, P: 0, against: -2, F: 0, type: RANDOM };
               
    terms.push(te);
    
    let tt = { idx: tl+1, name: 'Total', codes: new Array(nfactors+1).fill(1),
               order: terms[tl].order+1, combins: 0, nlevels: 0, levels: [],
               sumx: [], sumx2: [], n: [], average: [], ss: 0, df: total.df,
               SS: total.ss, ct_codes: [], varcomp: [], MS: 0, P: 0,
               against: -2, F: 0, type: RANDOM };
               
    terms.push(tt);    
    
    
    return true;
  }   

  /****************************************************************************/
  /*                                                                          */
  /*                 Computation of homoscedasticity tests                    */
  /*                                                                          */
  /*    So far, only Cochran's C and Bartlett's tests are implemented.        */
  /*                                                                          */
  /****************************************************************************/

  function homogeneityTests() {


    let d = document.getElementById('homogen');

    d.innerHTML = '<div class="ct"><h2>Cochran\'s test</h2>' +
                  testCochran() +  '</div>';

    d.innerHTML += '<div class="ct"><h2>Bartlett\'s test</h2>' +
                   testBartlett() +  '</div>';

//     d.innerHTML += '<div class="ct"><h2>Levene\'s test</h2>' +
//                    testLevene() +  '</div>';

  }

  /****************************************************************************/
  /*                                                                          */
  /*                               Bartlett's test                            */
  /*                                                                          */
  /****************************************************************************/

  function testBartlett() {
      
    // Compute Bartlett's test
    //
    //           (N-k)*ln(s_p²) - Sum[(n_i-1)*ln(s_i²)]
    // X² =     ---------------------------------------
    //          1 + 1/(3*(k-1))*(Sum[1/(n_i-1)] - 1/(N-k))
    //
    // N    = Sum[n_i]
    // s_p² = Sum[(n_i-1)*s_i²]/(N-k)
    // k    = number of means being compared
    // n_i  = size for mean i (sample sizes must be similar: balanced analysis)
    // s_i² = variance of sample i
    //
    // An easier way to do this, well explained at
    // https://stattrek.com/online-calculator/bartletts-test.aspx
    // is as follows:
    //
    //         A - B
    // X² = -----------
    //      1 + (C * D)
    //
    // with
    //
    // A = (N-k)*ln(s_p²)
    // B = Sum[(n_i-1)*ln(s_i²)]
    // C = 1/(3*(k-1))
    // D = Sum[1/(n_i-1)] - 1/(N-k)
    //

    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels
    
    let k = data.length;
    
    // Compute N, the sum of all sample sizes. Since the present anova-web
    // only works with balanced data sets, summing all n_i's is equivalent
    // to multyplying the number of replicates by the number of 'cells' (k)
    
    let N = k * replicates;
    
    // Compute the pooled variance s_p² (pvar) Sum[(n_i-1)*s_i²]/(N-k)

    let pvar = 0;
    for( let i = 0; i < k; i++ ) {
      pvar += (data[i].n - 1 )*data[i].variance;
    }
    pvar = pvar/(N-k);


    // Compute A = (N-k)*ln(s_p²)

    let A = (N-k)*Math.log(pvar);

    // Compute B = Sum[(n_i-1)*ln(s_i²)]

    let B = 0;
    for( let i = 0; i < k; i++ ) {
      //  data[i].variance contain s_i² for this ANOVA cell
      B += ( data[i].n - 1 )*Math.log( data[i].variance );
    }    
    
    // Compute C = 1/(3*(k-1))

    let C = 1/(3*(k-1));
    
    // Compute D = Sum[1/(n_i-1) - 1/(N-k)]

    let D = 0;
    for( let i = 0; i < k; i++ ) {
      D += 1/(data[i].n-1);
    }
    D -= 1/(N-k);
    
    // Compute Bartlett's K value
    
    let bartlett_k = (A - B)/(1 + (C*D));
    
    let prob = 1.0 - jStat.chisquare.cdf(bartlett_k, k-1);
    if( prob > 1 ) prob = 1;
    if( prob < 0 ) prob = 0;
     
    let result = '';
    result += '<p>Bartlett\'s Test for <b><i>k</i> = ' + k.toString() +
              '</b> averages and <b>&nu; = ' + (k-1).toString() +
              '</b> degrees of freedom: <b>' + bartlett_k.toString() +
              '</b></p><p>P = <b>' + prob.toString() + '</b></p>';
    
    return result;
    
  }    
  

  /****************************************************************************/
  /*                                                                          */
  /*                               Cochran's C test                           */
  /*                                                                          */
  /****************************************************************************/


  function testCochran() {
      
    // Compute Cochran's C test which is a ratio between the largest sample
    // variance over the sum of all sample variances. 'maxvar' will hold
    // the largest variance, whilst 'sumvar' will keep the sum of all
    // variances
    
    let maxvar = 0;
    let sumvar = 0;
    
    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels
    
    let k = data.length;
    
    // The corresponding degrees of freedom for each average (which should be
    // equal for balanced analysis) are computed from 'replicates' - 1
    
    let df = replicates - 1;
    
    // Find all variances, sum them all, find the largest and divide
    // by the sum of all variances. This is the Cochran's test
    
    for( let i = 0; i < k; i++ ) {
      if ( data[i].variance > maxvar ) maxvar = data[i].variance;
      sumvar += data[i].variance;
    }
    
    let cochran_C = maxvar/sumvar;
    
    // To compute the probabilty of obtaining a value of the C statistic larger
    // than the resulting C value we use the algorithm which was implemented in
    // 'mwanova.cgi' which behaves quite well for most cases but produces some
    // erroneous probabilities in marginal cases. For example, a C = 0.218533,
    // with 8 means and 2 degrees of freedom (real case in '3-way.txt')
    // produces a P = 1.42385557279749! According to Igor Baskir
    // <baskir_At_univer.kharkov.ua> if the probability is larger than 1 one we
    // must use the equation P = Math.abs( Math.ceil(P) - P ). However, this
    // works when the F cummulative distribution function used in the algorithm
    // below actually gives the probability of obtaining a value similar or
    // larger than F ('fprob' in mwanova.cgi does that), but not when it gives
    // the probability of obtaining a vlaue equal or smaller than F as many
    // functions do (jStat, excel's F.INV, libreoffice FINV, etc)
    //
    // Apparently the equation  P = Math.abs( Math.floor(P) - P ) seems to hold
    // in many cases...
    
    let prob = 0.0;
    if( ( cochran_C > 0 ) && ( k > 1 ) ) {
      prob = jStat.centralF.cdf(( 1/cochran_C -1 )/(k-1),((k-1)*df),df)*k;
      //console.log(prob, (1/c-1)/(k-1));
      if( prob > 1 ) prob = Math.abs( Math.floor(prob) - prob );
     }

    //let f = (1/c - 1.0)/(k - 1.0);
    //P = jStat.centralF.cdf(f, df * (k - 1.0), df) * k;

    let result = '';
    result += '<p>Cochran\'s Test for <b><i>k</i> = ' +
              k.toString() + '</b> averages and <b>&nu; = ';
    result += df.toString() + '</b> degrees of freedom: <b>' +
              cochran_C.toString() + '</b></p>';
    result += '<p>P = <b>' + prob.toString() + '</b></p>';
    
    // Because of the problems mentioned above, and the fact that there is not
    // a true CDF function for Cochran's C, we also provide critical values
    // for alpha = 0.1, 0.05 and 0.01 using the formula
    //
    // C[alpha, df, K] = 1/[1 + (k-1)/(probF(1 - alpha/k, df, df*(k-1)))]
    //
    // Note that we provide '1 - alpha/k' as first argument to the F inverse
    // distribution instead of the 'alpha/k' seen in standard formulas because
    // jStat.centralF.inv will return the left tail probability of F instead
    // of the required right tail probability
    
    let cv10 = 0;
    let cv05 = 0;
    let cv01 = 0;
    
    cv10 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.10/k, df, df*(k-1))));
    cv05 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.05/k, df, df*(k-1))));
    cv01 = 1/(1 + (k-1)/(jStat.centralF.inv(1-0.01/k, df, df*(k-1))));
    
    result += "<p>Critical values for &alpha;</p>";
    result += "<p><i>0.10</i>: " + cv10.toString() + ", hence variances are ";
    result += (cochran_C > cv10 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p><i>0.05</i>: " + cv05.toString() + ", hence variances are ";
    result += (cochran_C > cv05 ? "heterogeneous":"homogeneous");
    result += "</p>";
    result += "<p><i>0.01</i>: " + cv01.toString() + ", hence variances are ";
    result += (cochran_C > cv01 ? "heterogeneous":"homogeneous");
    result += "</p>";

    return result;
    
  }


  /****************************************************************************/
  /*                                                                          */
  /*                               Levene's W test                            */
  /*                                                                          */
  /****************************************************************************/


  function testLevene() {

    // The Levene's W test is
    //
    //      (N-k)   Sum[ N_i*(Z_i. - Z_..)² ]
    // W =  ----- * -------------------------
    //      (k-1)   Sum[ Sum(Z_ij - Z_i.)² ]
    //
    // k    = number of means being compared
    // N    = Sum[N_i]
    // N_i  = size for mean i (sample sizes must be similar: balanced analysis)
    // Z_i. = mean of group i
    // Z_.. = average of Z_ij
    // Z_ij = | Y_ij - Y_i. |
    //
    // Y_ij = individual observation
    // Y_i. = median of cell or group i
    //
    // These quantities are already computed from the information on the
    // 'cells' array, which has the sum of Z_ij's and the sum of squared
    // Z_ij's per combinaton of levels of factors, plus the averages Z_i.
    // for each combination.

    // k denotes the total number of averages involved in the test,
    // determind by all possible combinations between factor levels

    let k = data.length;

    // Compute N (total number of observations)
    let N = 0, W = 0;
    for ( let i = 0; i < k; i++ ) N += data[i].n;

    W = (N-k)/(k-1);

    // Compute Z_ij = Sum( |Z_ij - Median_i| )

    let Zij = 0, Z = 0;
    for( let i = 0; i < k; i++ ) {
      for( let j = 0; j < data[i].values.length; j++ ) {
        Zij += Math.abs( data[i].values[j] - data[i].median );
      }
    }

    // Compute the numerator Sum[ N_i*(Z_i. - Z_..)² ]
    // Z_i. are the group means
    // Z_.. is the grand mean
    // To alculate the above mentioned quantity it's
    // better to calculate the sum of all means and the
    // sum of all squared means. The formula
    //
    // Sum Z_i² - (Sum )²/N is equivalent to
    //
    // Sum[ N_i*(Z_i. - Z_..)² ]
//
//     let A = 0, a1;
//     for( let i = 0; i < k; i++ ) {
//       a1 = partials[i].sumx2 - Math.pow(partials[i].sum, 2)/partials[i].n;
//       A += partials[i].n * a1;
//     }
//
//     // Compute the denominator Sum[ Sum(Z_ij - Z_i.)² ]
//
//     let B = 0, sumx = 0, sumx2 = 0, nt = 0;
//     for( let i = 0; i < k; i++ ) {
//       sumx  += partials[i].sum;
//       sumx2 += partials[i].sumx2;
//       nt    += partials[i].n;
//     }
//     let b1 = sumx2 - Math.pow(sumx,2)/nt;
//
//     //console.log(W);
//     console.log(data)
//     //console.table(partials);
//
//     // The corresponding degrees of freedom for each average (which should be
//     // equal for balanced analysis) are computed from 'replicates' - 1
//
    let df = replicates - 1;

    let prob = 0.0, levene_w = 0.0;

    let result = '';
    result += '<p>Levene\'s Test for <b><i>k</i> = ' +
              k.toString() + '</b> averages and <b>&nu; = ';
    result += df.toString() + '</b> degrees of freedom: <b>' +
              levene_w.toString() + '</b></p>';
    result += '<p>P = <b>' + prob.toString() + '</b></p>';

    return result;

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
                factors[j] = {};
                let name = li[j];
                
                // Factor names ending in '*' are of type 'RANDOM',
                // otherwise they are of type 'FIXED'

                
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
                

                // Compute the subscript for the current factor
                // starting in 'i' (the first factor) which has
                // ASCII charcode 105. This will be needed in
                // the CT Rules procedure later on...
                
                factors[j].subscript = String.fromCharCode( j + 105 );
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
        for ( let i = 0, len = elem.length; i < len; i++ ) {
          elem[i].innerHTML="";
        }
        
        
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

  /*************************************************************************/
  /*                                                                       */
  /* General configuration settings for ANOVA                              */
  /*                                                                       */
  /*************************************************************************/

  function settings() {

    let elem = document.getElementById("anovadisplay");
    let sets = document.getElementById("settings");

    if ( elem.style.display == "none" ) {
      elem.style.display = "block";
      sets.style.display = "none";
    } else {
      elem.style.display = "none";
      sets.style.display = "block";
    }
  }

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
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] = Math.sqrt( data[i].values[j] );
            }
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 2:
        if( min_value >= 0 ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] = Math.pow( data[i].values[j], 1/3 );
            }
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 3:
        if( min_value >= 0 ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] = Math.pow( data[i].values[j], 1/4 );
            }
          }
        } else alert('Cannot apply transformation to negative values!');
        break;
      case 4:
        if( min_value > 0 ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j]  = Math.log( data[i].values[j] + 1 );
              data[i].values[j] /= Math.log(10);
            }
          }
        } else alert('Cannot apply transformation to negative' +
                     'or null values!');
        break;
      case 5:
        if( min_value > 0 ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] = Math.log( data[i].values[j] + 1 );
            }
          }
        } else alert('Cannot apply transformation to' +
                     ' negative or null values!');
        break;
      case 6:
        if( (min_value >= 0) && ( max_value <= 1 ) ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] = Math.asin( data[i].values[j] );
            }
          }
        } else alert('Cannot apply transformation to values larger than 1' +
                     ' or smaller than 0!');
        break;
      case 7:
        for( let i = 0; i < data.length; i++ ) {
          for( let j = 0; j < data[i].values.length; j++ ) {
            data[i].values[j] *= multc;
          }
        }
        break;
      case 8:
        if( divc != 0 ) {
          for( let i = 0; i < data.length; i++ ) {
            for( let j = 0; j < data[i].values.length; j++ ) {
              data[i].values[j] /= divc;
            }
          }
        } else alert('Cannot divide by zero!');
        break;
      case 9:
        data.forEach( e => Math.pow( e.value, powc ) );
        break;
    }

    // Reset data structures

    cleanVariables();

    // Restart the ANOVA by computing 'cells' or 'partials'

    computeCells();

    displayDataTable();

  }
  
  /*************************************************************************/
  /*                                                                       */
  /*                         utilityFunctions                              */
  /*                                                                       */
  /* This file joins a group os small functions necessary for the program  */
  /* normal operation                                                      */
  /*                                                                       */
  /*************************************************************************/


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
    
    // We should redisplay the ANOVA table as some of the
    // terms may now be statistically significant. Moreover,
    // multiple tests may also have to be run again...
     
    displayANOVA();
    
  }

  /*************************************************************************/
  /*                                                                       */
  /*                           setMTAlpha                                  */
  /*                                                                       */
  /* This function sets/changes the rejection criterion (alpha) for the    */
  /* _a_posteriori_ Multiple Comparison Tests. The criterion is necessary  */
  /* because while comparing pairs of averages, starting on the two most   */
  /* different (in magnitude) one has to decide when they are equal (thus  */
  /* stopping the whole sets of comparisons) or not, moving on to other    */
  /* compariosns                                                           */
  /*                                                                       */
  /*************************************************************************/


  function setMtAlpha() {
    let mta = document.getElementById('mtests_alpha').value;
    if ( mta != null ) {
      mt_rejection_level = parseFloat(mta);
      if ( mt_rejection_level != NaN) {
        if(rejection_level > 1) rejection_level = 0.9999999;
        if(rejection_level < 0) rejection_level = 0.0000001;

        console.log(mt_rejection_level)

        // We should redisplay the ANOVA table as some of the
        // terms may now be statistically significant. Moreover,
        // multiple tests may also have to be run again...

        buildMultipleComparisons();
        multipleTests();
      } else {

        // someone failed to provide a usable rejection level!
        // Reset it to default
        mt_rejection_level = DDEFAULT_REJECTION_LEVEL;
      }
    }
  }

  /*************************************************************************/
  /*                                                                       */
  /*                          ignoreInteractions                           */
  /*                                                                       */
  /*  Setting 'ignoreinteractions' to false, will show results of          */
  /*  _a_posteriori_ multiple comparison tests for factors involved in     */
  /*  significant interactions with other factors. This is not the correct */
  /*  behaviour                                                            */
  /*                                                                       */
  /*************************************************************************/

  function ignoreInteractions() {

    let h = document.getElementById("ignore_interactions");

    if ( ignoreinteractions === false ) ignoreinteractions = true;
    else ignoreinteractions = false;

  }


  /*************************************************************************/
  /*                                                                       */
  /*                               resetData                               */
  /*                                                                       */
  /* Here, we use the saved data values for each entry in the data list to */
  /* reset the transformed values. Note that after resetting the data it   */
  /* is necessary to clean all the intermediate calculation structures and */
  /* redo the analysis again!                                              */
  /*                                                                       */
  /*************************************************************************/

  function resetData() {

    let h = document.getElementsByClassName("tabcontent");
    for ( let i = 0, len = h.length; i < len; i++ ) h[i].innerHTML = "";

    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;

    for( let i = 0; i < data.length; i++ ) {
      for( let j = 0; j < data[i].values.length; j++ ) {
        data[i].values[j] = data[i].originals[j];
        if ( data[i].values[j] > max_value ) max_value = data[i].values[j];
        if ( data[i].values[j] < min_value ) min_value = data[i].values[j];
      }
    }

    console.log("Here")

    cleanVariables();

    // Start the ANOVA by computing 'cells' or 'partials' and then
    // computing the 'terms' of the analysis

    computeCells();

    displayData();
  }


  /****************************************************************************/
  /*                                                                          */
  /*                               resetAnalysis                              */
  /*                                                                          */
  /*  This function clears all 'global' variables of this module (anova) and  */
  /*  also clears the DOM nodes related with the ANOVA                        */
  /*                                                                          */
  /****************************************************************************/

  function resetAnalysis() {


    // Clear results in all <divs> of class 'anovaTabContents' which are
    // children of <div id='anova'>

    let s = document.getElementsByClassName('tabcontent')
    for( let i = 0, len = s.length; i < len; i++ ) {
      if (typeof(s[i]) !== 'undefined' && s[i] !== null) s[i].innerHTML = '';
    }

    // Reset main variables

    nfactors = 0;
    factors  = [];
    data     = [];
    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: 'Error', df: 0, ss: 0};
    nesting = false;
    max_value = Number.MIN_SAFE_INTEGER;
    min_value = Number.MAX_SAFE_INTEGER;
  }

  /*************************************************************************/
  /*                                                                       */
  /*                        cleanVariables                                 */
  /*                                                                       */
  /* Everytime we reset or transform data we ned to recompute all main     */
  /* variables for the ANOVA and eventually _a_posteriori_ multiple tests  */
  /*                                                                       */
  /*************************************************************************/

  function cleanVariables() {

    for( let i = 0; i < factors.length; i++ ) {
      factors[i].name = factors[i].orig_name;
      factors[i].nlevels = factors[i].levels.length;
      factors[i].nestedin = new Array( nfactors ).fill(0);
      factors[i].depth = 0;
    }

    terms    = [];
    mcomps   = [];
    corrected_df = 0;
    replicates = 0;
    total = {df: 0, ss: 0};
    residual = {name: "Error", df: 0, ss: 0};
    nesting = false;

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
    openDataFile: openDataFile,
    resetData: resetData,
    transformData: transformData,
    multipleTests: multipleTests,
    settings: settings,
    ignoreInteractions: ignoreInteractions
    
  } // End of 'return' (exported function)
  
})();


/*
 * Function used to 'simulate' a tab behaviour for each factor
 * that is created. By selecting the <a> element corresponding
 * to a given factor, the area showing the level names is 
 * displayed. 
 */
 
function selectTab(name) {
  let tabs = document.getElementsByClassName('tabs');
  for (let i = 0, len = tabs.length; i < len; i++) {
    if(tabs[i].name == name ) tabs[i].classList.add('selected');
    else tabs[i].classList.remove('selected');  
  }    
    
  // Get all elements with class='tabcontent' and hide them
  // showing only the one selected  
  let tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0, len = tabcontent.length; i < len; i++) {
    if ( tabcontent[i].id == name ) tabcontent[i].style.display = 'block';
    else tabcontent[i].style.display = 'none';
  }
}
                 
// Start when document is completely loaded 

document.addEventListener('DOMContentLoaded', function () {




  // Hide all tab contents
  let b = document.getElementsByClassName('tabcontent');
  for(let i = 0; i < b.length; i++) b[i].style.display = 'none';

  let s = document.getElementById('settings');
  s.style.display = 'none';


  document.getElementById('openFile').onclick = function() {
    document.getElementById('loadFile').click()
  };

  document.getElementById('loadFile').onchange = function() {
    anova.openDataFile();
  };

  document.getElementById('activate_settings').onclick = function() {
    anova.settings();
  };
    
});
