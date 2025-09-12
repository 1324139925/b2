import json
import os

# 输入和输出文件路径
input_path = '/Users/wy/Desktop/网站源码/测试2/data/modifiers_data.json'
output_path = '/Users/wy/Desktop/网站源码/测试2/data/optimized/modifiers_data.min.json'

# 读取原始JSON文件
try:
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 获取原始文件大小
    original_size = os.path.getsize(input_path)
    print(f'原始文件大小: {original_size/1024:.2f} KB')
    
    # 压缩JSON（移除空格和换行符）
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    
    # 获取压缩后文件大小
    compressed_size = os.path.getsize(output_path)
    print(f'压缩后文件大小: {compressed_size/1024:.2f} KB')
    
    # 计算压缩率
    reduction = ((original_size - compressed_size) / original_size) * 100
    print(f'文件大小减少: {reduction:.2f}%')
    
    print(f'JSON文件已成功压缩并保存至: {output_path}')
    
except Exception as e:
    print(f'压缩JSON文件时出错: {e}')