#!/bin/bash

# 设置脚本在执行出错时立即退出
export PS1='\[\033[1;32m\]转换中...\[\033[0m\] '

echo "===== Excel 到 JSON 转换工具 ====="
echo "此工具将自动将 '修改器合集.xlsx' 转换为 'modifiers_data.json'"
echo "=================================="

# 检查当前目录
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "当前工作目录: $CURRENT_DIR"

# 检查是否安装了Node.js
if ! command -v node &> /dev/null
then
    echo "\n错误: 未找到Node.js!"
    echo "请先安装Node.js，然后再运行此脚本。"
    echo "安装方法: 访问 https://nodejs.org 下载并安装"
    echo "\n按任意键退出..."
    read -n 1 -s
    exit 1
fi

# 检查是否安装了xlsx库
if ! node -e "try { require('xlsx'); } catch (e) { process.exit(1); }" &> /dev/null
then
    echo "\n检测到未安装xlsx库，正在安装..."
    npm install xlsx --save
    if [ $? -ne 0 ];
    then
        echo "\n错误: xlsx库安装失败!"
        echo "请检查网络连接或手动安装: npm install xlsx"
        echo "\n按任意键退出..."
        read -n 1 -s
        exit 1
    fi
fi

# 运行转换脚本
echo "\n开始转换..."
node "$CURRENT_DIR/convert_excel_to_json.js"

# 脚本退出状态
exit_status=$?

if [ $exit_status -eq 0 ];
then
    echo "\n✅ 转换完成!"
else
    echo "\n❌ 转换失败!"
fi

echo "\n按任意键退出..."
read -n 1 -s