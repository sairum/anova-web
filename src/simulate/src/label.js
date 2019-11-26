  /*
   * This function changes a factor's label everytime
   * it is changed in the TAB corresponding to the factor.
   * It's a callback to 'onchange' event of the corresponding
   * input element in the TAB
   */
  
  function label(e) {
    // Replace spaces by underscores  
    let name = e.value.trim().replace(/\s/gi, "_");
    if( ( name.match( /^[0-9a-z-.+_]+$/i ) ) && ( name.length > 0 ) ) {
      let id   = e.id.split('.');
      // id[0] has the text 'label'
      let factor = parseInt(id[1]);
      let level  = parseInt(id[2]);
      //console.log(factor, level, name);
      factors[factor].lcodes[level] = name;
    }
  }
 
