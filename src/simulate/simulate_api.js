  return {
    addFactor: addFactor,
    select: select,
    reset: reset,
    generate: generate,
    download: download,
    label: label,
    separator: separator
  };
}());


document.addEventListener('DOMContentLoaded', function () {
  
  // Hide the results tab
  document.getElementById("results").style.display = "none";
  
  // Initialize the chart
  chart.render();
  
  document.getElementById("average").addEventListener("change", function () { 
    chart.setAverage(this.value) 
  });
   
  document.getElementById("stdev").addEventListener("change", function () { 
    chart.setStdev(this.value) 
  });
});  
