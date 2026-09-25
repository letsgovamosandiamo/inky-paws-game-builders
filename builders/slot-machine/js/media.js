(function () {
  'use strict';
  const S=window.InkySlot;
  function read(file,kind) {
    return new Promise((resolve,reject)=>{
      const limit=kind==='audio'?12:5;
      if(file.size>limit*1024*1024)return reject(new Error('Choose a '+kind+' smaller than '+limit+' MB.'));
      if(!file.type.startsWith(kind+'/')||file.type==='image/svg+xml')return reject(new Error('Choose a supported '+kind+' file. For images use PNG, JPEG, GIF, WebP, AVIF, or BMP.'));
      const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read that file.'));
      reader.onload=()=>{try{resolve(S.Project.media(reader.result,kind));}catch(e){reject(e);}};reader.readAsDataURL(file);
    });
  }
  function control({label,kind='image',value='',onChange}) {
    const wrap=document.createElement('div');wrap.className='media-control';
    const title=document.createElement('label');title.textContent=label;
    const url=document.createElement('input');url.type='url';url.placeholder='https://…';url.setAttribute('aria-label',label+' URL');title.append(url);
    const file=document.createElement('input');file.type='file';file.accept=kind==='image'?'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif':'audio/*';file.setAttribute('aria-label','Upload '+label.toLowerCase());
    const clear=document.createElement('button');clear.type='button';clear.textContent='Clear';
    const row=document.createElement('div');row.className='media-row';row.append(file,clear);
    const status=document.createElement('div');status.className='media-status';
    let src=value,ticket=0;
    function render(){url.value=src.startsWith('data:')?'':src;url.placeholder=src.startsWith('data:')?'Uploaded file included · URL replaces it':'https://…';status.replaceChildren();
      const note=document.createElement('span');note.textContent=src?(src.startsWith('data:')?'Included in project and exported game':'Linked media · internet required'):'Optional · built-in default / no media';
      if(src){const preview=document.createElement(kind==='audio'?'audio':'img');preview.src=src;if(kind==='audio'){preview.controls=true;preview.preload='none';}else preview.alt='';preview.onerror=()=>{preview.remove();note.textContent='Could not load this media. Check the URL or upload a file.';};status.append(preview);}status.append(note);
    }
    url.addEventListener('input',()=>url.setCustomValidity(''));
    url.addEventListener('change',()=>{try{const next=S.Project.media(url.value,kind);ticket++;src=next;onChange(src);render();}catch(e){url.setCustomValidity(e.message);url.reportValidity();}});
    clear.onclick=()=>{ticket++;src='';file.value='';url.setCustomValidity('');onChange(src);render();};
    file.onchange=async()=>{const f=file.files[0];if(!f)return;const token=++ticket;S.pendingMedia=(S.pendingMedia||0)+1;file.disabled=true;
      try{const result=await read(f,kind);if(token!==ticket||!wrap.isConnected)return;src=result;onChange(src);render();}catch(e){S.notify(e.message,true);}finally{file.disabled=false;file.value='';S.pendingMedia--;}
    };
    wrap.append(title,row,status);render();return wrap;
  }
  async function removeBackground(src) {
    const image=new Image();image.crossOrigin='anonymous';const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Upload this image to remove its background locally.'));});image.src=src;await loaded;
    const scale=Math.min(1,520/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
    let pixels;try{pixels=ctx.getImageData(0,0,canvas.width,canvas.height);}catch(_){throw new Error('This image host prevents editing. Upload the image instead.');}
    const {data,width:w,height:h}=pixels,seeds=[0,w-1,(h-1)*w,w*h-1],colors=seeds.map(k=>Array.from(data.slice(k*4,k*4+4))).filter(c=>c[3]>12),seen=new Uint8Array(w*h),queue=[];
    seeds.forEach(k=>{seen[k]=1;queue.push(k);});
    for(let head=0;head<queue.length;head++){const k=queue[head],i=k*4;const matches=data[i+3]<=12||colors.some(c=>(data[i]-c[0])**2+(data[i+1]-c[1])**2+(data[i+2]-c[2])**2<=58**2);if(!matches)continue;data[i+3]=0;const x=k%w,y=Math.floor(k/w);for(const next of [x>0?k-1:-1,x<w-1?k+1:-1,y>0?k-w:-1,y<h-1?k+w:-1]){if(next>=0&&!seen[next]){seen[next]=1;queue.push(next);}}}
    ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png');
  }
  S.Media={read,control,removeBackground};
})();
