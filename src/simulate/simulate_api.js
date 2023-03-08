
  /****************************************************************************/
  /*                                                                          */
  /*   Here, we export several functions that allow us to interact with the   */
  /*   simulate object, keeping its internals hidden from the standard user   */
  /*                                                                          */
  /****************************************************************************/

  return {
    addFactor: addFactor,
    selectTab: selectTab,
    resetData: resetData,
    generateData: generateData,
    downloadData: downloadData,
    changeLevelLabel: changeLevelLabel,
    enableFactor: enableFactor
  };
}());


document.addEventListener('DOMContentLoaded', function () {
  
  // Hide the results tab
  document.getElementById("results").style.display = "none";

//   document.getElementById("fname").addEventListener("change", function () {
//     ui.enableFactor();
//   });
  
  // Initialize the chart
  chart.render();
  
  document.getElementById("average").addEventListener("change", function () { 
    chart.setAverage(this.value) 
  });
   
  document.getElementById("stdev").addEventListener("change", function () { 
    chart.setStdev(this.value) 
  });


});  
