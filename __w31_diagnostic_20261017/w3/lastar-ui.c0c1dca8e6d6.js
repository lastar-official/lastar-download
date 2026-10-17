// First-party progressive enhancement for the information-only static export.
// No framework hydration, requests, tracking, authentication or business data.
(() => {
  const start = () => {
    const root = document.documentElement;
    const themeButton = document.querySelector('.theme-toggle');
    const media = matchMedia('(prefers-color-scheme: dark)');
    const readTheme = () => { try { return localStorage.getItem('lastar.web.theme'); } catch { return null; } };
    let explicit = ['dawn', 'night'].includes(readTheme());
    const paintTheme = theme => {
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
      if (!themeButton) return;
      themeButton.setAttribute('aria-label', theme === 'night' ? '切换到晨雾主题' : '切换到夜航主题');
      themeButton.children[0].textContent = theme === 'night' ? '☀' : '☾';
      themeButton.children[1].textContent = theme === 'night' ? '晨雾' : '夜航';
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

initBrandScenes();initOrbitSculpture()})();
