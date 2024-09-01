document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const text = urlParams.get('text');
  const pageUrl = urlParams.get('url');
  const pageTitle = urlParams.get('title');
  const imageContainer = document.getElementById('image-container');
  const downloadButton = document.getElementById('download-button');
  const copyButton = document.getElementById('copy-button');

  let generatedImage;

  generateImage();

  downloadButton.addEventListener('click', downloadImage);
  copyButton.addEventListener('click', copyImage);

  function generateImage() {
    const width = 600;
    let height = 200; 

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    
    const lines = wrapText(text, 560, ctx);
    lines.forEach((line, index) => {
      ctx.fillText(line, 20, 40 + index * 22);
    });

    const textHeight = lines.length * 22;
    height = Math.max(height, textHeight + 100);

    canvas.height = height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    lines.forEach((line, index) => {
      ctx.fillText(line, 20, 40 + index * 22);
    });

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, height - 60, width, 60);

    ctx.font = '14px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(pageTitle, 20, height - 35);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    const truncatedUrl = truncateUrl(pageUrl, width - 40, ctx);
    ctx.fillText(truncatedUrl, 20, height - 15);

    generatedImage = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = generatedImage; 
    imageContainer.appendChild(img);
  }

  function wrapText(text, maxWidth, ctx) {
    const paragraphs = text.split('\n');
    const lines = [];

    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      if (paragraph !== paragraphs[paragraphs.length - 1]) {
        lines.push('');
      }
    });

    return lines;
  }

  function truncateUrl(url, maxWidth, ctx) {
    if (ctx.measureText(url).width <= maxWidth) {
      return url;
    }

    const ellipsis = '...';
    let truncated = url;

    while (ctx.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + ellipsis;
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated_image.png';
    link.click();
  }

  function copyImage() {
    fetch(generatedImage)
      .then(res => res.blob())
      .then(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          alert('Image copied to clipboard!');
        }, (error) => {
          console.error('Error copying image to clipboard:', error);
          alert('Failed to copy image to clipboard.');
        });
      });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImageHeight") {
    const img = imageContainer.querySelector('img');
    sendResponse({height: img.height});
  }
});