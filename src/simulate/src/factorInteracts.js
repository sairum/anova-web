
  /****************************************************************************/
  /*                                                                          */
  /*                                factorInteracts                           */
  /*                                                                          */
  /*   Find out if the factors where a factor is nested in (represented by    */
  /*   'nst') are present in a term 'trm'. If so, this function returns       */
  /*   false, meaning that this particular factor will not interact with      */
  /*   the term 'trm'. Note that the factor is never referenced here but for  */
  /*   the factors where it is nested in ('nst' comes from the selected       */
  /*   value of the <select id="nestedin"> element in the HTML                */
  /*                                                                          */
  /****************************************************************************/
  
  function factorInteracts( nst, trm ) {
    let f = nst.split(/[(*)]/).filter(Boolean);
    let t = trm.split(/[(*)]/).filter(Boolean);
    for ( let i = 0; i < f.length; i++ ) {
      if ( t.indexOf(f[i]) != -1 ) return false;
    }
    return true;
  }

