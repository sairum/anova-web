
  /****************************************************************************/
  /*                                                                          */
  /*                              Global Variables                            */
  /*                                                                          */
  /****************************************************************************/

var ui = (function() {
  'use strict';
  
  var factors = [],
      terms = [],
      combins = [],
      recoded = [],
      partial = [],
      effects = []; 

  // Number of decimal places
  var DPL =  10;
