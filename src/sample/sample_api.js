  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interacting with   */
  /* the dummy object, keeping its internals hidden from the standard user */
  /*                                                                       */
  /*************************************************************************/
  
  return {
    setAccordion: setAccordion,
    normGenerate: normGenerate,
    normReset: normReset,
    setVar: setVar,
    setPrecision: setPrecision,
    switchDecSep: switchDecSep
    
  } // End of 'return' (exported function)
  
})();
 
document.addEventListener('DOMContentLoaded', function () {
    
  sample.setAccordion(); 
});    
