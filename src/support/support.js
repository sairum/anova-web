let docs = [
            { href: 'ander1982.pdf',
              desc: 'Anderson, M. (1982) Female choice selects for extreme tail length in a widowbird. Nature 299: 818-820.'
            },
            { href: 'dayquin1989.pdf',
              desc: 'Day, R.W. and Quinn, G.P. (1998) Comparisons of treatments after an analysis of variance in ecology, Ecol. Monogr., 59(4): 433-463.'
            },
            { href: 'dixon_al2006.pdf',
              desc: 'Dixon, L.A. et al. (2006) Analysis of artificially degraded DNA. Forensic Sci. Int., 164: 33–44'
            },
            { href: 'hurl1984.pdf',
              desc: 'Hurlbert, S.H. (1984) Pseudoreplication and the Design of Ecological Field Experiments. Ecol. Monogr. 54(2): 187-211.'
            },
            { href: 'peterman1990.pdf',
              desc: 'Peterman, R.M. (1990) Statistical Power Analysis can improve Fisheries Research and Management. Can. J. Fish. Aquat. Sci., 47: 2-15.'
            },
            { href: 'unde1993.pdf',
              desc: 'Underwood, A.J. (1993) The mechanics of spatially replicated sampling programmes to detect environmental impacts in a variable world. Austr. J. Ecol. 18(1): 99-116.'
            },
            { href: 'underwood1991.pdf',
              desc: 'Underwood, A.J. (1991) The Logic of Ecological Experiments: A Case History From Studies of the Distribution of Macro­Algae on Rocky Intertidal Shores. J. Mar. Biol. Assoc. UK, 71(4): 841-866.'
            }];



document.addEventListener('DOMContentLoaded', function () {

  let elem = document.getElementById('main');

  console.log(elem);
  let table = '<table>';
  for ( r of docs ) {
    table += '<tr><td><a href="' + r.href + '" target="_blank" ' +
             'rel="noopener noreferrer">' + r.desc + '</a></td></tr>';
  }
  table += '</table>';

  elem.innerHTML = table;
});
