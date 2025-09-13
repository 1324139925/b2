// 游戏网格渲染相关函数模块

// 渲染游戏网格
function renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage) {
  gameGrid.innerHTML = '';
  
  if (filteredGames.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'col-span-full flex flex-col items-center justify-center py-20 text-center';
    noResults.innerHTML = `
      <div class="w-32 h-32 flex items-center justify-center mb-6 text-primary/50">
        <i class="fa fa-search text-8xl"></i>
      </div>
      <h2 class="text-2xl font-bold text-neutral-800 mb-2">未找到游戏</h2>
      <p class="text-neutral-600 mb-4">建议使用Wemod平台或使用其他关键词搜索</p>
      <a href="WeMod平台页面.html" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
        <i class="fa fa-external-link mr-2"></i> 前往Wemod平台
      </a>
    `;
    gameGrid.appendChild(noResults);
    return;
  }
  
  // 计算当前页显示的游戏
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = Math.min(startIndex + gamesPerPage, filteredGames.length);
  const currentGames = filteredGames.slice(startIndex, endIndex);
  
  // 创建游戏卡片
  currentGames.forEach(game => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-5 card-hover transition-all duration-300 flex flex-col items-center text-center border border-neutral-100';
    
    // 图标颜色数组 - 提高对比度的颜色
    const iconColors = ['text-primary', 'text-secondary', 'text-red-500', 'text-purple-500', 'text-amber-500'];
    const iconClasses = [
      'fa-gamepad', 'fa-rocket', 'fa-diamond', 'fa-star', 'fa-trophy',
      'fa-shield', 'fa-sword', 'fa-car', 'fa-plane', 'fa-space-shuttle'
    ];
    
    const colorClass = iconColors[game.iconIndex % iconColors.length];
    const iconClass = iconClasses[game.iconIndex % iconClasses.length];
    
    // 如果有图片URL，使用图片，否则使用图标
    let imageHtml = '';
    if (game.imageUrl && game.imageUrl.trim() !== '') {
      imageHtml = `
        <div class="w-full h-40 mb-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
          <img 
            data-src="${game.imageUrl}" 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" 
            alt="${game.name}" 
            class="lazy max-w-full max-h-full object-cover transition-transform duration-500 hover:scale-110"
          >
        </div>
      `;
    } else {
      imageHtml = `
        <div class="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-200 transition-all duration-300">
          <i class="fa ${iconClass} text-3xl ${colorClass}"></i>
        </div>
      `;
    }
    
    // 如果有下载地址，创建下载按钮，否则显示普通按钮
    let buttonHtml = '';
    if (game.downloadUrl && game.downloadUrl.trim() !== '') {
      buttonHtml = `
        <a href="${game.downloadUrl}" target="_blank" class="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
          <i class="fa fa-download"></i>
          下载修改器
        </a>
      `;
    } else {
      buttonHtml = `
        <button class="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 shadow-sm">
          查看修改器
        </button>
      `;
    }
    
    // 创建按钮HTML
    let buttonContainerHtml = '';
    
    // 改进反作弊按钮判断逻辑：同时检查D列URL和A列名称中的标记
    const hasAntiCheatUrl = (game.antiCheatUrl && 
                           game.antiCheatUrl.trim() !== '' && 
                           game.antiCheatUrl.trim().toLowerCase() !== '#n/a') ||
                           game.name.includes('(有反作弊文件)');
    
    // 如果游戏名称中包含标记但没有URL，使用修改器URL作为默认地址
    let finalAntiCheatUrl = game.antiCheatUrl;
    if (!game.antiCheatUrl && game.name.includes('(有反作弊文件)')) {
      finalAntiCheatUrl = game.downloadUrl; // 使用修改器URL作为替代
    }
      
    // 添加调试日志，追踪哪些游戏的反作弊按钮显示情况
    if (hasAntiCheatUrl) {
      console.log(`游戏: ${game.name}, 显示反作弊按钮: true, URL: ${finalAntiCheatUrl}`);
    } else if (game.antiCheatUrl) {
      console.log(`游戏: ${game.name}, 反作弊URL: ${game.antiCheatUrl}, 显示按钮: false`);
    }
    
    if (hasAntiCheatUrl) {
      // 有反作弊文件下载地址，显示反作弊按钮和修改器按钮
      buttonContainerHtml = `
        <div class="w-full space-y-3">
          ${buttonHtml}
          <a href="${finalAntiCheatUrl}" target="_blank" class="w-full py-3 bg-red-50 border border-red-500 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all duration-300 flex items-center justify-center gap-2">
            <i class="fa fa-shield"></i>
            反作弊文件/必下载！
          </a>
        </div>
      `;
    } else {
      // 没有反作弊文件下载地址，只显示修改器按钮
      buttonContainerHtml = buttonHtml;
    }
    
    card.innerHTML = `
      ${imageHtml}
      <h3 class="font-bold text-lg text-neutral-800 mb-4 w-full text-wrap break-words">${game.name}</h3>
      ${buttonContainerHtml}
    `;
    
    // 如果是普通按钮，添加点击事件
    if (!game.downloadUrl || game.downloadUrl.trim() === '') {
      card.querySelector('button').addEventListener('click', () => {
        alert(`查看游戏：${game.name} 的修改器`);
      });
    }
    
    gameGrid.appendChild(card);
  });
  
}

// 在普通脚本模式下，不需要导入和导出语句
// debounce函数将从search-functions.js全局访问