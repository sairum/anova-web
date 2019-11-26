  
  /*
   * Add a factor
   */
  
  function addFactor() {
    // Grab values from HTML inputs
    let fname    = document.getElementById('fname');
    let levels   = document.getElementById('levels');
    let ftype    = document.getElementById('ftype');
    let nestedin = document.getElementById('nestedin');
    // Current number of factors 
    let fnum     = factors.length;
    // Verify factor name! Trim white spaces and replace spaces by underscores
    let name = fname.value.trim().replace(/\s/gi, "_");
    // Names should consist only of alphanumeric characters a-z, A-Z, 0-9, plus 
    // the characters '.', '-', '+', and '_'. All other characters are illegal!
    // The '*' is out of the list because it is used to identify a 'random' factor
    if( ( name.match( /^[0-9a-z-.+_]+$/i ) ) && ( name.length > 0 ) ) {
      // The provided name is OK. Check if it already exists in the list of factors
      let duplicate = false;  
      if( factors.length > 0 ) {
        for (let i = 0; i < factors.length; i++ ) {
          if( factors[i].name == name ) duplicate = true;
        }
      }
      if( !duplicate ) {
        // OK, Let's create a new factor
        let f = {};
        f.name = name;
        // Keep the original name (i.e. without any reference
        // to factors where this is nested in). This is important
        // for data generation
        f.orig_name = name;
        f.levels = parseInt(levels.value);
        f.true_levels = f.levels;
        f.ftype = ftype.value;
        f.nestedin = [];
        f.effects = [];
        f.lcodes = [...Array(f.levels).keys()];
        (nestedin.value == "-")?f.nested=false:f.nested=true; 
        // 'newterms' will hold all new terms that will appear after adding the 
        // current factor. It includes the factor being created plus any interactions
        // which involve it and other existing factors.
        let newterms = [];
        if( !f.nested ) {
          // The new factor is a regular orthogonal factor
          newterms.push(name); 
          // After adding the new factor compute interactions with all other
          // factors, and corresponding interactions, already entered and stored
          // in the variable 'terms'
          for ( let i = 0; i < terms.length; i++ ) newterms.push(terms[i] + "*" + name);
        } else {
          // The new factor is nested into others. It is obligatorily a 'random' 
          // factor, so change its type.   
          f.ftype = 'random';
          // Update its name
          f.name = name + "(" + nestedin.value + ")";
          // Check if the current factor is nested into another factor or
          // into an interaction of factors. This makes a lot of difference 
          // in the computation of the levels of the current factor. Try to
          // find the name in 'nestedin.value' in the list of factor names.
          // If it is there, its because this particular factor is nested 
          // into a main factor. If it's not there, it's because the current
          // factor is listed into an interaction!
          
          let n = nestedin.value.split(/[(*)]/);
          n = n.filter(Boolean); // Remove empty elements
          for( let i = 0; i < n.length; i++ ) {
            let x = factors.find(obj => obj.orig_name === n[i]);
            if(x !== undefined ) {
              let idx = factors.indexOf(x);
              f.nestedin.push(idx);
              f.true_levels *= x.levels;
            } 
          }
          // Readjust level codes to the new number of levels
          f.lcodes = [...Array(f.true_levels).keys()];

          // Add the new factor with its name already formatted
          // to the newterms list
          newterms.push( f.name ); 
          // Compute all interactions of this factor with other terms already
          // in the list of terms which do interact with it. This boils download
          // to excluding all terms involving factors where the current one is 
          // nested in. So search all terms for the presence of factors in the 
          // list 'nestedin.value' (passed by the HTML form)
          for ( let i = 0; i < terms.length; i++ ) {
            if(interacts( nestedin.value, terms[i])) 
                newterms.push(terms[i] + "*" + f.name);
          }  
        }

        // Finally, concatenate the new terms created for the new factor
        // with all the terms already created (in 'terms' list)
        for ( let i = 0; i < newterms.length; i++ ) terms.push(newterms[i]);
        // Update 'model' tab
        let model = document.getElementById('model');
        model.innerHTML = "X = &mu; + " + terms.join(" + ") + " + &epsilon;";
        // Update <select> options for 'nestedin' and enable it
        nestedin.disabled = false;
        // Add 'newterms' to the 'nestdin' <options>
        let opt;
        for ( let i = 0; i < newterms.length; i++ ) {
          opt = document.createElement('option');
          opt.value = newterms[i];
          opt.appendChild( document.createTextNode(newterms[i]) );
          nestedin.appendChild(opt);
        }
        // Update 'factors' list
        factors.push(f);
        // Compute all combinations of factor levels
        // assuming all factors are orthogonal. This will
        // be corrected later
        computeLevels(0);
        // Recode levels of nested factors
        recodeNestedFactors();
        //console.log(combins);
        //console.log(recoded);
        // Set up the fields to define factor level names
        setupLevels(fnum);
        // Reset the new factor form
        fname.value = "";
        levels.value = 2;
        ftype.value = 'fixed';
        nestedin.value = '-';
        
        let elem = document.getElementById("generate");  
        elem.disabled = false;
        
      } else {
        console.log('good but duplicate name:' + name)  
        //fn.setCustomValidity("Invalid field.");
      }    
    } else {
      console.log('bad name:' + name) 
    }   
    //console.log(factors)
  }

