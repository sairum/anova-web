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

    //#DEBUG
    console.log('displayMultipleComparisons() called');
    //!DEBUG
        
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
