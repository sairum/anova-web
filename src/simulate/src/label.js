  /*
   * This function changes a factor's label everytime
   * it is changed in the TAB corresponding to the factor.
   * It's a callback to 'onchange' event of the corresponding
   * input element in the TAB
   */
  
  function label(e) {
    // The HTML element 'e.id' is a string concatenated
    // by '.' (dots) meaning that the dot is not an
    // allowed charater in labels!
    // id[0] = the string "flabel"
    // id[1] = index of factor (e.g, 0, 1, 2, etc)
    // id[2] = original level of factor (e.g. 0, 1, 2, etc)
    let id = e.id.split('.');
    let factor = parseInt(id[1]);
    let level  = parseInt(id[2]);
    // Since the name was changed (and this callback function
    // was called) the new label name is now in the 'e.value '.
    // Replace spaces by underscores
    let name = e.value.trim().replace(/\s/gi, "_");
    if( ( name.match( /^[0-9a-z+_-]+$/i ) ) && ( name.length > 0 ) ) {
      let found = factors[factor].lcodes.find(element => element === name);
      if ( found != undefined ) {
        // This label is present on another level!
        // Revert label factor to original numeric code
        factors[factor].lcodes[level] = level.toString();
        // and update HTML element
        e.value=level.toString();
        alert('This label name is already defined!\n' +
              'Please avoid duplicated names.\n')
      } else {
         factors[factor].lcodes[level] = name;
      }
    } else {
      if ( name.length == 0 ) {
        alert('Empty label name!')
      } else {
        alert('Label name includes illegal characters!\n' +
              '(space, *, ?, ., etc, are not allowed)\n')
      }
      // Revert label factor to original numeric code
      factors[factor].lcodes[level] = level.toString();
      // and update HTML element
      e.value=level.toString();
    }
    //console.log(factors)
  }
 
