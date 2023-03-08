
  /****************************************************************************/
  /*                                                                          */
  /*                                 selectTab                                */
  /*                                                                          */
  /* Function used to 'simulate' a tab behaviour for each factor that is      */
  /* created. By selecting the <a> element corresponding to a given factor,   */
  /* the area showing the level names is displayed.                           */
  /*                                                                          */
  /****************************************************************************/
  
  function selectTab( name ) {

    // Get all elements with class="tabcontent" and hide them

    let tabcontent = document.getElementsByClassName("tabcontent");

    for (let i = 0; i < tabcontent.length; i++) {
      if ( tabcontent[i].id == name ) tabcontent[i].style.display = "block";
      else tabcontent[i].style.display = "none";
    }
  }
  
  
