addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('POST Only', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  try {
    // 解析 POST 请求中的 JSON 数据
    const requestData = await request.json() // 解析 JSON 数据
    console.log("Request Data:", requestData) // 输出接收到的数据

    const targetUrl = requestData.url

    if (!targetUrl) {
      return new Response('未提供有效的 URL', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    // 获取目标 URL 的 HTML 内容
    const htmlContent = await fetchHtmlContent(targetUrl)

    // 从 HTML 中提取 `url` 变量
    const extractedUrl = extractUrl(htmlContent)

    // 处理提取的 URL，简化格式
    const processedUrl = processUrl(extractedUrl)

    // 返回纯文本格式的简化 URL
    return new Response(processedUrl, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error("Error:", error)  // 输出错误信息
    return new Response(`错误: ${error.message}`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function fetchHtmlContent(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('获取 HTML 内容失败')
  }

  return await response.text()
}

function extractUrl(html) {
  const match = html.match(/url\s*=\s*['"]([^'"]+)['"]/)

  if (match && match[1]) {
    return match[1]
  } else {
    throw new Error('无法提取 URL')
  }
}

function processUrl(url) {
  const parsedUrl = new URL(url)

  const path = parsedUrl.pathname
  const idParam = parsedUrl.searchParams.get('id')

  let newUrl = `${parsedUrl.protocol}//${parsedUrl.host}${path}`

  if (idParam) {
    newUrl += `?id=${idParam}`
  }

  return newUrl
}

