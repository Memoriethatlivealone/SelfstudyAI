const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  // 创建 frames 文件夹
  const framesDir = path.join(__dirname, 'frames');
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir);
  }

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 设置视口
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });

  // 加载本地 HTML 文件
  const htmlPath = `file://${path.join(__dirname, 'anim.html')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // 截取参数
  const fps = 30;
  const duration = 15; // 秒
  const totalFrames = fps * duration;
  const frameInterval = 1000 / fps; // 毫秒

  console.log(`开始截取 ${duration} 秒动画，共 ${totalFrames} 帧，帧率 ${fps} fps`);

  // 截取每一帧
  for (let i = 0; i < totalFrames; i++) {
    const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath });

    if ((i + 1) % 30 === 0) {
      console.log(`已截取 ${i + 1}/${totalFrames} 帧`);
    }

    // 等待下一帧
    await page.waitForTimeout(frameInterval);
  }

  console.log('截图完成！');
  await browser.close();
})();
