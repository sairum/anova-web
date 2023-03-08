let docs = [
            { href: 'friendly-lobsters.txt',
              desc: 'Friendly Lobsters (example from Underwood A.J. (1997) Experiments in Ecology. Cambridge Univ. Press).'
            },
            { href: 'unfriendly-lobsters.txt',
              desc: 'Unfriendly Lobsters (example from Underwood A.J. (1997) Experiments in Ecology. Cambridge Univ. Press).'
            },
            { href: 'botanist.txt',
              desc: 'Lazy botanist (example from Underwood A.J. (1997) Experiments in Ecology. Cambridge Univ. Press).'
            },
            { href: 'widowbirds.txt',
              desc: 'Widowbirds\' tails (simulated data, inspired in Anderson, M. (1982) Female choice selects for extreme tail length in a widowbird. Nature 299: 818-820).'
            },
            { href: 'lakes.txt',
              desc: '<i>Alosa</i> in lakes'
            },
            { href: 'diversity.txt',
              desc: 'Diversity of pedofauna'
            },
            { href: 'caterpillars.txt',
              desc: 'Caterpillars and sun exposure'
            },
            { href: 'patgib.txt',
              desc: '<i>Patella</i>/<i>Gibbula</i>, an example of an asymmetrical design'
            },
            { href: 'patgib_full.txt',
              desc: '<i>Patella</i>/<i>Gibbula</i> (with Controls, companion data set for the above example)'
            },
            { href: 'calidris.txt',
              desc: '<i>Calidris alpina</i>'
            },
            { href: 'underwood.txt',
              desc: 'beyond BACI (data in Underwood A.J. (1993) The mechanics of spatially replicated sampling programmes to detect environmental impacts in a variable world. Austr. J. Ecol. 18(1): 99-116)'
            },
            { href: 'himanthalia.txt',
              desc: '<i>Himanthalia</i></a>'
            },
            { href: 'himanthalia-norte.txt',
              desc: '<i>Himanthalia</i> Norte'
            },
            { href: 'himanthalia-total.txt',
              desc: '<i>Himanthalia</i> Total'
            },
           ];



document.addEventListener('DOMContentLoaded', function () {

  let elem = document.getElementById('main');

  console.log(elem);
  let table = '<table>';
  for ( r of docs ) {
    table += '<tr><td><a href="' + r.href + '" target="_blank" ' +
             'rel="noopener noreferrer">' + r.href + '</a></td>' +
             '<td>' + r.desc + '</td></tr>';
  }
  table += '</table>';

  elem.innerHTML = table;
});
