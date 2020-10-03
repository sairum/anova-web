  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    sampleNormal: sampleNormal,
    sampleNormalMultipleTimes: sampleNormalMultipleTimes,
    normReset: normReset,
    cltReset: cltReset,
    set_normVar: set_normVar,
    set_cltVar: set_cltVar,
    set_FVar: set_FVar,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep,
    multipleFTests: multipleFTests,
    
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
