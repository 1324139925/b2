#!/bin/bash

# 设置脚本在执行出错时立即退出
export PS1='\[\033[1;32m\]转换中...\[\033[0m\] '

echo "===== Excel 到 JSON 转换工具 (Python版) ====="
echo "此工具将自动将 '修改器合集.xlsx' 转换为 'modifiers_data.min.json'（压缩优化版本）"
echo "=================================="

# 检查当前目录
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "当前工作目录: $CURRENT_DIR"

# 检查是否安装了Python3
if ! command -v python3 &> /dev/null
then
    echo "\n错误: 未找到Python3!"
    echo "请先安装Python3，然后再运行此脚本。"
    echo "安装方法: 访问 https://www.python.org 下载并安装"
    echo "\n按任意键退出..."
    read -n 1 -s
    exit 1
fi

# 检查是否安装了pandas库
if ! python3 -c "import pandas" &> /dev/null
then
    echo "\n检测到未安装pandas库，正在安装..."
    python3 -m pip install pandas openpyxl
    if [ $? -ne 0 ];
    then
        echo "\n错误: pandas库安装失败!"
        echo "请手动安装: python3 -m pip install pandas openpyxl"
        echo "如果遇到权限问题，请尝试: python3 -m pip install --user pandas openpyxl"
        echo "\n按任意键退出..."
        read -n 1 -s
        exit 1
    fi
fi

# 运行转换脚本
echo "\n开始转换..."
python3 "$CURRENT_DIR/convert_excel_to_json.py"

# 脚本退出状态
exit_status=$?

if [ $exit_status -eq 0 ];
then
    echo "\n✅ 转换完成!"
    echo "\n开始压缩优化JSON文件..."
    python3 "$CURRENT_DIR/data/compress_json.py"
    
    compress_exit_status=$?
    if [ $compress_exit_status -eq 0 ];
    then
        echo "\n✅ JSON文件压缩优化完成!"
    else
        echo "\n❌ JSON文件压缩优化失败!"
    fi
else
    echo "\n❌ 转换失败!"
fi

echo "\n按任意键退出..."
read -n 1 -s