// 状态管理相关函数模块

// 显示内容 - 传统分页模式
function showContent(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.add('hidden');
  emptyState.classList.add('hidden');
  contentContainer.classList.remove('hidden');
  
  // 显示分页
  if (pagination) {
    pagination.classList.remove('hidden');
  }
}

// 显示空状态 - 传统分页模式
function showEmptyState(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.add('hidden');
  contentContainer.classList.add('hidden');
  
  // 隐藏分页
  if (pagination) {
    pagination.classList.add('hidden');
  }
  
  emptyState.classList.remove('hidden');
}

// 显示加载状态 - 传统分页模式
function showLoading(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.remove('hidden');
  emptyState.classList.add('hidden');
  contentContainer.classList.add('hidden');
  
  // 隐藏分页
  if (pagination) {
    pagination.classList.add('hidden');
  }
}

// 在普通脚本模式下，不需要导出语句
// 所有函数将自动成为全局作用域的一部分