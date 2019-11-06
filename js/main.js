  
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
    
    /*
     * Append 'debug' tab and corresponding <a href> if in Debug Mode
     */
    
    
    
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
