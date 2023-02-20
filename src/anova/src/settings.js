  /*************************************************************************/
  /*                                                                       */
  /* General configuration settings for ANOVA                              */
  /*                                                                       */
  /*************************************************************************/

  function settings() {

    let elem = document.getElementById("anovadisplay");
    let sets = document.getElementById("settings");

    if ( elem.style.display == "none" ) {
      elem.style.display = "block";
      sets.style.display = "none";
    } else {
      elem.style.display = "none";
      sets.style.display = "block";
    }
  }

