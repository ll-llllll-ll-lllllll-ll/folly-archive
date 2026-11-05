/* v500 · Folly II / 21-exposure score, ported from the artist's Folly page.
   Original sequence: 1..7, 9..22. Folder and final frame retain their
   actual uploaded names (space in folder; "22 .webp"). No eager 21-frame decode. */
(() => {
  'use strict';
  const NUMBERS=[1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  const BASE='attachments/aether-scorched-earth/score-2%20webp/';
  const URLS=NUMBERS.map(n=>BASE+(n===22?'22%20.webp':n+'.webp'));
  const COMPILED=BASE+'compiled.png';
  const TXT={
    zh:{title:'废墟乐谱：《朽塔以太谐虐曲》',desc:'摆动结构设计图与频差电路图的叠合。二十一帧记录朽塔天线重叠时的位移、信号干扰与渐渐失去的平衡。',show:'显示指针',hide:'隐藏指针',hint:'拖动图谱，或沿右下角斜线拖动圆环以切换帧。',loading:'正在读取乐谱帧',returning:'指针正在回到第一帧',error:'这一帧暂时无法读取',compiled:'合成乐谱已展开',seek:'推拉乐谱进程'},
    en:{title:'Ruin Score: Tower Aether: A Cruel Scherzo',desc:'Oscillating structural drawings and a beat-frequency circuit are superimposed in twenty-one exposures, recording antenna displacement, interference, and the loss of balance.',show:'Show pointers',hide:'Hide pointers',hint:'Drag the notation, or move the lower-right ring along its diagonal.',loading:'Reading score exposure',returning:'Returning to the first frame',error:'This frame could not be loaded',compiled:'Compiled notation revealed',seek:'Scrub score progress'},
    ja:{title:'廃墟楽譜：《朽塔エーテル諧虐曲》',desc:'揺動構造の設計図と周波数差回路図を重ね、アンテナの変位と干渉、均衡喪失の進行を二十一枚に記録する。',show:'指針を表示',hide:'指針を非表示',hint:'図譜または右下の斜線上の円環を動かしてフレームを切り替えます。',loading:'譜面を読み込み中',returning:'第一フレームに戻っています',error:'フレームを読み込めません',compiled:'合成譜面を表示',seek:'譜面の進行を動かす'}
  };
  function vault(){
    return window.languageVault||(typeof languageVault!=='undefined'?languageVault:null);
  }
  for(const lang of ['zh','en','ja']){
    if(vault()?.[lang])Object.assign(vault()[lang],{
      title_radio_score_frames:TXT[lang].title,
      desc_radio_score_frames:TXT[lang].desc
    });
  }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const lang=()=>{
    const v=String(document.documentElement.lang||window.currentLang||'zh').toLowerCase();
    return v.startsWith('en')?'en':v.startsWith('ja')?'ja':'zh';
  };
  let current=null;
  function destroy(){current?.destroy?.();current=null;}
  function mount(wrapper){
    destroy();
    if(!wrapper)return null;
    const node=document.createElement('section');
    node.className='ra-score2';
    node.dataset.pointers='off';
    node.dataset.compiled='off';
    node.dataset.attachmentViewerInteractive='true';
    node.innerHTML=[
      '<div class="ra-score2-composition">',
      ' <div class="ra-score2-art" role="slider" tabindex="0" aria-label="Folly II score sequence" aria-valuemin="1" aria-valuemax="21" aria-valuenow="1">',
      '  <img class="ra-score2-exposure" data-score2-buffer="0" alt="" draggable="false">',
      '  <img class="ra-score2-exposure" data-score2-buffer="1" alt="" draggable="false">',
      '  <img class="ra-score2-compiled" src="'+COMPILED+'" alt="" draggable="false" loading="lazy" decoding="async">',
      '  <div class="ra-score2-hud" aria-hidden="true"><div class="ra-score2-native-center"><div class="ra-score2-native-needles">',
      '   <i class="ra-score2-needle ra-score2-needle-one"></i>',
      '   <i class="ra-score2-needle ra-score2-needle-two"></i>',
      '  </div></div></div>',
      ' </div>',
      ' <div class="ra-score2-diagonal" data-attachment-viewer-interactive="true">',
      '  <svg viewBox="0 0 260 160" preserveAspectRatio="none" aria-hidden="true"><path d="M 22 22 L 238 138"></path></svg>',
      '  <span class="ra-score2-trailer" aria-hidden="true"></span>',
      '  <button class="ra-score2-handle" type="button" role="slider" aria-orientation="horizontal" aria-valuemin="1" aria-valuemax="21" aria-valuenow="1"></button>',
      ' </div>',
      '</div>',
      '<div class="ra-score2-footer"><button class="ra-score2-switch" type="button" aria-pressed="false"></button>',
      '<span class="ra-score2-counter" aria-live="off"></span></div>',
      '<p class="ra-score2-hint"></p><p class="ra-score2-status" role="status" aria-live="polite"></p>'
    ].join('');
    wrapper.replaceChildren(node);
    const art=node.querySelector('.ra-score2-art');
    const frames=[...node.querySelectorAll('.ra-score2-exposure')];
    const compiled=node.querySelector('.ra-score2-compiled');
    const needles=[...node.querySelectorAll('.ra-score2-needle')];
    const rail=node.querySelector('.ra-score2-diagonal');
    const handle=node.querySelector('.ra-score2-handle');
    const trailer=node.querySelector('.ra-score2-trailer');
    const toggle=node.querySelector('.ra-score2-switch');
    const counter=node.querySelector('.ra-score2-counter');
    const hint=node.querySelector('.ra-score2-hint');
    const status=node.querySelector('.ra-score2-status');
    const s={alive:true,index:0,visible:-1,slot:0,paintId:0,rewindId:0,raf:0,artGesture:null,railGesture:null};

    function message(k){status.textContent=k?(TXT[lang()]||TXT.zh)[k]||'':'';}
    function labels(){
      if(!s.alive)return;
      const t=TXT[lang()]||TXT.zh;
      toggle.textContent=node.dataset.pointers==='on'?t.hide:t.show;
      toggle.setAttribute('aria-label',toggle.textContent);
      handle.setAttribute('aria-label',t.seek);
      handle.title=t.seek;
      hint.textContent=t.hint;
    }
    function readout(){
      const t=s.index/(NUMBERS.length-1);
      counter.textContent=String(NUMBERS[s.index]).padStart(2,'0')+' / 22  ·  '+(s.index+1)+' / 21';
      const x=100*(22+216*t)/260,y=100*(22+116*t)/160;
      handle.style.left=x.toFixed(3)+'%';
      handle.style.top=y.toFixed(3)+'%';
      handle.setAttribute('aria-valuenow',String(s.index+1));
      handle.setAttribute('aria-valuetext',NUMBERS[s.index]+' / 22');
      art.setAttribute('aria-valuenow',String(s.index+1));
      art.setAttribute('aria-valuetext',NUMBERS[s.index]+' / 22');
      trailer.style.left=(100*(238-216*t)/260).toFixed(3)+'%';
      trailer.style.top=(100*(138-116*t)/160).toFixed(3)+'%';
      needles[0].style.transform='rotate('+(-65+95*t).toFixed(3)+'deg)';
      needles[1].style.transform='rotate('+(-55+129*Math.min(1,t*1.2)).toFixed(3)+'deg)';
    }
    function paint(index){
      if(!s.alive)return Promise.resolve(false);
      s.index=clamp(Math.round(index),0,NUMBERS.length-1);
      readout();
      if(s.visible===s.index)return Promise.resolve(true);
      const token=++s.paintId,which=1-s.slot,img=frames[which],wanted=s.index;
      return new Promise(resolve=>{
        let settled=false;
        const finish=ok=>{
          if(settled)return;
          settled=true;
          if(!s.alive||token!==s.paintId){resolve(false);return;}
          if(ok){
            frames[s.slot].classList.remove('is-visible');
            img.classList.add('is-visible');
            s.slot=which;s.visible=wanted;message('');
          }else message('error');
          resolve(ok);
        };
        img.onload=()=>finish(true);
        img.onerror=()=>finish(false);
        img.src=URLS[wanted];
        if(img.complete&&img.naturalWidth)finish(true);
      });
    }
    function compiledReady(){
      if(compiled.complete&&compiled.naturalWidth)return Promise.resolve(true);
      return new Promise(resolve=>{
        const cleanup=()=>{
          compiled.removeEventListener('load',ok);
          compiled.removeEventListener('error',fail);
        };
        const ok=()=>{cleanup();resolve(true);};
        const fail=()=>{cleanup();resolve(false);};
        compiled.addEventListener('load',ok,{once:true});
        compiled.addEventListener('error',fail,{once:true});
        compiled.loading='eager';
      });
    }
    function stopRewind(){
      ++s.rewindId;
      if(s.raf)cancelAnimationFrame(s.raf);
      s.raf=0;
    }
    function reveal(token){
      if(!s.alive||token!==s.rewindId||node.dataset.pointers!=='on')return;
      Promise.all([paint(0),compiledReady()]).then(([ready,overlay])=>{
        if(!s.alive||token!==s.rewindId||node.dataset.pointers!=='on')return;
        if(ready&&overlay){node.dataset.compiled='on';message('compiled');}
        else message('error');
      });
    }
    function setIndex(index,automated=false){
      if(!automated&&s.raf){
        stopRewind();node.dataset.compiled='off';
      }
      return paint(index);
    }
    function pointers(on){
      stopRewind();
      node.dataset.pointers=on?'on':'off';
      node.dataset.compiled='off';
      toggle.setAttribute('aria-pressed',on?'true':'false');
      labels();
      if(!on){message('');return;}
      compiled.loading='eager';
      message('returning');
      const token=s.rewindId,from=s.index;
      if(!from){reveal(token);return;}
      const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      const duration=reduced?0:Math.min(2800,520+110*from);
      let started=null,prev=-1;
      function tick(now){
        if(!s.alive||token!==s.rewindId||node.dataset.pointers!=='on')return;
        if(started===null)started=now;
        const t=duration?clamp((now-started)/duration,0,1):1;
        const step=Math.max(0,Math.round(from*Math.pow(1-t,2.4)));
        if(step!==prev){prev=step;setIndex(step,true);}
        if(t<1)s.raf=requestAnimationFrame(tick);
        else{s.raf=0;reveal(token);}
      }
      s.raf=requestAnimationFrame(tick);
    }
    function keySeek(ev){
      const delta={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[ev.key];
      if(delta!==undefined)setIndex(s.index+delta);
      else if(ev.key==='Home')setIndex(0);
      else if(ev.key==='End')setIndex(NUMBERS.length-1);
      else return;
      ev.preventDefault();ev.stopPropagation();
    }
    function scrubArt(ev){
      const r=art.getBoundingClientRect();
      const t=clamp(((ev.clientY-r.top)/Math.max(1,r.height)-.12)/.76,0,1);
      setIndex(Math.round(t*(NUMBERS.length-1)));
    }
    function scrubRail(ev){
      const r=rail.getBoundingClientRect();
      const ax=r.left+r.width*(22/260),ay=r.top+r.height*(22/160);
      const dx=r.width*(216/260),dy=r.height*(116/160);
      const t=clamp(((ev.clientX-ax)*dx+(ev.clientY-ay)*dy)/Math.max(1,dx*dx+dy*dy),0,1);
      setIndex(Math.round(t*(NUMBERS.length-1)));
    }
    art.addEventListener('pointerdown',ev=>{
      if(ev.pointerType==='mouse'&&ev.button!==0)return;
      s.artGesture=ev.pointerId;
      try{art.setPointerCapture(ev.pointerId);}catch(_){}
      scrubArt(ev);ev.preventDefault();ev.stopPropagation();
    });
    art.addEventListener('pointermove',ev=>{
      if(s.artGesture!==ev.pointerId)return;
      scrubArt(ev);ev.preventDefault();ev.stopPropagation();
    });
    const finishArt=ev=>{if(s.artGesture===ev.pointerId)s.artGesture=null;};
    art.addEventListener('pointerup',finishArt);
    art.addEventListener('pointercancel',finishArt);
    art.addEventListener('lostpointercapture',()=>{s.artGesture=null;});
    art.addEventListener('keydown',keySeek);
    handle.addEventListener('pointerdown',ev=>{
      if(ev.pointerType==='mouse'&&ev.button!==0)return;
      s.railGesture=ev.pointerId;handle.classList.add('is-dragging');
      try{handle.setPointerCapture(ev.pointerId);}catch(_){}
      scrubRail(ev);ev.preventDefault();ev.stopPropagation();
    });
    handle.addEventListener('pointermove',ev=>{
      if(s.railGesture!==ev.pointerId)return;
      scrubRail(ev);ev.preventDefault();ev.stopPropagation();
    });
    const finishRail=ev=>{
      if(s.railGesture!==ev.pointerId)return;
      s.railGesture=null;handle.classList.remove('is-dragging');
      ev.preventDefault();ev.stopPropagation();
    };
    handle.addEventListener('pointerup',finishRail);
    handle.addEventListener('pointercancel',finishRail);
    handle.addEventListener('lostpointercapture',()=>{s.railGesture=null;});
    handle.addEventListener('keydown',keySeek);
    toggle.addEventListener('click',()=>pointers(node.dataset.pointers!=='on'));
    const update=()=>labels();
    const observer=new MutationObserver(update);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('languagechange-complete',update);
    current={
      setIndex,pointers,
      destroy(){
        if(!s.alive)return;
        s.alive=false;stopRewind();++s.paintId;
        observer.disconnect();
        document.removeEventListener('languagechange-complete',update);
        frames.forEach(img=>{img.onload=null;img.onerror=null;img.removeAttribute('src');});
        compiled.removeAttribute('src');
        node.remove();
      }
    };
    labels();readout();message('loading');paint(0);
    return current;
  }
  window.RuinScore2Sequence=Object.freeze({mount,destroy,numbers:NUMBERS.slice(),base:BASE});
})();
