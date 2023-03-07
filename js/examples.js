//         <table>
//         <tr><td><a href="friendly-lobsters.txt" target="_blank"  rel="noopener noreferrer">Friendly Lobsters</a></td></tr>
//         <tr><td><a href="unfriendly-lobsters.txt" target="_blank"  rel="noopener noreferrer">Unfriendly Lobsters</a></td></tr>
//         <tr><td><a href="botanist.txt" target="_blank"  rel="noopener noreferrer">Lazy botanist</a></td></tr>
//         <tr><td><a href="widowbirds.text" target="_blank"  rel="noopener noreferrer">Widowbird's tails</a></td></tr>
//         <tr><td><a href="lakes.txt" target="_blank"  rel="noopener noreferrer"><i>Alosa</i> in lakes</a></td></tr>
//         <tr><td><a href="diversity.txt" target="_blank"  rel="noopener noreferrer">Diversity of pedofauna</a></td></tr>
//         <tr><td><a href="caterpillars.txt" target="_blank"  rel="noopener noreferrer">Caterpillars and sun exposure</a></td></tr>
//         <tr><td><a href="patgib.txt" target="_blank"  rel="noopener noreferrer"><i>Patella</i>/<i>Gibbula</i></a></td></tr>
//         <tr><td><a href="patgib_full.txt" target="_blank"  rel="noopener noreferrer"><i>Patella</i>/<i>Gibbula</i> (with Controls)</a></td></tr>
//         <tr><td><a href="loggers.txt" target="_blank"  rel="noopener noreferrer">Temperature Loggers</a></td></tr>
//         <tr><td><a href="lizards.txt" target="_blank"  rel="noopener noreferrer">Sexual maturation in lizards</a></td></tr>
//         <tr><td><a href="calidris.txt" target="_blank"  rel="noopener noreferrer"><i>Calidris alpina</i></a></td></tr>
//         <tr><td><a href="limpets.txt" target="_blank"  rel="noopener noreferrer">Limpets</a></td></tr>
//         <tr><td><a href="underwood.txt" target="_blank"  rel="noopener noreferrer">Underwood data (beyond BACI)</a></td></tr>
//         <tr><td><a href="himanthalia.txt" target="_blank"  rel="noopener noreferrer"><i>Himanthalia</i></a></td></tr>
//         <tr><td><a href="himanthalia-norte.txt" target="_blank"  rel="noopener noreferrer"><i>Himanthalia</i> Norte</a></td></tr>
//         <tr><td><a href="himanthalia-total.txt" target="_blank"  rel="noopener noreferrer"><i>Himanthalia</i> Total</a></td></tr>
//         </table>

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
            { href: 'widowbirds.text',
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
