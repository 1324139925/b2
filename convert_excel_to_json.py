#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import shutil
import pandas as pd
from datetime import datetime

# 配置信息
excel_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', '修改器合集.xlsx')
json_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'modifiers_data.json')
backup_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'backups')

print('===== Excel 到 JSON 转换工具 (Python版) =====')
print('此工具将自动将 \'修改器合集.xlsx\' 转换为 \'modifiers_data.json\'')
print('==================================')
print(f'当前工作目录: {os.path.dirname(os.path.abspath(__file__))}')

# 检查Excel文件是否存在
if not os.path.exists(excel_file_path):
    print('错误: Excel文件不存在!')
    print(f'预期路径: {excel_file_path}')
    input('\n按回车键退出...')
    sys.exit(1)

# 检查pandas库是否已安装
try:
    import pandas as pd
except ImportError:
    print('\n错误: 未找到pandas库!')
    print('请先安装pandas库，然后再运行此脚本。')
    print('安装方法: 在终端中运行 "pip3 install pandas openpyxl"')
    input('\n按回车键退出...')
    sys.exit(1)

# 创建备份目录
if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)
    print(f'已创建备份目录: {backup_dir}')

# 创建当前JSON文件的备份（如果存在）
if os.path.exists(json_output_path):
    backup_file_name = f'modifiers_data_backup_{datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}.json'
    backup_path = os.path.join(backup_dir, backup_file_name)
    shutil.copy2(json_output_path, backup_path)
    print(f'已创建备份: {backup_path}')

try:
    print('\n开始转换...')
    print(f'读取Excel文件: {excel_file_path}')
    
    # 读取Excel文件
    df = pd.read_excel(excel_file_path)
    
    # 转换为JSON
    json_data = df.to_json(orient='records', force_ascii=False, indent=2)
    
    # 写入JSON文件
    with open(json_output_path, 'w', encoding='utf-8') as f:
        f.write(json_data)
    
    print(f'转换成功!')
    print(f'JSON文件已保存到: {json_output_path}')
    print(f'共转换 {len(df)} 条记录')
    print('\n✅ 转换完成!')
    
except Exception as e:
    print(f'\n❌ 转换过程中出错: {str(e)}')
    print('请检查Excel文件格式是否正确。')

print('\n按回车键退出...')
input()