  
  /*************************************************************************/
  /*                                                                       */
  /* Here, we export several functions that allow us to interact with the  */
  /* anova object, keeping its internals hidden from the standard user     */
  /*                                                                       */
  /*************************************************************************/
  
  return {
  
    setAlpha: setAlpha,   
    setMtAlpha: setMtAlpha,    
    openDataFile: openDataFile,
    resetData: resetData,
    transformData: transformData,
    computePostHocTests: computePostHocTests,
    changeSettings: changeSettings,
    setSettings: setSettings,
    useAlpha: useAlpha,
    ignoreInteractions: ignoreInteractions,
    setPrecision: setPrecision
    
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


  //#DEBUG

  // Append 'debug' tab and corresponding <a href> if in Debug Mode

  let t = document.getElementById('tab-contents');
  let d = document.createElement('div');
  d.className = 'tabcontent';
  d.id = 'debug';
  t.appendChild(d);

  t = document.getElementById('tabs');
  d = document.createElement('a');
  d.name = 'debug';
  d.className = 'tabs';
  d.href = '#!';
  d.onclick = function () { selectTab('debug'); };
  d.innerHTML = 'Debug';
  t.appendChild(d);

  //!DEBUG


  anova.setSettings();

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
    anova.changeSettings();
  };

  document.getElementById('help').onclick = function() {
    window.open('docs/anova.html', '_blank', 'toolbar=no,scrollbars=yes,resizable=no,top=100,left=100,width=600,height=500');
  };
    
});
