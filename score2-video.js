/* v502 · Folly II theater: compiled score as BOTH score-shadow and score-hud.
   The 21 source exposures travel behind the two compiled sheets in sync with
   the real FollySegments film timeline. No return to retired wing-panel files. */
(() => {
  'use strict';
  let active=null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const copy={
    zh:'合成乐谱与逐帧图谱随影像同步。双指针分别记录两条运动轨迹。',
    en:'The compiled score and its exposures follow the film. Two needles trace independent motions.',
    ja:'合成譜面と各フレームは映像に同期し、二本の指針が異なる運動を示します。'
  };
  function currentLang(){
    const s=String(document.documentElement.lang||window.currentLang||'zh').toLowerCase();
    return s.startsWith('en')?'en':s.startsWith('ja')?'ja':'zh';
  }
  function destroy(){active?.destroy?.();active=null;}
  function mount(viewer,video,chapterHud){
    destroy();
    if(!viewer||!video)return null;
    const attachmentStage=viewer.querySelector('#attachment-stage');
    if(!attachmentStage)return null;
    const api=window.RuinScore2Sequence;
    const nums=api?.numbers||[1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
    const base=api?.base||'attachments/aether-scorched-earth/score-2%20webp/';
    const url=i=>base+(nums[i]===22?'22%20.webp':nums[i]+'.webp');
    const compiled=base+'compiled.png';
    const shell=document.createElement('div');
    shell.className='folly2-video-score-shell ra-folly2-video-score has-live-hud is-folded-score';
    shell.setAttribute('aria-label','Folly II · synchronized graphic score');
    shell.dataset.attachmentViewerInteractive='true';
    function printed(role){
      return [
        '<div class="ra-folly2-paper ra-folly2-',role,'-paper">',
        ' <img class="ra-folly2-frame" data-ra-score2-film-frame="',role,'" alt="" draggable="false" decoding="async">',
        ' <img class="ra-folly2-compiled" src="',compiled,'" alt="" draggable="false" decoding="async">',
        role==='live'?'<div class="ra-folly2-film-needles" aria-hidden="true"><div class="ra-folly2-native-center"><div class="ra-folly2-needle-layer"><i class="ra-folly2-needle one"></i><i class="ra-folly2-needle two"></i></div></div></div>':'',
        '</div>'
      ].join('');
    }
    shell.innerHTML=[
      '<div class="folly2-video-score-shadow" data-ra-score-shadow="compiled">',printed('shadow'),'</div>',
      '<div class="folly2-video-score-hud" data-ra-score-hud="compiled">',printed('live'),'</div>',
      '<p class="ra-folly2-video-hint" aria-hidden="true"></p>'
    ].join('');
    attachmentStage.appendChild(shell);
    viewer.classList.add('folly2-fold-score-video','ra-folly2-video-active');
    const shadow=shell.querySelector('.ra-folly2-shadow-paper');
    const live=shell.querySelector('.ra-folly2-live-paper');
    const targets=[...shell.querySelectorAll('.ra-folly2-frame')];
    const angles=[shell.querySelector('.ra-folly2-needle.one'),shell.querySelector('.ra-folly2-needle.two')];
    const compiledEls=[...shell.querySelectorAll('.ra-folly2-compiled')];
    const hint=shell.querySelector('.ra-folly2-video-hint');
    const state={alive:true,token:0,visible:-1,target:-1,resize:null,language:null,frameUrl:'',raf:0};
    let pendingFrame=null;

    function setHint(){hint.textContent=copy[currentLang()]||copy.zh;}
    function measure(){
      if(!state.alive||!shell.isConnected)return;
      const anchor=chapterHud?.getBoundingClientRect();
      const stageRect=attachmentStage.getBoundingClientRect();
      const shellRect=shell.getBoundingClientRect();
      if(!anchor?.width||!shellRect.width||!stageRect.width)return;
      // Keep the established score-to-chapter spacing and Folly II offset.
      const x=anchor.left+anchor.width/2-shellRect.width/2-stageRect.left-30;
      const y=anchor.top-18-shellRect.height-stageRect.top+50;
      shell.style.left=Math.round(x)+'px';
      shell.style.top=Math.round(y)+'px';
    }
    function paintAngles(fraction){
      const p=clamp(fraction,0,1);
      if(angles[0])angles[0].style.transform='rotate('+(-65+95*p).toFixed(3)+'deg)';
      if(angles[1])angles[1].style.transform='rotate('+(-55+129*Math.min(1,1.2*p)).toFixed(3)+'deg)';
    }
    function setFrames(i){
      i=clamp(i,0,nums.length-1);
      if(!state.alive||i===state.target)return;
      state.target=i;
      const token=++state.token;
      const source=url(i);
      const next=new Image();
      next.decoding='async';
      pendingFrame=next;
      next.onload=()=>{
        if(!state.alive||token!==state.token||!shell.isConnected)return;
        state.visible=i;
        state.frameUrl=source;
        targets.forEach(el=>{
          // The image is already downloaded; both surfaces reuse one URL.
          if(el.src!==next.src)el.src=next.src;
          el.classList.add('is-loaded');
        });
        pendingFrame=null;
      };
      next.onerror=()=>{
        if(token===state.token){pendingFrame=null;}
      };
      next.src=source;
      if(next.complete&&next.naturalWidth)next.onload();
    }
    function fraction(){
      try{
        const timeline=window.FollySegments?.timeline?.(video);
        if(Number.isFinite(timeline?.progress))return clamp(timeline.progress,0,1);
      }catch(_){}
      return video.duration>0?clamp(video.currentTime/video.duration,0,1):0;
    }
    function sync(){
      if(!state.alive)return;
      const p=fraction();
      paintAngles(p);
      const i=Math.round(p*(nums.length-1));
      setFrames(i);
      shell.style.setProperty('--ra-folly2-progress',String(p));
    }
    function schedule(){
      if(state.raf||!state.alive)return;
      state.raf=requestAnimationFrame(()=>{state.raf=0;sync();});
    }
    const watch=['timeupdate','seeked','loadedmetadata','durationchange'];
    watch.forEach(type=>video.addEventListener(type,schedule));
    const observer=new ResizeObserver(measure);
    observer.observe(attachmentStage);
    if(chapterHud)observer.observe(chapterHud);
    state.resize=observer;
    const languageObserver=new MutationObserver(setHint);
    languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    state.language=languageObserver;
    setHint();paintAngles(0);

    const preload=imageSource=>new Promise(resolve=>{
      const img=new Image();img.decoding='async';
      img.onload=()=>resolve(true);
      img.onerror=()=>resolve(false);
      img.src=imageSource;
      if(img.complete&&img.naturalWidth)resolve(true);
    });
    // The film only waits for the principal compiled image and its opening
    // exposure. Later frames load one at a time without pre-decoding all 21.
    const ready=Promise.all([preload(compiled),preload(url(0))]).then(results=>{
      if(!state.alive)return false;
      if(results[0])shell.classList.add('ra-compiled-ready');
      sync();
      return results.every(Boolean);
    });
    requestAnimationFrame(()=>requestAnimationFrame(measure));
    active={
      ready,shell,
      destroy(){
        if(!state.alive)return;
        state.alive=false;
        state.token++;
        if(state.raf)cancelAnimationFrame(state.raf);
        state.resize?.disconnect();
        state.language?.disconnect();
        watch.forEach(type=>video.removeEventListener(type,schedule));
        if(pendingFrame){pendingFrame.onload=null;pendingFrame.onerror=null;pendingFrame.src='';pendingFrame=null;}
        targets.forEach(img=>img.removeAttribute('src'));
        compiledEls.forEach(img=>img.removeAttribute('src'));
        shell.remove();
        viewer.classList.remove('ra-folly2-video-active','folly2-fold-score-video');
      }
    };
    return active;
  }
  window.RuinScore2VideoHUD=Object.freeze({mount,destroy});
})();
