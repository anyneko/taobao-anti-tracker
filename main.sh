#!/bin/bash

# 检查是否提供了URL参数
if [ -z "$1" ]; then
    echo "Usage: $0 <URL>"
    exit 1
fi

# 获取页面内容
html_content=$(curl -s "$1")

# 提取页面中的"url"变量
url=$(echo "$html_content" | grep -oP "var url = '\Khttps?://[^\']+")
#不要问我为什么域名写死了
link="https://item.taobao.com/item.htm?"
# 提取id参数 淘宝只需要id参数就可以定位到单个商品
id=$(echo "$url" | sed -n 's/.*&\(id=[^&]*\)&.*/\1/p')
url=$link$id
echo "$url"
# 就这样吧，他们再改了~~我也懒得改了~~我可没说我懒得改，是copilot说的
