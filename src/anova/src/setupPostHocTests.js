  /****************************************************************************/
  /*                                                                          */
  /*                            setupPostHocTests                             */
  /*                                                                          */
  /*  This function sets up the area to display Post Hoc tests (also known as */
  /*  a posteriori multiple comparison tests) between averages of factors or  */
  /*  interactions for which the F statistics surpass a given rejection       */
  /*  criterion, usually set in 'Settings' (default is 0.05)                  */
  /*                                                                          */
  /****************************************************************************/
  
  function setupPostHocTests() {

    //#DEBUG
    //console.log('displayMultipleComparisons() called');
    //!DEBUG
        
    let d = document.getElementById('mtests');
    
    // Create the text as a whole bunch of HTML to avoid
    // multiple calls to the DOM structure
    
    // Provide two <divs>: one for selecting the type of test and the other
    // to display the results of the multiple tests, identified by the
    // id = 'mtest_results', but invisible (style="display:none") for now.

    let text = '<div>' +
            '<h3>Multiple Comparison Tests</h3>' +
            '<p><select id="mtest" onchange="anova.computePostHocTests()">' +
            //'<option value="duncan">Duncan</option>' +
            '<option value="snk" selected>Student-Newman-Keuls (SNK)</option>' +
            '<option value="tukey">Tukey (HSD)</option></select></p>' +
            '<div id="mtest_results" style="display: none;"></div>' +
            '</div>';
    
    d.innerHTML = text;
  }
