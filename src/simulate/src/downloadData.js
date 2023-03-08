
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

