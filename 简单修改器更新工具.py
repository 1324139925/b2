#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import pandas as pd

# 配置参数
EXCEL_FILE_PATH = os.path.join('数据', '修改器合集.xlsx')
OUTPUT_JSON_PATH = os.path.join('数据', 'modifiers_data.json')


# 读取Excel并转换为JSON
def convert_excel_to_json():
    try:
        # 读取Excel文件
        df = pd.read_excel(EXCEL_FILE_PATH)
        
        # 转换为字典列表
        data = df.to_dict('records')
        
        # 处理数据，移除NaN值
        processed_data = []
        for item in data:
            processed_item = {}
            for key, value in item.items():
                # 处理NaN值
                if pd.isna(value):
                    processed_item[key] = ''
                else:
                    processed_item[key] = str(value).strip()
            processed_data.append(processed_item)
        
        # 保存原始JSON文件
        with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=2)
        
        print(f'✓ 成功转换 {len(processed_data)} 条修改器数据')
        print(f'✓ 生成文件:')
        print(f'  - 原始JSON: {OUTPUT_JSON_PATH}')
        
    except Exception as e:
        print(f'✗ 转换过程中出错: {str(e)}')
        return False
    return True


# 主函数
def main():
    # 清空屏幕（兼容Windows和Mac）
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print('=' * 60)
    print('        修改器数据自动更新工具        ')
    print('=' * 60)
    print('这个工具会自动读取Excel文件并更新网站数据')
    print('=' * 60)
    print()
    
    # 检查Excel文件是否存在
    if not os.path.exists(EXCEL_FILE_PATH):
        print(f'✗ 错误: 找不到Excel文件 {EXCEL_FILE_PATH}')
        print('请确保您的Excel文件放在正确的位置')
        input('按回车键退出...')
        return
    
    try:
        # 安装必要的库
        try:
            import pandas as pd
        except ImportError:
            print('正在安装必要的Python库...')
            os.system('pip install pandas openpyxl')
            print('✓ 库安装完成')
        
        # 执行主要流程
        success = convert_excel_to_json()
        
        if success:
            print()
            print('=' * 60)
            print('🎉 数据更新完成！')
            print('您的网站现在已经自动同步了最新的修改器数据')
            print('=' * 60)
        
    except Exception as e:
        print(f'✗ 程序执行出错: {str(e)}')
        print('请确保您的电脑已安装Python')
    
    input('按回车键退出...')


if __name__ == '__main__':
    main()