  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    reset: reset,
    sampleNormal: sampleNormal,
    sampleNormalNTimes: sampleNormalNTimes,
    setVar: setVar,
    setSTD: setSTD,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep,
    multipleFTests: multipleFTests,
    multipleTTests: multipleTTests,
    tTest: tTest
  } // End of 'return' (exported function)
  
})();

//  /*
//   * Automatically change variance when standard deviation changes
//   */
// 
// document.getElementById("norm_std").addEventListener("onchange", sample.set_normVar());
// document.getElementById("clt_std").addEventListener("onchange", sample.set_cltVar());
// 

document.addEventListener("DOMContentLoaded", function () {
    
  sample.setAccordion();
  
  
});    
