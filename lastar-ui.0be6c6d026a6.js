// First-party progressive enhancement for the information-only static export.
// No framework hydration, requests, tracking, authentication or business data.
(() => {
  const start = () => {
    const root = document.documentElement;
    const en=root.lang==='en';
    const themeButton = document.querySelector('.theme-toggle');
    const media = matchMedia('(prefers-color-scheme: dark)');
    const readTheme = () => { try { return localStorage.getItem('lastar.web.theme'); } catch { return null; } };
    // Local review links must survive the later preference/listener sync.
    // Only these preview routes accept the two known theme values.
    const reviewTheme = /^\/preview\/v5[23]\//.test(location.pathname)
      ? new URLSearchParams(location.search).get('theme') : null;
    const requestedTheme = reviewTheme === 'dawn' || reviewTheme === 'night';
    if (requestedTheme) {
      try { localStorage.setItem('lastar.web.theme', reviewTheme); } catch { /* Bootstrap theme remains usable. */ }
    }
    let explicit = requestedTheme || ['dawn', 'night'].includes(readTheme());
    const paintTheme = theme => {
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
      if (!themeButton) return;
      themeButton.setAttribute('aria-label', en?(theme==='night'?'Switch to Dawn theme':'Switch to Night theme'):(theme === 'night' ? '切换到晨雾主题' : '切换到夜航主题'));
      themeButton.children[0].textContent = theme === 'night' ? '☀' : '☾';
      themeButton.children[1].textContent = en?(theme==='night'?'Dawn':'Night'):(theme === 'night' ? '晨雾' : '夜航');
    };
    const syncTheme = () => {
      const saved = readTheme();
      if (saved === 'dawn' || saved === 'night') paintTheme(saved);
      else if (!explicit) paintTheme(media.matches ? 'night' : 'dawn');
    };
    paintTheme(root.dataset.theme === 'night' ? 'night' : 'dawn');
    syncTheme(); // Closes the bootstrap/listener setup race without waiting for hydration.
    themeButton?.addEventListener('click', () => {
      const next = root.dataset.theme === 'night' ? 'dawn' : 'night';
      explicit = true;
      try { localStorage.setItem('lastar.web.theme', next); } catch { /* Current page still works. */ }
      paintTheme(next);
    });
    media.addEventListener('change', syncTheme);
    addEventListener('storage', () => { explicit = ['dawn', 'night'].includes(readTheme()); syncTheme(); });

    const header = document.querySelector('.site-header');
    const trigger = document.querySelector('.mobile-menu > button');
    const menu = document.querySelector('#mobile-site-nav');
    let open = false;
    let previousOverflow = '';
    const fitMenu = () => {
      if (!open || !menu) return;
      menu.style.top = '';
      const scale = menu.getBoundingClientRect().width / menu.offsetWidth || 1;
      const top = Math.min(menu.getBoundingClientRect().top, innerHeight * .4);
      menu.style.top = `${(top - menu.parentElement.getBoundingClientRect().top) / scale}px`;
      const right = Math.min(innerWidth - 14, menu.getBoundingClientRect().right);
      menu.style.maxWidth = `${Math.max(0, right - 14) / scale}px`;
      menu.style.maxHeight = `${Math.max(0, innerHeight - menu.getBoundingClientRect().top - 16) / scale}px`;
    };
    const closeMenu = () => {
      if (!open || !menu || !trigger) return;
      open = false;
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = previousOverflow;
      trigger.focus();
    };
    trigger?.addEventListener('click', () => {
      if (open) { closeMenu(); return; }
      if (!menu) return;
      open = true;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      fitMenu();
      menu.querySelector('a')?.focus();
    });
    menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (!open || !menu) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
      if (event.key !== 'Tab') return;
      const links = [...menu.querySelectorAll('a')], first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    addEventListener('resize', () => { if (innerWidth > 860) closeMenu(); else fitMenu(); });
    addEventListener('popstate', closeMenu);
    addEventListener('pageshow', () => { closeMenu(); syncTheme(); scroll(); });
    if (header && 'ResizeObserver' in window) new ResizeObserver(fitMenu).observe(header);
    const scroll = () => {
      if (!header) return;
      const scrolled = String(scrollY > 12);
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };
    scroll(); addEventListener('scroll', scroll, {passive:true});
    const current = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.site-nav a, .mobile-menu a').forEach(link => {
      if ((link.pathname.replace(/\/$/, '') || '/') === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    document.querySelectorAll('[data-hero-motion]').forEach(hero => {
      const button = hero.querySelector('.motion-toggle');
      let visible = true;
      const visibility = () => { hero.dataset.visible = String(visible && !document.hidden); };
      if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); }).observe(hero);
      document.addEventListener('visibilitychange', visibility);
      button?.addEventListener('click', () => {
        const paused = hero.dataset.paused !== 'true';
        hero.dataset.paused = String(paused);
        button.setAttribute('aria-pressed', String(paused));
        button.textContent = paused ? '播放星光动效' : '暂停星光动效';
      });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();

;(()=>{// Shared first-party enhancement: Next development and static export run the same state machine.
// No fetch, cookies, analytics or persistence. Every scene resets on navigation/reload.
function initBrandScenes() {
  const cleanups = []
  const on = (node, event, fn) => { if (!node) return; node.addEventListener(event, fn); cleanups.push(() => node.removeEventListener(event, fn)) }
  const feedback=(node,frames,duration)=>{if(!node||motion.matches||!node.animate)return;node.getAnimations().forEach(a=>a.cancel());node.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.25,1)'})}
  on(document,'click',e=>{const b=e.target.closest?.('[data-reaction],[data-consent],[data-public],[data-planet-action="next"]');if(!b)return;if(b.dataset.planetAction){feedback(b.closest('[data-scene]').querySelector('.landscape'),[{transform:'perspective(800px) rotateY(-7deg)',opacity:.85},{transform:'perspective(800px) rotateY(0)',opacity:1}],520)}else feedback(b,[{transform:'scale(.96)'},{transform:'scale(1)'}],180)})
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const visibility = () => { document.documentElement.dataset.documentHidden = String(document.hidden) }
  visibility();on(document,'visibilitychange',visibility)
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.dataset.arrivalVisible = String(entry.isIntersecting)
      if (entry.isIntersecting) entry.target.classList.add('editorial-arrival')
    }), {threshold:.12})
    document.querySelectorAll('.paper-card,.article-section').forEach(node=>observer.observe(node))
    on(motion,'change',()=>{if(motion.matches)observer.disconnect()})
    cleanups.push(()=>observer.disconnect())
  }
  for (const scene of document.querySelectorAll('[data-scene]')) {
    const q = s => scene.querySelector(s), all = s => [...scene.querySelectorAll(s)]
    const text = (s, value) => { const node = q(s); if (node) node.textContent = value }
    const press = (node, value) => node.setAttribute('aria-pressed', String(value))
    const kind = scene.dataset.scene
    if (kind === 'feed') {
      let tab = 0
      const stories = [['生活灵感 · 情境文案','周末留一点时间，给自己。','读几页书，等一杯茶慢慢变凉。平凡的一天，也值得认真记下。'],['关注情境 · 非真实账号','因为喜欢，想继续听她说。','关注是一种选择，不代表对方也关注你，更不代表亲密关系。'],['同城情境 · 手动城市','从生活的相似之处相逢。','分享同城灵感，不公开坐标、距离、住址或精确行程。'],['圈子情境 · 兴趣连接','把书翻到同一页。','讨论共同喜欢的内容，也尊重每个人不想说的部分。']]
      const update = () => {
        const scope = q('[data-feed-scope]').value, viewer = q('[data-feed-viewer]').value
        const allowed = viewer === 'owner' || scope === 'public' || (scope === 'followers' && viewer === 'follower') || (scope === 'circle' && viewer === 'member')
        q('.feed-story').hidden = !allowed
        const labels = {visitor:'陌生访客',follower:'关注者',member:'圈子成员',owner:'作者本人'}
        text('[data-feed-status]', `${labels[viewer]}${allowed?'可以看见这条情境内容。':'不能看见这条内容。真实权限必须由后端校验，不依赖页面隐藏。'}`)
        text('[data-feed-kicker]', tab === 2 ? `${q('[data-feed-city]').value} · 手动选择，非定位` : stories[tab][0])
        text('[data-feed-title]',stories[tab][1]);text('[data-feed-copy]',stories[tab][2])
      }
      all('[data-feed-tab]').forEach((b,i) => on(b,'click',() => {tab=i;all('[data-feed-tab]').forEach((n,j)=>press(n,i===j));update()}))
      all('select').forEach(n=>on(n,'change',update))
    }
    if (kind === 'consent') {
      let accepted = [false,false], visible = [false,false], blocked = false
      const update = () => {
        const bound = accepted.every(Boolean) && !blocked
        all('[data-consent]').forEach((b,i)=>{press(b,accepted[i]);b.disabled=blocked;b.textContent=`${i?'她':'你'}：${accepted[i]?'撤回确认':'确认'}`})
        all('[data-public]').forEach((b,i)=>{press(b,visible[i]);b.disabled=!bound;b.textContent=`${i?'她':'你'}：${visible[i]?'撤回公开':'同意公开'}`})
        q('[data-relation-type]').disabled=blocked||accepted.some(Boolean)
        q('[data-relation-action="unbind"]').disabled=!bound
        q('[data-relation-action="block"]').textContent=blocked?'解除拉黑（不恢复关系）':'拉黑此情境对象'
        text('[data-consent-status]',blocked?'已拉黑：关系解除，新的互动与消息被阻止。':bound?`双方已确认「${q('[data-relation-type]').value}」关系。`:'尚未建立关系。等待双方独立确认。')
        text('[data-public-status]',bound&&visible.every(Boolean)?'双方同意公开；仍需符合主页可见范围，非所有人都可见。':'主页默认不展示；需要双方同意公开，并符合主页可见范围。')
      }
      all('[data-consent]').forEach((b,i)=>on(b,'click',()=>{accepted[i]=!accepted[i];if(!accepted.every(Boolean))visible=[false,false];update()}))
      all('[data-public]').forEach((b,i)=>on(b,'click',()=>{visible[i]=!visible[i];update()}))
      all('[data-relation-action]').forEach(b=>on(b,'click',()=>{accepted=[false,false];visible=[false,false];blocked=b.dataset.relationAction==='block'?!blocked:false;update()}))
    }
    if (kind === 'profile') {
      const state={star:false,follow:false,chat:false,block:false}
      all('[data-profile]').forEach(b=>on(b,'click',()=>{
        const key=b.dataset.profile;state[key]=!state[key]
        if(key==='block')Object.assign(state,{star:false,follow:false,chat:false})
        all('[data-profile]').forEach(n=>{press(n,state[n.dataset.profile]);if(n.dataset.profile!=='block')n.disabled=state.block})
        text('[data-profile-status]',state.block?'已拉黑：点亮、关注与私聊请求均停止。':key==='block'?'已解除拉黑；不会恢复原先的互动或关系。':key==='chat'?(state.chat?'本页显示待对方同意的私聊请求；没有真实发送。':'已撤回本页私聊请求。'):`${key==='star'?'星光':'关注'}${state[key]?'已开启':'已撤回'}，不改变其他连接状态。`)
        q('[data-profile="block"]').textContent=state.block?'解除拉黑（不恢复互动）':'拉黑情境对象'
      }))
    }
    if (kind === 'message') {
      let reaction=''
      all('[data-reaction]').forEach(b=>on(b,'click',()=>{reaction=reaction===b.dataset.reaction?'':b.dataset.reaction;all('[data-reaction]').forEach(n=>press(n,n.dataset.reaction===reaction));text('[data-reaction-status]',reaction?`已选择「${reaction}」；再次点击可撤回，未产生真实消息。`:'已撤回回应。')}))
      on(q('[data-message="quote"]'),'click',()=>text('[data-message-status]','正在引用这句情境消息：“今天读到一句很喜欢的话，想分享给你。”'))
      on(q('[data-message="fail"]'),'click',()=>{text('[data-message-delivery]','模拟失败 · 未发送');text('[data-message-status]','失败演示：内容保留，可重试。没有真实网络发送。');q('[data-message="retry"]').disabled=false})
      on(q('[data-message="retry"]'),'click',()=>{text('[data-message-delivery]','重试流程演示完成 · 非真实送达');text('[data-message-status]','重试情境已恢复；真实发送仍需 App 与后端。');q('[data-message="retry"]').disabled=true})
    }
    if (kind === 'circle') {
      let agreed=false,joined=false
      const update=()=>{press(q('[data-circle="agree"]'),agreed);q('[data-circle="join"]').disabled=!agreed||joined;q('[data-circle="leave"]').disabled=!joined;q('[data-circle="agree"]').disabled=joined;text('[data-circle-status]',joined?'已加入本页情境圈子。成员内容仍受真实后端权限约束。':'尚未加入，不展示成员私密内容。')}
      on(q('[data-circle="agree"]'),'click',()=>{agreed=!agreed;update()});on(q('[data-circle="join"]'),'click',()=>{joined=true;update()});on(q('[data-circle="leave"]'),'click',()=>{joined=false;agreed=false;update()})
    }
    if (kind === 'planet') {
      let index=0,shared=false,accepted=[false,false]
      const places=['晨雾山谷','晚霞海岸','夜航星野'],titles=['给今天，留一小片安静。','把沿途的风，寄给你。','慢一点，也能抵达。']
      on(q('[data-planet-action="next"]'),'click',()=>{index=(index+1)%3;scene.dataset.place=String(index);text('[data-planet-number]',`POSTCARD 0${index+1} / ${places[index]}`);text('[data-planet-title]',titles[index])})
      on(q('[data-planet-action="share"]'),'click',()=>{shared=!shared;press(q('[data-planet-action="share"]'),shared);text('[data-planet-action="share"]',shared?'明信片：本页分享情境':'明信片：仅自己')})
      const update=()=>{all('[data-bottle="you"],[data-bottle="her"]').forEach((b,i)=>press(b,accepted[i]));text('[data-bottle-status]',accepted.every(Boolean)?'双方愿意继续这次交流；不自动关注、开启私聊或绑定关系。':'等待双方同意；不会自动关注、私聊或绑定关系。')}
      all('[data-bottle="you"],[data-bottle="her"]').forEach((b,i)=>on(b,'click',()=>{accepted[i]=!accepted[i];update()}));on(q('[data-bottle="end"]'),'click',()=>{accepted=[false,false];update();text('[data-bottle-status]','这次相遇已结束，可以不解释地离开。')})
    }
  }
  return () => cleanups.forEach(fn=>fn())
}

// No telemetry, storage, remote scripts or business APIs. Only same-origin 3D module.
function initOrbitSculpture() {
 const stage=document.querySelector('[data-sculpture="home"]');if(!stage)return()=>{}
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),hero=stage.closest('[data-hero-motion]')
 const connection=navigator.connection,low=()=>motion.matches||connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)
 const disabled=new URLSearchParams(location.search).get('visual')==='static'
 let disposed=false,instance,started=false,idle,observer
 const load=()=>{if(disposed||started||low()||disabled||document.hidden||hero.dataset.paused==='true'||hero.dataset.visible==='false')return;started=true
  import(/* webpackIgnore: true */ stage.dataset.orbitModule).then(module=>{if(!disposed&&!low()&&!disabled)instance=module.mountOrbit(stage,hero);else started=false}).catch(()=>{stage.dataset.renderer='svg';stage.dataset.reason='module-unavailable'})
 }
 const schedule=()=>{if(disposed||started||low()||disabled)return;idle='requestIdleCallback'in window?requestIdleCallback(load,{timeout:1500}):setTimeout(load,400)}
 const policy=()=>{if(low()){instance?.destroy();instance=undefined;started=false;stage.dataset.renderer='svg';stage.dataset.reason='device-policy'}else schedule()}
 if(low()||disabled){stage.dataset.reason=disabled?'user-static':'device-policy'}else schedule()
 observer=new MutationObserver(schedule);observer.observe(hero,{attributes:true,attributeFilter:['data-paused','data-visible']})
 motion.addEventListener('change',policy);document.addEventListener('visibilitychange',schedule)
 return()=>{disposed=true;instance?.destroy();observer.disconnect();motion.removeEventListener('change',policy);document.removeEventListener('visibilitychange',schedule);if('cancelIdleCallback'in window)cancelIdleCallback(idle);else clearTimeout(idle)}
}

// Same-origin, reviewed media only; no account, telemetry or audio autoplay.
function initBrandFilm() {
 const root=document.querySelector('[data-brand-film]');if(!root)return()=>{}
 const video=root.querySelector('video'),button=root.querySelector('[data-film-toggle]'),status=root.querySelector('[data-film-status]')
 if(!video||!button||root.dataset.filmApproved!=='true'){root.dataset.filmState='asset-pending';return()=>{}}
 const sources=[root.dataset.filmDesktop,root.dataset.filmMobile]
 if(sources.some(source=>!/^\/media\/v5\/[a-z0-9.-]+\.mp4$/.test(source??''))){root.dataset.filmState='asset-pending';return()=>{}}
 if(root.dataset.filmInitialized==='true')return()=>{}
 root.dataset.filmInitialized='true'
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width: 600px)'),connection=navigator.connection
 let visible=false,userPaused=false,disposed=false,loaded=false
 const staticPolicy=()=>reduce.matches||connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)
 const label=(text,state)=>{status.textContent=text;root.dataset.filmState=state;button.textContent=video.paused?'播放影片':'暂停影片';button.setAttribute('aria-pressed',String(!video.paused))}
 const pause=reason=>{video.pause();label(reason,'paused')}
 const play=async(manual=false)=>{if(disposed||document.hidden||!visible||(!manual&&(userPaused||staticPolicy())))return;if(manual&&video.error)loaded=false;if(!loaded){video.src=sources[small.matches?1:0];video.muted=true;video.load();loaded=true}try{await video.play();if(disposed||document.hidden||!visible||(!manual&&(userPaused||staticPolicy())))pause('静态阅读')}catch(error){if(disposed)return;if(video.error||error?.name!=='NotAllowedError')failed();else label('自动播放未获允许，可手动播放','autoplay-denied')}}
 const playing=()=>{root.dataset.hasFrame='true';label('品牌情境影像 · 概念演绎','playing')}
 const failed=()=>{video.pause();root.dataset.hasFrame='false';label('影片暂不可用，保留静态画面','error')}
 const click=()=>{if(!video.paused){userPaused=true;pause('影片已暂停')}else{userPaused=false;void play(true)}}
 const policy=()=>{if(document.hidden||staticPolicy())pause('静态阅读');else void play()}
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)void play();else pause('离屏暂停')},{threshold:.15})
 button.hidden=false;button.disabled=false;button.setAttribute('aria-pressed','false');label('影片可播放','ready');observer.observe(root)
 video.addEventListener('playing',playing);video.addEventListener('error',failed);button.addEventListener('click',click);document.addEventListener('visibilitychange',policy);reduce.addEventListener('change',policy);connection?.addEventListener?.('change',policy)
 return()=>{disposed=true;root.dataset.filmInitialized='false';video.pause();observer.disconnect();video.removeEventListener('playing',playing);video.removeEventListener('error',failed);button.removeEventListener('click',click);document.removeEventListener('visibilitychange',policy);reduce.removeEventListener('change',policy);connection?.removeEventListener?.('change',policy)}
}

// Natural scroll, one bounded CSS update per frame. No scroll interception or media fabrication.
function initLightStory() {
 const root=document.querySelector('[data-light-story]');if(!root)return()=>{}
 const policy=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,dead=false
 const draw=()=>{raf=0;if(dead||document.hidden)return;const bridge=root.querySelector('.v51-light-bridge');if(!bridge)return;const b=bridge.getBoundingClientRect(),progress=policy.matches?0:Math.min(1,Math.max(0,(innerHeight-b.top)/(innerHeight+b.height)));root.style.setProperty('--light-progress',progress.toFixed(3));root.dataset.lightProgress=progress.toFixed(3)}
 const schedule=()=>{if(!raf&&!dead&&!document.hidden)raf=requestAnimationFrame(draw)}
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else schedule()}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);policy.addEventListener('change',schedule);document.addEventListener('visibilitychange',visibility);schedule()
 return()=>{dead=true;cancelAnimationFrame(raf);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);policy.removeEventListener('change',schedule);document.removeEventListener('visibilitychange',visibility)}
}

// Native same-origin media only. No generation service, tracking or business API.
function initV52(){
 const page=document.querySelector('[data-v52]');if(!page)return()=>{}
 const root=page.querySelector('[data-v52-film]'),video=root.querySelector('video'),button=root.querySelector('[data-v52-film-toggle]'),status=root.querySelector('[data-v52-film-status]'),reduce=matchMedia('(prefers-reduced-motion:reduce)'),connection=navigator.connection
 let visible=false,loaded=false,disposed=false,userPaused=false,ended=false,timer,scrollFrame=0
 const staticPolicy=()=>reduce.matches||connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)
 const state=(value,text)=>{root.dataset.filmState=value;status.textContent=text;button.textContent=value==='playing'?'暂停影片':ended?'重播影片':value==='error'?'重试播放':'播放影片';button.setAttribute('aria-pressed',String(value==='playing'))}
 const pause=text=>{video.pause();clearTimeout(timer);state('paused',text)}
 const fail=()=>{video.pause();root.dataset.hasFrame='false';clearTimeout(timer);state('error','影片暂不可用，可重试播放；封面与完整内容保留。')}
 const play=async(manual=false)=>{if(disposed||!visible||document.hidden||(!manual&&(staticPolicy()||userPaused||ended)))return;if(!video.paused&&!video.ended){state('playing','10秒静音影片 · Google Flow AI品牌情境演绎');return}if(manual&&video.error)loaded=false;if(!loaded){const path=root.dataset[matchMedia('(max-width:600px)').matches?'sourceMobile':'sourceDesktop'];if(!/^\/media\/v52\/cafe_hero_silent_(540|720)p\.mp4$/.test(path)){fail();return}video.src=path;video.muted=true;video.load();loaded=true}if(ended){video.currentTime=0;ended=false}state('loading','正在加载10秒静音影片…');timer=setTimeout(()=>{if(video.readyState<3){root.dataset.hasFrame='false';state('waiting','网络较慢，可稍后播放；先保留影片封面。')}},8000);try{await video.play();if(disposed||!visible||document.hidden||(!manual&&(staticPolicy()||userPaused)))pause('影片已暂停')}catch(e){clearTimeout(timer);if(disposed)return;if(e?.name==='NotAllowedError')state('autoplay-denied','自动播放未获允许，请选择播放影片。');else fail()}}
 const playing=()=>{clearTimeout(timer);root.dataset.hasFrame='true';state('playing','10秒静音影片 · Google Flow AI品牌情境演绎')}
 const finish=()=>{ended=true;clearTimeout(timer);state('ended','影片播放完毕 · 可重播完整10秒影片')}
 const click=()=>{if(!video.paused){userPaused=true;pause('影片已暂停')}else{userPaused=false;void play(true)}}
 const policy=()=>{if(document.hidden||staticPolicy())pause(document.hidden?'后台暂停':'静态阅读 · 可主动播放影片');else void play()}
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)void play();else pause('离屏暂停')},{threshold:.25});observer.observe(root.querySelector('.v52-film-picture'))
 const light=()=>{scrollFrame=0;const r=page.querySelector('.v52-handoff').getBoundingClientRect();page.style.setProperty('--story-light',String(Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)))))}
 const scroll=()=>{if(!scrollFrame&&!reduce.matches)scrollFrame=requestAnimationFrame(light)}
 // Text-only zoom can outgrow an art-directed composition. Reflow, never clip text.
 const title=page.querySelector('h1'),reading=()=>{const size=parseFloat(getComputedStyle(title.querySelector('span')).fontSize);page.dataset.readingLayout=String(size>Math.min(156,innerWidth*.18))},textObserver=new ResizeObserver(reading);textObserver.observe(title);reading()
 button.hidden=false;state(staticPolicy()?'static':'ready',staticPolicy()?'静态阅读 · 可主动播放影片':'10秒影片 · 默认静音');video.addEventListener('playing',playing);video.addEventListener('ended',finish);video.addEventListener('error',fail);button.addEventListener('click',click);document.addEventListener('visibilitychange',policy);reduce.addEventListener('change',policy);connection?.addEventListener?.('change',policy);window.addEventListener('scroll',scroll,{passive:true});light()
 return()=>{disposed=true;observer.disconnect();textObserver.disconnect();clearTimeout(timer);cancelAnimationFrame(scrollFrame);video.pause();video.removeEventListener('playing',playing);video.removeEventListener('ended',finish);video.removeEventListener('error',fail);button.removeEventListener('click',click);document.removeEventListener('visibilitychange',policy);reduce.removeEventListener('change',policy);connection?.removeEventListener?.('change',policy);window.removeEventListener('scroll',scroll)}
}

// Visibility, consent, resource ownership and a single lazy same-origin WebGL module.
function initPlanet(){
 const stage=document.querySelector('[data-planet-scene]');if(!stage)return()=>{}
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),connection=navigator.connection,button=stage.querySelector('[data-planet-toggle]'),status=stage.querySelector('[data-planet-status]')
 const staticChoice=new URLSearchParams(location.search).get('visual')==='static'
 const low=()=>reduce.matches||connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)||staticChoice
 let disposed=false,visible=false,paused=false,started=false,lost=false,instance,ownedCanvas,idle
 const label=()=>{button.hidden=!instance;button.textContent=paused?'继续双星运行':'暂停双星运行';button.setAttribute('aria-pressed',String(paused));status.textContent=instance?(paused?'双星运行已暂停':'抽象星球与两颗星体正在三维运行'):'静态品牌星球与双星'}
 const detach=()=>{ownedCanvas?.removeEventListener('webglcontextlost',onLost);ownedCanvas?.removeEventListener('webglcontextrestored',onRestored)}
 const destroy=()=>{detach();instance?.destroy();instance=undefined;delete stage.__lastarPlanet;started=false;stage.dataset.renderer='fallback';label()}
 const onLost=e=>{e.preventDefault();if(disposed)return;lost=true;instance?.destroy();instance=undefined;delete stage.__lastarPlanet;started=false;stage.dataset.renderer='fallback';stage.dataset.reason='context-lost';label()}
 const onRestored=()=>{if(disposed)return;lost=false;stage.dataset.reason='context-restored';schedule()}
 const load=()=>{if(disposed||started||lost||low()||!visible||document.hidden)return;started=true
  import(/* webpackIgnore: true */ stage.dataset.planetModule).then(module=>{if(disposed||low()){started=false;return}detach();const previous=stage.querySelector('canvas');ownedCanvas=previous.cloneNode(false);previous.replaceWith(ownedCanvas);ownedCanvas.addEventListener('webglcontextlost',onLost);ownedCanvas.addEventListener('webglcontextrestored',onRestored);instance=module.mountPlanet(stage);stage.__lastarPlanet=instance;instance.setVisible(visible);instance.setPaused(paused);delete stage.dataset.reason;delete stage.dataset.detail;label()}).catch(error=>{destroy();try{const gl=ownedCanvas?.getContext('webgl2')??ownedCanvas?.getContext('webgl');gl?.getExtension('WEBGL_lose_context')?.loseContext()}catch{}stage.dataset.reason='webgl-or-module-unavailable';stage.dataset.detail=String(error?.message??'Unknown graphics error').slice(0,180)})
 }
 const schedule=()=>{if(disposed||started||lost||low()||!visible||document.hidden)return;if('cancelIdleCallback'in window)cancelIdleCallback(idle);else clearTimeout(idle);idle='requestIdleCallback'in window?requestIdleCallback(load,{timeout:700}):setTimeout(load,120)}
 const policy=()=>{if(low()){destroy();stage.dataset.reason=staticChoice?'user-static':'device-policy'}else schedule()}
 const click=()=>{paused=!paused;instance?.setPaused(paused);label()}
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;instance?.setVisible(visible);if(visible)schedule()},{threshold:.07});observer.observe(stage)
 button.addEventListener('click',click);reduce.addEventListener('change',policy);connection?.addEventListener?.('change',policy);document.addEventListener('visibilitychange',schedule);policy();label()
 return()=>{disposed=true;observer.disconnect();destroy();button.removeEventListener('click',click);reduce.removeEventListener('change',policy);connection?.removeEventListener?.('change',policy);document.removeEventListener('visibilitychange',schedule);if('cancelIdleCallback'in window)cancelIdleCallback(idle);else clearTimeout(idle)}
}

initBrandScenes();initOrbitSculpture();initBrandFilm();initLightStory();initV52();initPlanet()})();
