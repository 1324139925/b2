/**
 * 数据加载器模块 - 优化版本
 * 实现数据分块加载、进度指示和性能优化
 */
const DataLoader = (function() {
    // 配置项
    const config = {
        batchSize: 200, // 每次加载的数据量
        batchDelay: 100, // 批次之间的延迟(ms)，避免阻塞UI
        progressUpdateInterval: 50, // 进度更新间隔(ms)
        enableWebWorker: true, // 是否使用Web Worker处理数据
        useStreaming: false // 是否使用流式处理
    };
    
    // 状态变量
    let loadingProgress = 0;
    let loadStartTime = 0;
    let progressCallback = null;
    let loadCompleteCallback = null;
    let webWorker = null;
    
    // 初始化Web Worker（如果支持）
    function initWebWorker() {
        if (!config.enableWebWorker || typeof Worker === 'undefined') {
            console.log('Web Worker不支持或已禁用');
            return null;
        }
        
        try {
            // 创建内联Web Worker
            const workerCode = `
                self.onmessage = function(e) {
                    const data = e.data;
                    const processedData = processData(data);
                    self.postMessage(processedData);
                };
                
                function processData(data) {
                    const processed = [];
                    const versionPattern = /(?:v?\\d+\\.\\d+(?:\\.\\d+)?)/i;
                    const antiCheatMarkerPattern = /\\s*\\(有反作弊文件\\)\\s*/;
                    
                    for (let i = 0; i < data.length; i++) {
                        const item = data[i];
                        let gameName, imageUrl, downloadUrl, antiCheatUrl;
                        
                        if (item.n !== undefined) {
                            gameName = item.n || '未知游戏';
                            imageUrl = item.i || '';
                            downloadUrl = item.d || '';
                            antiCheatUrl = item.a || '';
                        } else {
                            gameName = item["游戏名字"] || '未知游戏';
                            imageUrl = item["图片地址"] || '';
                            downloadUrl = item["下载地址"] || '';
                            antiCheatUrl = item["反作弊文件下载"] || '';
                        }
                        
                        gameName = gameName.toString().trim();
                        if (gameName.length > 2) {
                            const versionMatch = gameName.match(versionPattern);
                            if (versionMatch) {
                                gameName = gameName.replace(versionMatch[0], '').trim();
                            }
                            
                            if (antiCheatMarkerPattern.test(gameName)) {
                                gameName = gameName.replace(antiCheatMarkerPattern, '').trim();
                            }
                        }
                        
                        imageUrl = imageUrl.toString().trim();
                        downloadUrl = downloadUrl.toString().trim();
                        antiCheatUrl = antiCheatUrl.toString().trim();
                        
                        processed.push({
                            id: i + 1,
                            name: gameName,
                            imageUrl: imageUrl,
                            downloadUrl: downloadUrl,
                            antiCheatUrl: antiCheatUrl,
                            iconIndex: i % 10
                        });
                    }
                    
                    return processed;
                }
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            webWorker = new Worker(workerUrl);
            
            // 清理URL对象
            URL.revokeObjectURL(workerUrl);
            
            console.log('Web Worker初始化成功');
            return webWorker;
        } catch (error) {
            console.error('Web Worker初始化失败:', error);
            return null;
        }
    }
    
    // 模拟数据加载进度
    function simulateProgress(totalSteps, currentStep) {
        const newProgress = Math.min((currentStep / totalSteps) * 100, 100);
        if (newProgress > loadingProgress) {
            loadingProgress = newProgress;
            if (progressCallback) {
                progressCallback(loadingProgress);
            }
        }
    }
    
    // 分块处理数据
    function processDataInChunks(data, callback) {
        const totalBatches = Math.ceil(data.length / config.batchSize);
        const processedData = [];
        let currentBatch = 0;
        
        function processNextBatch() {
            if (currentBatch >= totalBatches) {
                callback(processedData);
                return;
            }
            
            const startIndex = currentBatch * config.batchSize;
            const endIndex = Math.min(startIndex + config.batchSize, data.length);
            const batchData = data.slice(startIndex, endIndex);
            
            // 处理当前批次
            const processedBatch = [];
            for (let i = 0; i < batchData.length; i++) {
                const item = batchData[i];
                let gameName, imageUrl, downloadUrl, antiCheatUrl;
                
                if (item.n !== undefined) {
                    gameName = item.n || '未知游戏';
                    imageUrl = item.i || '';
                    downloadUrl = item.d || '';
                    antiCheatUrl = item.a || '';
                } else {
                    gameName = item["游戏名字"] || '未知游戏';
                    imageUrl = item["图片地址"] || '';
                    downloadUrl = item["下载地址"] || '';
                    antiCheatUrl = item["反作弊文件下载"] || '';
                }
                
                // 简单处理数据
                gameName = gameName.toString().trim();
                imageUrl = imageUrl.toString().trim();
                downloadUrl = downloadUrl.toString().trim();
                antiCheatUrl = antiCheatUrl.toString().trim();
                
                processedBatch.push({
                    id: startIndex + i + 1,
                    name: gameName,
                    imageUrl: imageUrl,
                    downloadUrl: downloadUrl,
                    antiCheatUrl: antiCheatUrl,
                    iconIndex: (startIndex + i) % 10
                });
            }
            
            // 添加到结果中
            processedData.push(...processedBatch);
            
            // 更新进度
            currentBatch++;
            simulateProgress(totalBatches, currentBatch);
            
            // 延迟处理下一批次
            setTimeout(processNextBatch, config.batchDelay);
        }
        
        // 开始处理第一批
        processNextBatch();
    }
    
    // 公开方法
    return {
        // 设置进度回调函数
        onProgress: function(callback) {
            progressCallback = callback;
            return this;
        },
        
        // 设置加载完成回调函数
        onComplete: function(callback) {
            loadCompleteCallback = callback;
            return this;
        },
        
        // 加载数据
        loadData: function(filePath) {
            loadStartTime = performance.now();
            loadingProgress = 0;
            
            console.log(`开始加载数据文件: ${filePath}`);
            
            // 使用fetch API加载数据
            fetch(filePath, {
                cache: 'default',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br'
                },
                signal: AbortSignal.timeout(15000)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`数据加载失败: ${response.status} ${response.statusText}`);
                }
                
                console.log('数据文件请求成功，开始解析JSON');
                return response.json();
            })
            .then(jsonData => {
                const loadTime = performance.now() - loadStartTime;
                console.log(`JSON数据加载完成，耗时: ${loadTime.toFixed(2)}ms, 共 ${jsonData.length} 条记录`);
                
                // 尝试使用Web Worker处理数据
                const worker = initWebWorker();
                if (worker) {
                    console.log('使用Web Worker处理数据');
                    
                    worker.onmessage = function(e) {
                        const processedData = e.data;
                        const processTime = performance.now() - loadStartTime;
                        console.log(`Web Worker数据处理完成，总耗时: ${processTime.toFixed(2)}ms`);
                        
                        // 通知进度完成
                        if (progressCallback) {
                            progressCallback(100);
                        }
                        
                        // 通知加载完成
                        if (loadCompleteCallback) {
                            loadCompleteCallback(processedData);
                        }
                        
                        // 清理Web Worker
                        worker.terminate();
                    };
                    
                    worker.onerror = function(error) {
                        console.error('Web Worker处理数据失败:', error);
                        
                        // 回退到主线程分块处理
                        console.log('回退到主线程分块处理数据');
                        processDataInChunks(jsonData, function(processedData) {
                            const processTime = performance.now() - loadStartTime;
                            console.log(`主线程数据处理完成，总耗时: ${processTime.toFixed(2)}ms`);
                            
                            if (loadCompleteCallback) {
                                loadCompleteCallback(processedData);
                            }
                        });
                        
                        // 清理Web Worker
                        worker.terminate();
                    };
                    
                    // 发送数据到Web Worker
                    worker.postMessage(jsonData);
                } else {
                    // 使用主线程分块处理
                    console.log('使用主线程分块处理数据');
                    processDataInChunks(jsonData, function(processedData) {
                        const processTime = performance.now() - loadStartTime;
                        console.log(`数据处理完成，总耗时: ${processTime.toFixed(2)}ms`);
                        
                        if (loadCompleteCallback) {
                            loadCompleteCallback(processedData);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('数据加载或处理失败:', error);
                
                // 通知加载失败
                if (loadCompleteCallback) {
                    loadCompleteCallback(null, error);
                }
            });
            
            return this;
        },
        
        // 获取当前加载进度
        getProgress: function() {
            return loadingProgress;
        },
        
        // 取消加载
        cancel: function() {
            if (webWorker) {
                webWorker.terminate();
                webWorker = null;
            }
            
            // 重置状态
            loadingProgress = 0;
            loadStartTime = 0;
            
            console.log('数据加载已取消');
        },
        
        // 更新配置
        updateConfig: function(newConfig) {
            Object.assign(config, newConfig);
            return this;
        }
    };
})();

// 导出模块（兼容浏览器全局对象）
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DataLoader;
} else if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
}