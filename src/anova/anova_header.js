"use strict";

var anova = (function () {
     
  /****************************************************************************/
  /*                                                                          */
  /*                              Global Variables                            */
  /*                                                                          */
  /****************************************************************************/


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


