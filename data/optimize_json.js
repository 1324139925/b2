const fs = require('fs');
const path = require('path');

// 文件路径
const inputPath = path.join(__dirname, 'modifiers_data.json');
const outputPath = path.join(__dirname, 'optimized', 'modifiers_data.min.json');

// 读取并压缩JSON文件
try {
    // 读取原始文件
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    // 获取原始文件大小
    const originalSize = fs.statSync(inputPath).size;
    console.log(`原始文件大小: ${(originalSize/1024).toFixed(2)} KB`);
    
    // 压缩JSON（移除空格和换行符）
    const compressedData = JSON.stringify(jsonData);
    fs.writeFileSync(outputPath, compressedData, 'utf8');
    
    // 获取压缩后文件大小
    const compressedSize = fs.statSync(outputPath).size;
    console.log(`压缩后文件大小: ${(compressedSize/1024).toFixed(2)} KB`);
    
    // 计算压缩率
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    console.log(`文件大小减少: ${reduction.toFixed(2)}%`);
    
    // 创建gzip压缩版本（需要额外的库，但先创建基础压缩版本）
    console.log('JSON文件已成功压缩并保存至:', outputPath);
    
} catch (error) {
    console.error('压缩JSON文件时出错:', error);
}