// remove_splash_ads.js
// 通用去开屏/推送广告响应体修改脚本 for Quantumult X 兼容版
(function () {
  const body = $response.body || '';
  const headers = $response.headers || {};
  const contentType = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();

  // 尝试 JSON 解析并删除常见广告字段（保留结构）
  if (contentType.indexOf('application/json') !== -1 || (/^\s*[\{\[]/.test(body))) {
    try {
      let obj = JSON.parse(body);

      const removeAdKeys = (o) => {
        if (!o || typeof o !== 'object') return;
        if (Array.isArray(o)) {
          o.forEach(item => removeAdKeys(item));
        } else {
          for (let k of Object.keys(o)) {
            const lk = k.toLowerCase();
            if (lk.includes('ad') || lk.includes('advert') || lk.includes('splash') || lk.includes('startup') || lk.includes('banner')) {
              try { delete o[k]; } catch (e) {}
            } else {
              removeAdKeys(o[k]);
            }
          }
        }
      };

      removeAdKeys(obj);

      const clearArrays = (o) => {
        if (!o || typeof o !== 'object') return;
        if (Array.isArray(o)) {
          o.forEach(item => clearArrays(item));
        } else {
          for (let k of Object.keys(o)) {
            const lk = k.toLowerCase();
            if (lk === 'ads' || lk === 'adlist' || lk === 'recommendations' || lk === 'item_list') {
              if (Array.isArray(o[k])) o[k] = [];
            } else {
              clearArrays(o[k]);
            }
          }
        }
      };

      clearArrays(obj);

      $done({ body: JSON.stringify(obj) });
      return;
    } catch (e) {
      // JSON parse fail -> fallback to text replacement
    }
  }

  // HTML / JS 文本的保守替换，避免破坏主站结构
  let newBody = body
    .replace(/<iframe[^>]*?src=['"][^'"]*ad[^'"]*['"][\s\S]*?<\/iframe>/gi, '')
    .replace(/<div[^>]*?(class|id)=['"][^'"]*(ad|ads|splash|banner)[^'"]*['"][\s\S]*?<\/div>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?(adserver|adservice|advert|splash|startadv)[\s\S]*?<\/script>/gi, '');

  if (newBody === body) {
    $done({ body });
  } else {
    $done({ body: newBody });
  }
})();
