
  /****************************************************************************/
  /*                                                                          */
  /*                         studentizedComparisons                           */
  /*                                                                          */
  /* This function computes Post Hoc tests based on the studentized range     */
  /* These include Student-Newman-Keules (SNK), Tukey (or HSD aka Honestly    */
  /* Significant Diference), or Duncan tests are all examples of this type of */
  // procedures. Duncan test will not be implemented for now as it depends on */
  /* a modified Studentized Range distribution, made by Duncan himself, but   */
  /* for which I know no CDF function. The paper describing a correction to   */
  /* Duncan's tabulated values is Harter (1960)                               */
  /*                                                                          */
  /****************************************************************************/

  function studentizedComparisons(test, fact, df, ms, avgs) {

    let fmt = {minimumFractionDigits: DPL};

    //console.log(avgs)  
    let t = "";
    let comps = [], p = 0;
    // t += '<p>' + fact.toString() + ' ' +
    //      df.toString() + ' ' + ms.toString() +'</p>';
    let total_range = avgs.length;
    let range = total_range;
    do {
      let times = total_range - range + 1; 
      for( let i = 0; i < times; i++ ) {
        let j = i + range - 1;

        // console.log( 'Compare level ' + avgs[i].level +
        //              ' against level ' + avgs[j].level );
        
        let q = Math.abs(avgs[i].average - avgs[j].average);

        q /= Math.sqrt( ms / avgs[i].n );

        if (test == 'tukey') p = 1 - jStat.tukey.cdf( q, total_range, df );
        if (test == 'snk')   p = 1 - jStat.tukey.cdf( q, range, df );

        // Duncan's test will not be implemented as it depends on a modified
        // Studentized Range distribution developed by Duncan himself but later
        // corrected by Harter (1960). One option is to inspect R code where
        // this distribution is implemented in several places...
        //
        // if (test == 'duncan' ) {
        //  console.log('Compare level ' + avgs[i].level + ' against level ' + avgs[j].level);
        //  p = 1-jStat.tukey.cdf(q, range, df);
        //  console.log('q=' + q.toString() + ' range=' + range.toString() + ' df=' +df.toString() + ' p=' + p.toString());
        //  console.log('p=0.05 range=' + range.toString() + ' df=' + df.toString() + ' q=' + jStat.tukey.inv(0.95, range, df).toString());
        // }
        
        if( p > mt_rejection_level ) {
          let included = false;
          for( let k = 0, kl = comps.length; k < kl; k++ ) { 
            if( ( i >= comps[k][0] ) && (j <= comps[k][1]) ) {
              included = true;
              break;
            }    
          }
          if(!included) {
            //comps.push({a1: i, a2: j, q: q, p: p});   
            comps.push([ i, j ]);  
            //t += '<p>' + i.toString() + ' == ' + j.toString() + '</p>';  
            //t += '<p>' + avgs[i].level + ' = ' + avgs[j].level +
            //     '    <i>(' + i.toString() + ' = ' + j.toString() +
            //     ')</i></p>';
            //console.log(q,p); 
          }  
        }
        //console.log(q,p); 
      }
      range--;  
    } while(range > 1);
    
    // Check wich levels of the target factor fall outside the homogeneous
    // groups in 'comps' and add them to the list.
    
    for( let i = 0, il = avgs.length; i < il; i++ ) {
      let included = false;  
      for ( let j = 0, jl = comps.length; j < jl; j++) {
        if( ( i >= comps[j][0] ) && ( i <=  comps[j][1] ) ) {
          included = true;
          break;
        }    
      }    
      if( !included ) {
        comps.push([i, i]);  
      }    
    }    
    
    comps.sort((a, b) => (a[0] >  b[0])? 1 : -1); 
    
    // console.log(comps)
    
    t += '<table>' +
         '<tr><th>Level</th><th>Average</th><th>n</th>';
    for( let i = 0, il = comps.length; i < il; i++ ) {
      t += '<th>&nbsp;</th>';
    }
    t += '</tr>';
    for( let i = 0, il = avgs.length; i < il; i++ ) {
      t += '<tr><td>' + avgs[i].level + '</td><td class="flt">' +
           avgs[i].average.toLocaleString( undefined, fmt ) +
           '</td><td>' +
           avgs[i].n.toString() + '</td>';
      for(let j = 0, jl = comps.length; j < jl; j++) {
        if(( i >= comps[j][0] ) && (i <= comps[j][1])) {
          t += '<td>&#9679;</td>';
        }

        else t += '<td>&nbsp;</td>';
      }
      t += '</tr>';
    }
    t += '</table>';
    return t;
  }

  /****************************************************************************/
  /*                                                                          */
  /*                           computePostHocTests                            */
  /*                                                                          */
  /* This function computes Post Hoc tests (differences between averages of   */
  /* levels of fixed factors). Only factor or interactions which display F    */
  /* statistics below the rejection criterion (usually 0.05) will be shown!   */
  /*                                                                          */
  /****************************************************************************/


  function computePostHocTests() {

    // studentized range statistics. Student Newman Keuls, Tukey, are
    // all based on studentized range Q.

    let studentized = ['snk', 'tukey'];

    // Grab the <select> element which holds the type of multiple test
    // to apply which is denoted by id='test'

    let elem = document.getElementById("mtest");

    let testName = '';

    for( let e of elem ) {
      if( e.selected ) {
        testName = e.value;
        break;
      }
    }

    // use 'elem' to point to a <div> which will hold the results
    // of the multiple tests (id='mtest_results')

    elem = document.getElementById("mtest_results");

    // If the selection is not 'None' (index 0)...

    let text = "";

    for( let m of mcomps ) {

      let dferr = m.df_against,
          mserr = m.ms_against,
          fcode = m.fcode;

      if ( m.excluded && !ignoreinteractions) continue;

      //Display a header for the multiple comparisos

      text += '<div class="ht">';
      if(m.type == 'interaction') {
        text += '<h2>Interaction ' + m.term + '</h2>';
      }
      text += '<h3>Multiple comparisons between levels of factor ' +
              m.fname + '</h3>';

      // Go along the whole list of comparisons for this term. It may be just
      //a single test if 'mcomps' is of type 'factor' (involves comparisons
      // between multiple averages), or it can be a series of tests, one for
      // each combination of levels of facto.rs whith which the one being
      // compared interacts with

      for(let a in m.averages) {

        // Check if this is an interaction. If so, specify the combination
        // of levels of interacting factors within which multiple tests are
        // being carried for factor 'mcomps[i].fcode'. The 'key' for the
        // 'mcomps[i].averages[]' array holds the combination of levels
        // involved with '-' for factors not included in the interaction
        // or the target factor itself.

        if( m.type == 'interaction' ) {
          let f = a.split(',');
          //console.log(f);
          let t = [];
          for(let j = 0, jlen = f.length; j < jlen; j++ ) {
            if( f[j] != '-' ) {
              t.push( 'level <i>' + factors[j].levels[f[j]] +
                      '</i> of factor ' + factors[j].name );
            }
          }
          text += '<h4>For ' + t.join(' and ') + '</h4>';
        }

        // Check if the multiple test is of type 'studentized range'
        // and if so pass the relevant information to a function
        // that computes several studentized range tests.

        if( studentized.indexOf(testName) != -1 ) {
          text += studentizedComparisons(testName,
                                         fcode,
                                         dferr,
                                         mserr,
                                         m.averages[a] );
        }
      }
      text += '</div>';
    }
    if( text == "" ) {
      text = '<h3>No multiple tests available!</h3>' +
             '<p>Are you sure there are significant differences ' +
             'in fixed factors?</p>';
    }
    elem.innerHTML = text;
    elem.style.display = 'block';

  }
