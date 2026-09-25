(function () {
  'use strict';
  const S=window.InkySlot;
  const motifs=[['Cat','#c78d75'],['Bunny','#bfb0d5'],['Bear','#cba56d'],['Fox','#dca16d'],['Owl','#98b6bb'],['Panda','#919b98'],['Frog','#a9bd78'],['Star','#e4bf65'],['Bird','#8dafc6']];
  S.toyNames=motifs.map(m=>m[0]);
  S.toyArt=motifs.map(([name,color],i)=>{
    let shape='';
    if(i===7)shape='<path d="m60 7 15 30 34 5-25 24 6 35-30-16-30 16 6-35-25-24 34-5Z"/>';
    else{
      shape=i===1?'<ellipse cx="43" cy="27" rx="12" ry="25"/><ellipse cx="77" cy="27" rx="12" ry="25"/>':i===0||i===3?'<path d="M25 50 21 13 52 35M68 35 99 13 95 50Z"/>':'<circle cx="31" cy="37" r="17"/><circle cx="89" cy="37" r="17"/>';
      shape+='<ellipse cx="60" cy="82" rx="35" ry="25"/><rect x="23" y="33" width="74" height="60" rx="29"/>';
    }
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="'+color+'" stroke="#415a50" stroke-width="3" stroke-linejoin="round">'+shape+'</g><ellipse cx="45" cy="62" rx="5" ry="7" fill="#344a43"/><ellipse cx="75" cy="62" rx="5" ry="7" fill="#344a43"/><path d="M53 77q7 7 14 0" fill="none" stroke="#344a43" stroke-width="3" stroke-linecap="round"/><ellipse cx="34" cy="74" rx="8" ry="4" fill="#f3c5af"/><ellipse cx="86" cy="74" rx="8" ry="4" fill="#f3c5af"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  });
})();
