
var chart = (function() {
  'use strict';
    
  const POINTS    = 61,
        PRECISION = 4;       
      
  var Average = 5.0, Stdev = 0.5;  
  
  var Xmin, Xmax, Xrange, Xpunit;

  var xtitle = "X", ytitle = "Probability density";
  
      
  var margin = { top: 10, left: 70, right: 10, bottom: 50 };
  
  var points = [];
  
  /*
   * Grab the HTML element where graph is to be plotted
   */        
    
  var canvas = document.getElementById("chart");

  /*
   * Grab the desired height and width of the chart in pixels.
   * These are attributes of the <canvas> element! Note that 
   * chart width and height are the dimensions of the whole 
   * chart, including X and Y scale labels and tick marks! 
   */
  
  var cHeight = canvas.height;
  var cWidth  = canvas.width;

  /*
   * Get a context where to draw. Note that the coordinate system is reversed
   * as 0,0 is on the top left corner, and xMax,yMax is on the bottom right
   * corner. So for th X axis we are OK, but Y axis is reversed.
   */
  
  var ctx = canvas.getContext("2d");

  /*
   * Estimate the size (in pixels) of the drawable
   * area, that is, how many pixels correpond to the
   * width and height of the chart
   */
  
  var xsize = cWidth  - (margin.right + margin.left);
  var ysize = cHeight - (margin.bottom + margin.top);
  
  /*
   * Estimate minimum and maximum values in pixels
   * for the x and y axis
   */
  
  var xmin = margin.left,
      xmax = cWidth - margin.right,
      ymin = margin.top,
      ymax = ymin + ysize;
  
  var xrange = xmax - xmin,
      yrange = ymax - ymin;
      
      

  function getX(x){
    let r = Xpunit*parseFloat(x - Xmin);
    if( r < 0 ) return xmin;
    if( r > xmax ) return xmax;        
    return Math.round(xmin+r);
  }     
  
  
  function generateData() {
    let x, y, X, Y, maxYValue = 0;
      
    points = [];         
    
    /*
     * Step size for real X values (depends on the number of
     * points (POINTS) and Xrange (Xmin- Xmax)
     */
    
    let Xstep = Xrange/POINTS;
    
    /*
     * For the X coordinates in pixels
     */
    
    let xstep = Math.round(xrange/POINTS);
        
    //console.log('Xmax:', Xmax, 'Xmin:', Xmin, 'Xrange:', Xrange, 'Xstep:', Xstep)
    //console.log('xmin:', xmin, 'xmax:', xmax, 'xrange:', xrange, 'xstep:', xstep, 'xsize:', xsize)
    
    /*
     * For the Y coordinates in pixels
     */
    
    let ystep = Math.round(yrange/10);
    
    //console.log('ymin:', ymin, 'ymax:', ymax, 'yrange:', yrange, 'ystep:', ystep)
    
    for(let i = 0; i < POINTS; i++) {
      X = Xmin + i*Xstep;
      x = getX( X );
      Y = jStat.normal.pdf(X, Average, Stdev );
      y = ymax - Math.round(Y*yrange);
      if( Y > maxYValue ) maxYValue = Y;
      points.push({x: x, y: y, X: X, Y: Y});
    }
    
    /*
     * Record the largest Y value
     */
    
    points.maxYvalue = maxYValue;
    
    if( maxYValue > 0.9999 ) {
      for(let i = 0; i < POINTS; i++) {
        points[i].y = ymax - Math.round(points[i].Y/maxYValue*yrange); 
      }
    } 
    
  }
    
  function render() {

    Xmin = parseFloat( Average - PRECISION*Stdev ),
    Xmax = parseFloat( Average + PRECISION*Stdev );
    
    /*
     * Estimate x range
     */
  
    Xrange = parseFloat(Xmax - Xmin);
      
    /*
     * Estimate the number of pixeis per unit of X. 
     */
  
    Xpunit = parseFloat(xrange/Xrange); 
      
    /*
     * Automatically generate data points 
     * This also sets the maximum Y datum (between 0.0 and 1.0) 
     */ 
      
    generateData();
    
        
    /*
     * Render background of whole chart (including axis/labels)
     */
    
    ctx.fillStyle = 'white';       
    ctx.fillRect( 0, 0, cWidth, cHeight );    

    /*
     * Render background of actual chart data
     */    
    
    ctx.fillStyle = 'white';       
    ctx.fillRect(margin.left, margin.top, xsize, ysize);
    ctx.fillStyle = 'black';      
    
    //console.log(cWidth,cHeight,xSize,ySize,xMax,yMax,xMin,yMin)
    
    ctx.font = '16pt Arial';
    ctx.textAlign = "center";
    
    /* 
     * Render X-axis title. 
     */
     
    let txtSize = ctx.measureText(xtitle);
    ctx.textAlign = 'center';
    ctx.fillText(xtitle, margin.left + (xsize / 2), cHeight - (margin.bottom / 4));
    
    /*
     * Render Y-axis title. WE must save the context, create a new one and
     * rotate it 90º, render the title and restore the original context!
     */
    
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    //ctx.font = '10pt Arial';
    ctx.fillText(ytitle, (ysize / 2) * -1, margin.left / 3);
    ctx.restore();  
    
    /*
     * Render the X-axis 
     */
     
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, cHeight - margin.bottom);
    ctx.lineTo(cWidth - margin.right, cHeight - margin.bottom);
    ctx.stroke();
    ctx.closePath();

    /*
     * Now render the Y-axis 
     */
    
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, cHeight - margin.bottom);
    ctx.stroke();
    ctx.closePath();

    /*
     * Now render the Y-axis ticks and labels
     */
    
    let txt;
    
    ctx.font = '10pt Calibri';
    ctx.textAlign = "end"; 
    ctx.textBaseline = "middle";
    
    const YTICKS = 10;
    
    let yrange = ymax - ymin;
    let ystep  = Math.round(yrange/YTICKS);
    let ys = points.maxYvalue/YTICKS;
    
    //console.log('ys',ys,'maxY',points.maxYvalue)
    //console.log(points)
    
    let y;
    for(let i = 0; i <= YTICKS; i++) {
      if(ys < 0.1) txt = (i/YTICKS).toFixed(2).toString();  
      else txt = (i*ys).toFixed(2).toString();         
      y = ymax - i*ystep;
      ctx.beginPath();
      ctx.moveTo(xmin,   y);
      ctx.lineTo(xmin-5, y);
      ctx.stroke();
      ctx.closePath();
      ctx.fillText(txt, xmin-6, y);
    }
    
    /*
     * Now render the X-axis ticks and labels
     */
    
    const XTICKS = 10;
   
    let dec_places = 1;
    if(Stdev <  1) dec_places = 2;
    if(Stdev <  0.1) dec_places = 3;  
    if(Stdev <  0.01) dec_places = 4;           
    if(Stdev <  0.001) dec_places = 5;            
    
    let xr = parseFloat(Xrange/XTICKS);
    let xScaleStep = Math.round(xrange/XTICKS);
    let x;
    
    ctx.textAlign = 'center';
    //console.log('xr:',xr, 'xScaleStep', xScaleStep, 'xmax:',xmax,'xmin:',xmin,'xrange:',xrange)
    
    for(let i = 1; i < XTICKS; i++) {
      x = xmin + i*xScaleStep;
      txt = (Xmin + i*xr).toFixed(dec_places).toString();
      ctx.beginPath();
      ctx.moveTo(x, ymax);
      ctx.lineTo(x, ymax+5);
      ctx.stroke();
      ctx.closePath();
      ctx.fillText(txt, x, ymax + 15);
    }    
    
    /*
     * Draw a red line depicting the average
     */
    
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo( getX(Average), ymax);
    ctx.lineTo( getX(Average), ymin); 
    ctx.stroke();
    ctx.closePath();
    
    /*
     * Somewhow, the command bolow permits a smoother line.
     * jaggedness disappears, but why is another issue...
     */
    
    ctx.translate(0.2,0.1);
    
    /*
     * Problem is that after many renderings the chart moves 
     * downward. It's mandatory to restore the 'old' translation
     */
    
    //ctx.shadowBlur  = 16;
    //ctx.shadowBlur = 'gray';
  
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < POINTS; i++) {
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
    ctx.closePath();
    
    /*
     * Restore translation
     */
    
    ctx.translate(-0.2,-0.1);
  }
  
  function setAverage( m ) { 
      
    Average = parseFloat(m); 
    // Recalculate X range (Xmin and Xmax) based on
    // Range = Average +- PRECISION * Stdev;
    let min = Average - PRECISION*Stdev;
    let max = Average + PRECISION*Stdev;
    Xmin = min;
    document.getElementById("min").value = min;
    Xmax = max;  
    document.getElementById("max").value = max;       
    
    render();
  }
  
  function setStdev( m ) { 
    Stdev = parseFloat(m);  
    if( Stdev == 0 ) {
      Stdev = 0.1;
      document.getElementById("stdev").value = Stdev;
    }  
    // Recalculate X range (Xmin and Xmax) based on
    // Range = Average +- PRECISION * Stdev;
    let min = Average - PRECISION*Stdev;
    let max = Average + PRECISION*Stdev;
    Xmin = min;
    document.getElementById("min").value = min;
    Xmax = max;  
    document.getElementById("max").value = max;      
    
    render();
  }
  
  function setXMax( m ) { 
    Xmax = parseFloat(m);   
    render();
  }   
  
  function setXMin( m ) {
    Xmin = parseFloat(m);  
    render();
  } 
  
  function setXtitle (t) {
    xtitle = t;
    render();
  }
  
  function setYtitle (t) {
    ytitle = t; 
    render(); 
  }
  
  return {
    render: render,
    setXMin: setXMin,
    setXMax: setXMax, 
    setAverage: setAverage,  
    setStdev: setStdev, 
    setXtitle: setXtitle,
    setYtitle: setYtitle
  };
  
}());
