# 部署指南 - Deploy to Vercel

## 📋 部署步骤

### 1. 准备代码

确保你已经完成以下步骤：

```bash
# 安装所有依赖
npm run install-all

# 测试本地运行
npm run dev
```

### 2. 创建 GitHub 仓库并推送代码

```bash
# 初始化 Git (如果还没有)
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 在 GitHub 创建新仓库，然后添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送代码
git push -u origin main
```

⚠️ **重要**: 确保 `.gitignore` 已包含 `.env` 文件，不要提交敏感信息！

### 3. 在 Vercel 部署

#### 方法一：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: 保持为空（根目录）
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`

#### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在项目根目录部署
vercel

# 生产环境部署
vercel --prod
```

### 4. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

**Settings → Environment Variables** 添加：

```
NOTION_API_KEY=你的Notion密钥
NOTION_DATABASE_ID=你的数据库ID
OPENAI_API_KEY=你的OpenAI密钥
PORT=3000
NODE_ENV=production
```

⚠️ **重要**: 
- 确保所有环境变量都已添加
- 需要重新部署才能生效
- 可以在 Vercel Dashboard → Settings → Environment Variables 管理

### 5. 重新部署

添加环境变量后，在 Vercel Dashboard 点击 "Redeploy" 重新部署项目。

---

## 🔧 项目配置说明

### Vercel 配置 (`vercel.json`)

- API 路由 (`/api/*`) → 指向 `backend/server.js`
- 前端路由 → 指向 `frontend/build`

### 前端配置

- 开发环境：使用 proxy 指向 `http://localhost:3001`
- 生产环境：自动使用当前域名 (`window.location.origin`)

### 后端配置

- 开发环境：监听指定端口
- 生产环境：导出为 Vercel serverless 函数

---

## ✅ 验证部署

部署成功后，访问你的 Vercel URL，检查：

1. ✅ 首页能正常加载
2. ✅ API 健康检查：`https://你的域名.vercel.app/api/health` 返回 `{"status":"ok"}`
3. ✅ 数据能正常加载（检查浏览器控制台）

---

## 🐛 常见问题

### API 返回 404

**原因**: 路由配置问题

**解决**: 
- 检查 `vercel.json` 配置
- 确保 API 路由以 `/api/` 开头
- 重新部署

### 环境变量未生效

**原因**: 需要重新部署

**解决**: 
- 在 Vercel Dashboard 确认环境变量已添加
- 点击 "Redeploy" 重新部署

### 前端无法连接后端

**原因**: API 路径错误

**解决**: 
- 检查前端代码中的 API 调用路径
- 生产环境应该使用相对路径 `/api/...`
- 检查浏览器控制台的网络请求

### 构建失败

**原因**: 依赖或配置问题

**解决**:
```bash
# 本地测试构建
cd frontend
npm run build

# 检查错误信息
```

---

## 📝 注意事项

1. **敏感信息**: 永远不要提交 `.env` 文件到 GitHub
2. **API 限制**: Vercel 免费版有执行时间限制，适合中小型应用
3. **域名**: Vercel 会自动分配域名，也可以绑定自定义域名
4. **环境**: 可以在 Vercel 中为不同环境（Development, Preview, Production）设置不同的环境变量

---

## 🔄 更新代码

每次推送代码到 GitHub，Vercel 会自动：
1. 检测到新的提交
2. 自动构建和部署
3. 生成预览 URL（Pull Request）

---

## 📚 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions)
- [React on Vercel](https://vercel.com/docs/concepts/deployments/overview)



