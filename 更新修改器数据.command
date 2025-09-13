#!/bin/bash
# 简单的修改器数据更新启动器

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 切换到脚本目录
cd "$SCRIPT_DIR"

# 执行Python脚本
python3 "$SCRIPT_DIR/简单修改器更新工具.py"

# 执行完毕后暂停，让用户查看结果
echo "\n\n=== 操作已完成 ==="
echo "按任意键退出..."
read -n 1