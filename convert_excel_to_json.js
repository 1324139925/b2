const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 配置信息
const EXCEL_FILE_PATH = path.join(__dirname, 'data', '修改器合集.xlsx');
const JSON_OUTPUT_PATH = path.join(__dirname, 'data', 'modifiers_data.json');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');

console.log('开始转换Excel到JSON...');
console.log(`读取Excel文件: ${EXCEL_FILE_PATH}`);

// 检查Excel文件是否存在
if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error('错误: Excel文件不存在!');
    process.exit(1);
}

// 创建备份目录
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// 创建当前JSON文件的备份（如果存在）
if (fs.existsSync(JSON_OUTPUT_PATH)) {
    const backupFileName = `modifiers_data_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    fs.copyFileSync(JSON_OUTPUT_PATH, backupPath);
    console.log(`已创建备份: ${backupPath}`);
}

try {
    // 读取Excel文件
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    
    // 获取第一个工作表
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 提取表头
    const headers = jsonData[0];
    
    // 转换数据格式，使每条记录都是对象
    const formattedData = jsonData.slice(1).map(row => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = row[index];
        });
        return record;
    });
    
    // 写入JSON文件
    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(formattedData, null, 2));
    
    console.log(`转换成功!`);
    console.log(`JSON文件已保存到: ${JSON_OUTPUT_PATH}`);
    console.log(`共转换 ${formattedData.length} 条记录`);
    console.log('\n请按回车键退出...');
    
    // 等待用户按回车键
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
    
} catch (error) {
    console.error('转换过程中出错:', error.message);
    console.log('\n请按回车键退出...');
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 1));
}