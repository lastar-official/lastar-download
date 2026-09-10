// Progressive enhancement only. Download targets are generated from verified metadata.
const ua = navigator.userAgent;
const wechat = /MicroMessenger/i.test(ua);
const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const android = /Android/i.test(ua);
document.querySelectorAll('[data-wechat]').forEach(el => { el.hidden = !wechat; });
document.querySelectorAll('[data-desktop]').forEach(el => { el.hidden = android || ios; });
document.querySelectorAll('[data-ios]').forEach(el => { el.hidden = !ios; });
if (ios) {
  document.querySelectorAll('[data-apk]').forEach(el => { el.hidden = true; });
  document.querySelectorAll('[data-download-label]').forEach(el => { el.textContent = 'iOS 即将开放 · 查看详情'; });
}
