document.getElementById('captureBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const captureBtn = document.getElementById('captureBtn');
  
  try {
    captureBtn.disabled = true;
    statusDiv.textContent = '取得中...';
    statusDiv.className = 'info';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractHtmlAndCss
    });

    const data = results[0].result;

    // storage に保存
    await chrome.storage.local.set({
      capturedData: {
        html: data.html,
        css: data.css,
        url: tab.url,
        title: tab.title,
        timestamp: Date.now()
      }
    });

    // ★ 新規追加：クリップボードにコピー
    const dataJson = JSON.stringify({
      html: data.html,
      css: data.css,
      url: tab.url,
      title: tab.title
    });
    
    await navigator.clipboard.writeText(dataJson);

    statusDiv.textContent = '✓ 取得完了！クリップボードにコピーしました';
    statusDiv.className = 'success';

  } catch (error) {
    console.error('Error:', error);
    statusDiv.textContent = '✗ エラーが発生しました';
    statusDiv.className = 'error';
  } finally {
    captureBtn.disabled = false;
  }
});

document.getElementById('openToolBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});

function extractHtmlAndCss() {
  const html = document.documentElement.outerHTML;
  const allElements = document.querySelectorAll('*');
  const cssData = {};

  allElements.forEach((element, index) => {
    const computedStyle = window.getComputedStyle(element);
    const selector = `element-${index}`;
    
    const importantStyles = {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      display: computedStyle.display,
      position: computedStyle.position,
      width: computedStyle.width,
      height: computedStyle.height
    };

    element.setAttribute('data-style-id', selector);
    cssData[selector] = importantStyles;
  });

  return {
    html: html,
    css: JSON.stringify(cssData, null, 2),
    elementCount: allElements.length
  };
}

(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const titleElem = document.getElementById('page-title');
    const urlElem = document.getElementById('page-url');
    
    titleElem.textContent = tab.title || '(タイトルなし)';
    urlElem.textContent = tab.url || '';
  } catch (error) {
    console.error('Error loading tab info:', error);
  }
})();