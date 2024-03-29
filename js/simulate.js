
  /****************************************************************************/
  /*                                                                          */
  /*                              Global Variables                            */
  /*                                                                          */
  /****************************************************************************/

var ui = (function() {
  'use strict';
  
  var factors = [],
      terms = [],
      combins = [],
      recoded = [],
      partial = [],
      effects = []; 

  // Number of decimal places
  var DPL =  10;

  /****************************************************************************/
  /*                                                                          */
  /*                                 addFactor                                */
  /*                                                                          */
  /* Adds a factor to the factor's list ('factors') together with all the     */
  /* necessary information for the next stage, which is generation of data    */
  /*                                                                          */
  /****************************************************************************/
  
  function addFactor() {

    // Grab values from HTML inputs

    let fname     = document.getElementById('fname');
    let levels    = document.getElementById('levels');
    let ftype     = document.getElementById('ftype');
    let nestedin  = document.getElementById('nestedin');

    // We need the element to disable it after inserting a new factor or
    // to


    // Current number of factors

    let fnum     = factors.length;

    // Verify factor name! Trim white spaces and replace spaces by underscores

    let name = fname.value.trim().replace(/\s/gi, "_");

    // Names should consist only of alphanumeric characters a-z, A-Z, 0-9,
    // plus the characters '.', '-', '+', and '_'. All other characters are
    // illegal! The '*' is out of the list because it is used to identify
    // 'random' factors

    if( ( name.match( /^[0-9a-z-.+_]+$/i ) ) && ( name.length > 0 ) ) {

      // The provided name is OK. Check if it already exists in the list of
      // factors

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
        f.lcodes = [];

        //f.lcodes = [...Array(f.levels).keys()];
        for ( let i = 0; i < f.levels; i++ ) {
          f.lcodes.push( i.toString() );
        }
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

          // The new factor is nested into others. It is mandatorily a 'random'
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
          //f.lcodes = [...Array(f.true_levels).keys()];

          f.lcodes = [];
          for ( let i = 0; i < f.true_levels; i++ ) {
            f.lcodes.push( i.toString() );
          }

          // Add the new factor with its name already formatted
          // to the newterms list

          newterms.push( f.name );

          // Compute all interactions of this factor with other terms already
          // in the list of terms which do interact with it. This boils download
          // to excluding all terms involving factors where the current one is 
          // nested in. So search all terms for the presence of factors in the 
          // list 'nestedin.value' (passed by the HTML form)

          for ( let i = 0; i < terms.length; i++ ) {
            if(factorInteracts( nestedin.value, terms[i]))
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
        
        // Enable generation of data

        let elem = document.getElementById("generate");  
        elem.disabled = false;

        fname.value = '';
        
      } else {
        fname.value = '';
        alert('Factor name: "' + name + '" already exits!\n' +
              'Please, enter a different factor name.');
      }    
    } else {
      fname.value = '';
      alert('Bad factor name: "' + name + '"\n' +
            '(The name is empty or contains illegal\n' +
            'characters such as *, ?, etc.)\n\n' +
            'Please, enter an alpha-numeric factor name.');
    }   
    //console.log(factors)

    // Disable the 'Add Factor' button until a new name is provided

    let e = document.getElementById('add_factor');
    e.disabled = true;

  }


  /****************************************************************************/
  /*                                                                          */
  /*                                changeLevellabel                          */
  /*                                                                          */
  /* This function changes a factor level's label everytime it is changed in  */
  /* the TAB corresponding to the factor level. It's a callback to 'onchange' */
  /* event of the corresponding input element in the TAB                      */
  /*                                                                          */
  /****************************************************************************/

  function changeLevelLabel(e) {

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
 

  /****************************************************************************/
  /*                                                                          */
  /*                             computeLevels                                */
  /*                                                                          */
  /* Build a list of all possible combinations of levels of factors assuming  */
  /* that all are orthogonal. Nested factor's levels do not combine with all  */
  /* the levels of the factors where they are nested in. This is corrected    */
  /* later on by recodeNestedFactors()                                        */
  /*                                                                          */
  /****************************************************************************/

  
  function computeLevels( f ) {
    if ( f == 0 ) combins = [];  
    if( f < factors.length ) {   
      if(typeof partial[f] === 'undefined') partial[f] = 0;  
      for (let i = 0; i < factors[f].levels; i++ ) {
        partial[f] = i;    
        computeLevels( f + 1 );
      }  
    } else {

        // Deep copy 'partial', otherwise combins array
        // will only have the last 'partial' created in
        // all its slots, because it's copied by reference!

      let t = [...partial];
      combins.push(t);
    }    
  }
  
 

  /****************************************************************************/
  /*                                                                          */
  /*                               createEffects                              */
  /*                                                                          */
  /* Randomly create effects by sampling deviations to the overall average    */
  /* using a normal distribution of "errors". The code used a simulated       */
  /* "coin" throw to decide if differences exist or not between the levels of */
  /* a given factor. This is currently commented out below: all factors are   */
  /* candidates to display differences, but chance may create so small        */
  /* differences that they won't show up as significant!                      */
  /*                                                                          */
  /****************************************************************************/
  
  function createEffects( average, stdev) {
    for( let i = 0; i < factors.length; i++) {

      // let x = jStat.uniform.sample( 0, 1 );

      factors[i].effects=[];

      for( let j = 0; j < factors[i].true_levels; j++ ) {

        //if( x > 0.5 ) {
          let e = jStat.normal.sample( average, stdev ); 
          factors[i].effects.push(e - average);
        //} else factors[i].effects.push(0);     


      }
    }    
  }
 

  /****************************************************************************/
  /*                                                                          */
  /*                                 downloadData                             */
  /*                                                                          */
  /*    Initially done without FileSaver.js but it had a wierd behaviour.     */
  /*    Sometimes, clicking in 'download' fired multiple clicks resulting in  */
  /*    a sequence of a couple of file downloads, some of them empty files!   */
  /*                                                                          */
  /****************************************************************************/
  
  function downloadData() {
    let text = document.getElementById("result").value.trim();  
  
//     let e = document.createElement('a');
//     e.setAttribute('href','data:text/plain;charset=utf-8,' +
//                     encodeURIComponent(text));
//     e.setAttribute('download', 'result.txt');
//     e.setAttribute('target', '_blank');
//     e.style.display = 'none';
//     document.body.appendChild(e);
//     e.click();
//     document.body.removeChild(e);   
      
    var blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'results.txt');  
  }


function enableFactor() {

  let e = document.getElementById('add_factor');

  e.disabled = false;

}

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


  /****************************************************************************/
  /*                                                                          */
  /*                                 generateData                             */
  /*                                                                          */
  /*                         Actually generate the data                       */
  /*                                                                          */
  /****************************************************************************/

  function generateData() {

    let fmt = {minimumFractionDigits: DPL};

    //Grab population parameters from HTML fields
    
    let seed = document.getElementById("seed").value,
        average = parseFloat(document.getElementById("average").value),
        stdev = parseFloat(document.getElementById("stdev").value),
        replicates = parseInt(document.getElementById("replicates").value);
    
    // jStat does not handle directly RNGs. To use a custom seed we have
    // to  resort to a user's defined RNG that allows seed setting. Here
    // we implement this with davidbau's "seedrandom.js" available at
    // https://github.com/davidbau/seedrandom
    
    if( seed != "" ) {
      var myRandom = new Math.seedrandom(seed.toString());
      jStat.setRandom(myRandom);
    }    
    
    createEffects( average, stdev );    
            
    let line = [], text = "", effect;
    
    // Build the header for the data
    
    for(let i = 0; i < factors.length; i++) {
      let nm = factors[i].orig_name;
      if(factors[i].ftype == 'random') nm += '*';
      line.push(nm);
    }  
    text = line.join(' ') + ' DATA\n';
    
    // Populate the data array
    
    for(let i = 0; i < recoded.length; i++) {
      line = [];
      effect = 0;
      for(let j = 0; j < factors.length; j++) {
        let level = recoded[i][j];
        effect += factors[j].effects[level];  
        line.push(factors[j].lcodes[level]);
      }
      let c = line.join(' ');
      for(let j = 0; j < replicates; j++ ) {
        let y = jStat.normal.sample(average, stdev);
        text += c + ' ' + (y+effect).toLocaleString( undefined, fmt ) + '\n';
      }
    }        
    
    let elem = document.getElementById("result");  
    elem.value = text;
    
    // Since the data exists, let's enable a button
    // to download it
    
    elem = document.getElementById("download");
    elem.disabled = false;

    //console.log(factors);

  }


  /****************************************************************************/
  /*                                                                          */
  /*                           recodeNestedFactors                            */
  /*                                                                          */
  /*                                                                          */
  /****************************************************************************/

  function recodeNestedFactors() {
    recoded = [...combins];
    for( let i = 0; i < recoded.length; i++ ) recoded[i] = [...combins[i]];
          
    for( let i = 0; i < factors.length; i++ ) {
      if( factors[i].nested ) {

        // Recode this factor  
        //console.log('Recoding factor ' + factors[i].name );

        let cmb = combins.length;  
        let cumlevs = [];
        var codes = [];
        let nest_list = factors[i].nestedin;
        let other = 1;
        let nestlevs=1;

        //console.log('Nested list     : ', nest_list.join(' '))

        for( let l = 0; l < i; l++ ) {
          let lev = factors[l].levels;
          if( l > 0 ) cumlevs[l]=cumlevs[l-1]*lev;
          else cumlevs[l] = lev; 
        } 
        for( let l = 0; l < factors.length; l++ ) {
          if( l < i ) {
            if( nest_list.indexOf(l) != -1 ) nestlevs *= factors[l].levels;
          } else {
            if (l != i) other *= factors[l].levels;
          }    
        }
        codes = [...Array(nestlevs*factors[i].levels).keys()];
        
        //console.log('Codes     : ', codes)
        //console.log('Cumulative: ', cumlevs)
        //console.log('Other     : ', other)
        //console.log('Nestlevels: ', nestlevs)
        
        for( let l = 0; l < i; l++) {
          if( nest_list.indexOf(l) == -1 ) {
            //split_repeat_codes( codes, cumlevs[l], factors[l].levels ); 
            let newcodes = [];
            let n = factors[l].levels;
            let blocks = cumlevs[l]/n;
            let chunks = codes.length/blocks;
            //console.log("Blocks: ", blocks," Chunks: ", chunks);
            let start = 0;
            for( let i = 0; i < blocks; i++ ) {
              let chunk = codes.slice(start, start+chunks);
              //console.log("Block " + i.toString() + ": " + chunk.join("-"));
              for( let j = 0; j < n; j++)
                for(let c of chunk) newcodes.push(c);
              //console.log("Start ", start," Chunks ", chunks," ", newcodes.join("-"));
              start += chunks;
            }

            let msg ='Repeating (' + codes.join(' ') + ') x ' + n.toString() +
                                 ' times: ';
            msg += '(' +  newcodes.join(' ') + ')';  

            //console.log(msg)

            codes = [...newcodes];
          }
        }
        
        //console.log(codes)   
        let newcodes = [];
        for(let c of codes) {
          for( let l = 0; l < other; l++) newcodes.push(c);
        }  
        
        // let msg ='Expanding (' + codes.join(' ') + ') x ' + other.toString()
        //                        + ' times: ';
        //msg += '(' +  newcodes.join(' ') + ')';  
        //console.log(msg)   
        for(let j = 0; j < recoded.length; j++) recoded[j][i] = newcodes[j];
      }     
    }    
  }

  

  /****************************************************************************/
  /*                                                                          */
  /*                                 resetData                                */
  /*                                                                          */
  /*                         Reset data structures                            */
  /*                                                                          */
  /****************************************************************************/

  
  function resetData() {
    factors = [];
    combins = []; 
    terms = [];
    partial = [];
    recoded = [];
    location.reload();
  }

  

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
  
  

  /****************************************************************************/
  /*                                                                          */
  /*                                setupLevels                               */
  /*                                                                          */
  /* This function sets up a HTML Form to allow changing the names of the     */
  /* levels of a factor. By default, levels are labeled with numeric codes    */
  /* (0, 1, 2, ...) but stored as strings. The fcunction makes sure that no   */
  /* duplicate level names are allowed per each factor.                       */
  /*                                                                          */
  /****************************************************************************/

  function setupLevels(fnum) {

    let f = factors[fnum];
    f.true_levels = f.levels;
    for ( let i = 0; i < f.nestedin.length; i++ ) {
      f.true_levels *= factors[f.nestedin[i]].levels;
    }  

    // Add an entry to the tab labels 

    let t = document.getElementById('tabs');
    let r = document.getElementById('tresults');
    let b = document.createElement('a'); 
    b.name = f.name;
    b.className = 'tabs';
    b.href = "#!";
    b.innerHTML = f.name;
    b.onclick = function () { selectTab(f.name) };
    t.insertBefore(b, r);

    // Add also a correspondent content area for the new factor
    // Label names will be defined here

    let cts = document.getElementById('tab-contents');
    let res = document.getElementById('results');
    let d = document.createElement('div'); 
    d.className = 'tabcontent';
    d.id = f.name;
    
    // At this stage the matrix 'recoded' holds
    // console.log(fnum,combins)
    console.log(f,combins,recoded);
    let text = '<h3>Labels for levels of Factor ' + f.name + '</h3><table>';
    for ( let i = 0; i < f.true_levels; i++ ) {
      text += '<tr><td><b>Level ' + (i+1).toString();
      // If this is a nested factor compute nesting levels
      if( f.nested ) {
        text += '</b> nested in ';
        let lst = [];
        for ( let j = 0; j < f.nestedin.length; j++ ) {
          lst.push( ' Level ' + factors[f.nestedin[j]].lcodes[combins[i][j]] +
                    ' of Factor ' + factors[f.nestedin[j]].name );
        }
        text += lst.join(' and ');
      }    
      text += '</td><td><input type="text" class="label" value="' +
              i.toString() + '" onchange="ui.changeLevelLabel(this)" ' +
              ' id="flabel.' + fnum + '.' + i.toString() + '"></td></tr>';
    }

    //console.log(f);
    //console.log(factors);
    //console.log(combins);

    text += "</table>";
    d.innerHTML = text;
    d.style.display = 'none';
    cts.insertBefore(d, res);      

  }    

  /****************************************************************************/
  /*                                                                          */
  /*   Here, we export several functions that allow us to interact with the   */
  /*   simulate object, keeping its internals hidden from the standard user   */
  /*                                                                          */
  /****************************************************************************/

  return {
    addFactor: addFactor,
    selectTab: selectTab,
    resetData: resetData,
    generateData: generateData,
    downloadData: downloadData,
    changeLevelLabel: changeLevelLabel,
    enableFactor: enableFactor
  };
}());


document.addEventListener('DOMContentLoaded', function () {
  
  // Hide the results tab
  document.getElementById("results").style.display = "none";

//   document.getElementById("fname").addEventListener("change", function () {
//     ui.enableFactor();
//   });
  
  // Initialize the chart
  chart.render();
  
  document.getElementById("average").addEventListener("change", function () { 
    chart.setAverage(this.value) 
  });
   
  document.getElementById("stdev").addEventListener("change", function () { 
    chart.setStdev(this.value) 
  });


});  
