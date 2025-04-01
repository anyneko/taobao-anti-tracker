export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Only POST requests are allowed", { status: 405 });
    }

    const { inputText } = await request.json();
    if (!inputText) {
      return new Response("Missing inputText", { status: 400 });
    }

    let url = "";
    let startText = "";
    let linkOnly = false;

    // 正则表达式匹配 URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = inputText.match(urlRegex);

    if (matches) {
      if (matches.length === 1) {
        url = matches[0];
        linkOnly = false;

        // 提取符合「[^「」]*」的文本
        const textMatch = inputText.match(/「([^「」]*)」/);
        if (textMatch) {
          startText = textMatch[1];
        }
      } else {
        url = inputText;
        linkOnly = true;
      }
    } else {
      return new Response("No valid URL found", { status: 400 });
    }

    // 获取转换后的 URL
    const convertedUrl = await convertUrl(url);
    if (!convertedUrl) {
      return new Response("Failed to fetch converted URL", { status: 500 });
    }

    return new Response(linkOnly ? convertedUrl : `${startText} ${convertedUrl}`, {
      headers: { "Content-Type": "text/plain" },
    });
  },
};

// 解析网页并格式化 URL
async function convertUrl(url) {
  try {
    // 获取网页内容
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // 提取 var url = '...';
    const urlMatch = html.match(/var url = '([^']+)'/);
    if (!urlMatch) {
      return null;
    }

    let extractedUrl = urlMatch[1];

    // 仅保留 id 参数
    const idMatch = extractedUrl.match(/(https:\/\/item\.taobao\.com\/item\.htm\?)([^&]*id=[0-9]+)/);
    if (!idMatch) {
      return extractedUrl;
    }

    return `${idMatch[1]}${idMatch[2]}`;
  } catch (error) {
    return null;
  }
}

