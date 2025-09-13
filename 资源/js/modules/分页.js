// 分页功能相关函数模块

// 渲染分页
function renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage) {
  pageNumbers.innerHTML = '';
  
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  currentPageNum.textContent = currentPage;
  totalPagesNum.textContent = totalPages;
  
  // 更新按钮状态
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  
  // 生成页码按钮
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 调整开始页码，确保显示足够的页码
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // 添加第一页和省略号
  if (startPage > 1) {
    addPageButton(pageNumbers, 1, currentPage);
    if (startPage > 2) {
      addEllipsis(pageNumbers);
    }
  }
  
  // 添加可见页码
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(pageNumbers, i, currentPage);
  }
  
  // 添加省略号和最后一页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      addEllipsis(pageNumbers);
    }
    addPageButton(pageNumbers, totalPages, currentPage);
  }
}

// 添加页码按钮
function addPageButton(pageNumbers, pageNum, currentPage) {
  const button = document.createElement('button');
  button.className = `px-3 py-2 rounded-lg transition-all duration-300 ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary'}`;
  button.textContent = pageNum;
  
  // 注意：这里不直接添加事件监听器，而是在主文件中处理
  button.dataset.page = pageNum;
  
  pageNumbers.appendChild(button);
}

// 添加省略号
function addEllipsis(pageNumbers) {
  const ellipsis = document.createElement('span');
  ellipsis.className = 'px-2 text-neutral-400';
  ellipsis.textContent = '...';
  pageNumbers.appendChild(ellipsis);
}

// 上一页
function goToPrevPage(currentPage, setCurrentPage, renderGameGrid, renderPagination, ...renderPaginationArgs) {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
    renderGameGrid();
    renderPagination(...renderPaginationArgs);
  }
}

// 下一页
function goToNextPage(currentPage, setCurrentPage, renderGameGrid, renderPagination, filteredGames, gamesPerPage, ...renderPaginationArgs) {
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
    renderGameGrid();
    renderPagination(...renderPaginationArgs);
  }
}

// 初始化分页
function initPagination(paginationContainer, pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, currentPage, setCurrentPage, renderGameGrid, renderPagination, filteredGames, gamesPerPage) {
  // 上一页按钮事件
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      renderGameGrid();
      renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage - 1);
    }
  });
  
  // 下一页按钮事件
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      renderGameGrid();
      renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage + 1);
    }
  });
  
  // 页码按钮事件委托
  pageNumbers.addEventListener('click', (e) => {
    const pageButton = e.target.closest('button[data-page]');
    if (pageButton) {
      const pageNum = parseInt(pageButton.dataset.page);
      if (pageNum !== currentPage) {
        setCurrentPage(pageNum);
        renderGameGrid();
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, pageNum);
      }
    }
  });
}

// 在普通脚本模式下，不需要导出语句
// 所有函数将自动成为全局作用域的一部分