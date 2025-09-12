# 月灵修改器工坊网站

这是一个提供游戏修改器工具的网站，包含风灵月影修改器合集和WeMod平台。

## 网站特点

- 风灵月影修改器合集：收录热门游戏的修改器工具
- WeMod平台：收录万款游戏的修改工具
- 使用指南与常见问题解答
- 响应式设计，适配各种设备

## 项目结构

```
├── assets/          # 资源文件夹
│   ├── css/         # 样式文件
│   ├── images/      # 图片资源
│   ├── js/          # JavaScript脚本
│   └── videos/      # 视频资源（已迁移到B站）
├── components/      # 组件文件
├── faq.html         # 常见问题解答页面
├── fenling_modifiers.html  # 风灵月影修改器合集页面
├── index.html       # 网站首页
├── wemod_platform.html     # WeMod平台页面
└── 修改器合集.xlsx   # 修改器数据Excel文件
```

## 部署指南

### Netlify部署

1. 将项目推送到GitHub/GitLab/Bitbucket等代码托管平台
2. 在Netlify上创建一个新站点，连接到您的代码仓库
3. Netlify将自动检测并使用项目根目录下的`netlify.toml`配置文件
4. 部署完成后，您将获得一个可访问的网站URL

### 本地开发

1. 克隆仓库到本地
2. 使用任何静态文件服务器打开项目文件夹
   - 例如：使用VS Code的Live Server扩展
   - 或使用Python的`python -m http.server`命令
3. 在浏览器中访问相应的本地地址

## 注意事项

- 请确保所有HTML文件中的图片和资源路径正确
- 如果修改器数据有更新，需要更新`修改器合集.xlsx`文件
- 网站使用了Tailwind CSS和Font Awesome等外部资源

## 免责声明

本网站提供的修改器工具仅供个人娱乐使用，请勿用于商业目的。使用修改器可能会影响游戏平衡性，并存在一定的封号风险，尤其是在线游戏。请谨慎使用。