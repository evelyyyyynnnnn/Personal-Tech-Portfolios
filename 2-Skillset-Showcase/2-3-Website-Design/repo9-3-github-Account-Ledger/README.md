# Accounting Ledger | 记账系统

A modern web application for managing your accounting ledger with Notion integration, AI-powered automatic categorization, and advanced analytics.

现代记账系统，集成Notion数据库，AI智能分类，高级数据分析和可视化。

---

## Features | 功能特性

### Core Features | 核心功能

- **AI智能分类** - AI-powered automatic categorization based on Description field
  - Uses OpenAI GPT-4o-mini for intelligent category assignment
  - Persistent caching for performance optimization
  - Zero "Uncategorized" transactions

- **Notion实时同步** - Real-time Notion synchronization
  - Automatic data fetching with pagination support
  - Handles large datasets (>100 entries)
  - No manual updates required

- **时间筛选** - Time-based filtering
  - Customizable date range selector
  - Auto-detects earliest and latest dates
  - Filters all views dynamically

- **收支分类** - Income/Expense classification
  - **Deposit** = Income (Deposit有值且Payment为空)
  - **Payment** = Expense (Payment有值)
  - Smart type detection

- **数据分析仪表盘** - Advanced analytics dashboard
  - Daily/Monthly spending trends
  - Category and account breakdowns
  - Visual charts and statistics

---

## Prerequisites | 环境要求

- Node.js v14+
- Notion account
- OpenAI API account
- Modern web browser

---

## Setup Instructions | 安装配置

### Step 1: Get Notion API Key | 获取Notion API密钥

1. **Visit**: https://www.notion.so/my-integrations

2. **Click**: "Create new integration" / "创建新集成"

3. **Configure**:
   - Name: `Accounting Ledger`
   - Type: Internal integration
   - Capabilities: Read content

4. **Copy**: `Internal Integration Token` (starts with `secret_` or `你的Notion密钥`)

#### 中文步骤：
1. 访问：https://www.notion.so/my-integrations
2. 点击"创建新集成"
3. 填写名称：`Accounting Ledger`
4. 类型选择：内部集成
5. 复制：**Internal Integration Token**（类似`secret_`或`你的Notion密钥`开头）

---

### Step 2: Get Notion Database ID | 获取数据库ID

1. **Open** your Notion database (table view)

2. **Copy the URL** from browser address bar:
   ```
   https://www.notion.so/workspace/244005e49609808db6cbcffa77c3a494?v=...
   ```

3. **Extract Database ID**: The 32-character string after the last `/` and before any `?` or `#`
   - Example: `244005e49609808db6cbcffa77c3a494`
   - Format: 8-4-4-4-12 characters (with hyphens removed)

4. **Share database** with your integration:
   - Click "Share" button
   - Type your integration name
   - Grant access

#### 中文步骤：
1. 打开Notion中的数据库（表格视图）
2. 复制浏览器地址栏URL
3. 提取32位字符的数据库ID（在最后一个`/`之后，`?`之前）
4. 点击"分享"按钮，搜索并授权你的集成

---

### Step 3: Get OpenAI API Key | 获取OpenAI密钥

1. **Visit**: https://platform.openai.com/api-keys

2. **Login** with your OpenAI account

3. **Click**: "Create new secret key"

4. **Copy** the API key (starts with `sk-`)
   - **Important**: Save it immediately, you won't see it again!

5. **Add credits** to your account if needed (pay-per-use)

#### 中文步骤：
1. 访问：https://platform.openai.com/api-keys
2. 登录OpenAI账号
3. 点击"创建新密钥"
4. 立即复制密钥（以`sk-`开头）
5. 若需要，为账户充值

---

### Step 4: Configure Environment | 配置环境变量

1. **Navigate** to backend directory:
   ```bash
   cd backend
   ```

2. **Create** `.env` file:
   ```bash
   touch .env
   ```

3. **Edit** `.env` with your credentials:
   ```env
   NOTION_API_KEY=你的Notion密钥（以secret_或你的Notion密钥开头）
   NOTION_DATABASE_ID=你的数据库ID（32位字符）
   PORT=3001
   OPENAI_API_KEY=你的OpenAI密钥（以sk-开头）
   ```

   **⚠️ 重要**: 使用你自己的实际密钥，不要使用示例值！

#### 中文配置：
创建`backend/.env`文件并填入：
```env
NOTION_API_KEY=你的Notion密钥
NOTION_DATABASE_ID=你的数据库ID
PORT=3001
OPENAI_API_KEY=你的OpenAI密钥
```

---

### Step 5: Install Dependencies | 安装依赖

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 6: Run Application | 运行应用

From the project root directory:

```bash
# Start backend server
cd backend && node server.js &

# Start frontend (in new terminal)
cd frontend && npm start
```

Or use the convenience script:
```bash
npm run dev  # if configured
```

**Access**: http://localhost:3000

---

## Database Schema | 数据库结构

Your Notion database must have these properties:

| Property     | Type       | Required | Description                    |
|--------------|------------|----------|--------------------------------|
| Date         | Date       | ✅ Yes   | Transaction date               |
| Description  | Title      | ✅ Yes   | Transaction description        |
| Payment      | Number     | ✅ Yes   | Expense amount                 |
| Deposit      | Number     | ✅ Yes   | Income amount                  |
| Account      | Select     | ✅ Yes   | Bank/card account              |
| Category     | Select     | ❌ No    | Auto-assigned by AI (optional) |

**Important Rules**:
- Expense: Payment > 0, Deposit = 0
- Income: Payment = 0, Deposit > 0
- If both have values, it's treated as Expense

---

## Dashboard Sections | 仪表盘部分

### Table View | 表格视图

**Summary Cards**:
- Total Spending
- Number of Categories
- Total Entries
- Top Category

**Main Table**: 
- Columns: Type | Category | Amount
- Sorting: Type (Expense→Income) then Amount (High→Low)
- Aggregated by Category (not individual transactions)

**Time Filter**:
- From/To date pickers
- Auto-detects min/max dates
- Applies to all data views

### Breakdown View | 图表分析

**Balance Analysis**:
- Income Categories (Pie Chart)
- Expense Categories (Pie Chart)
- Category Breakdown Lists

**Account Management**:
- Income Account Distribution (Pie Chart)
- Expense Account Distribution (Pie Chart)

All charts update based on selected time range.

### Analytics Dashboard | 分析仪表盘

**Overview Cards**:
- Total Income
- Total Expense
- Balance (Income - Expense)

**Charts**:
- Daily Spending & Income (Line Chart)
- Monthly Spending & Income (Line Chart)

X-axis: Selected time range
Y-axis: Amount ($USD)

---

## API Endpoints | API接口

### Basic Operations | 基础操作

| Method | Endpoint                | Description                     |
|--------|-------------------------|---------------------------------|
| GET    | `/api/ledger`           | Fetch all entries               |
| GET    | `/api/summary`          | Category summary                |
| POST   | `/api/ledger`           | Create new entry                |
| GET    | `/api/analysis/balance` | Income vs Expense totals        |

### Filtered Queries | 筛选查询

| Method | Endpoint                            | Description                     |
|--------|-------------------------------------|---------------------------------|
| GET    | `/api/ledger?start=YYYY-MM-DD&end=YYYY-MM-DD` | Filter by date range |
| GET    | `/api/summary?start=YYYY-MM-DD&end=YYYY-MM-DD` | Summary for date range |

### Analytics | 高级分析

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| GET    | `/api/analysis/time`        | Time-based trends           |
| GET    | `/api/analysis/account`     | Account breakdown           |
| GET    | `/api/analysis/merchant`    | Top merchants               |
| GET    | `/api/analysis/trends`      | Cumulative spending trend   |

### AI Classification | AI分类

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| POST   | `/api/classify`            | Classify single description         |
| GET    | `/api/categories`          | List all categories                 |
| GET    | `/api/analyze-categories`  | Re-analyze all descriptions         |

---

## Core Logic | 核心逻辑

### Income vs Expense | 收支判断

```javascript
// Income = Deposit has value AND Payment is 0
if (deposit > 0 && payment === 0) {
  type = 'Income';
  amount = deposit;
}

// Expense = Payment has value (even if Deposit also has value)
else if (payment > 0) {
  type = 'Expense';
  amount = payment;
}
```

### AI Categorization | AI分类

1. **Cache Check**: Check if description was classified before
2. **LLM Call**: If new, call OpenAI GPT-4o-mini
3. **Category Mapping**: 
   - Income: Income1, Income2, Income3, Income4, Income5
   - Expense: Food & Dining, Transportation, Shopping, Entertainment, Health & Wellness, Utilities & Bills, Travel, Services, Other
4. **Cache Storage**: Save result for future use

### Pagination | 分页处理

Notion API returns max 100 entries per request. The system automatically handles pagination to fetch all data:

```javascript
async function fetchAllPages(query) {
  const allPages = [];
  let cursor = undefined;
  
  do {
    const response = await notion.databases.query(query);
    allPages.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allPages;
}
```

---

## Project Structure | 项目结构

```
Accounting Ledger/
├── backend/                    # Express + Notion + OpenAI
│   ├── server.js              # Main server with all API endpoints
│   ├── package.json           # Dependencies
│   ├── .env                   # API keys and config
│   └── node_modules/
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── components/
│   │   │   ├── LedgerTable.js
│   │   │   ├── ChartView.js
│   │   │   ├── AnalyticsDashboard.js
│   │   │   ├── SummaryCards.js
│   │   │   └── AddEntryForm.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── node_modules/
├── README.md                   # This file
└── package.json               # Root package.json
```

---

## Troubleshooting | 故障排除

### "Failed to fetch ledger entries"

**Cause**: API connection issue

**Solutions**:
1. ✅ Check `.env` has correct `NOTION_API_KEY` and `NOTION_DATABASE_ID`
2. ✅ Verify database is shared with your Notion integration
3. ✅ Ensure backend server is running on port 3001
4. ✅ Check network/firewall settings

### "Property not found"

**Cause**: Database schema mismatch

**Solutions**:
1. ✅ Verify property names are exact (case-sensitive):
   - `Date` (not `date` or `DATE`)
   - `Description` (not `Desc`)
   - `Payment`, `Deposit`, `Account`
2. ✅ Check property types match schema table
3. ✅ Re-share database with integration

### Income shows as $0

**Cause**: Classification logic issue

**Solutions**:
1. ✅ Verify Deposit values exist in Notion
2. ✅ Check that Payment is 0 for income entries
3. ✅ Restart backend server to clear cache

### Port already in use

**Cause**: Port 3000 or 3001 occupied

**Solutions**:
```bash
# Check what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
PORT=3002
```

### OpenAI API errors

**Cause**: API key or quota issues

**Solutions**:
1. ✅ Verify API key is correct in `.env`
2. ✅ Check OpenAI account has credits
3. ✅ Monitor API usage at platform.openai.com
4. ✅ Ensure key has proper permissions

---

## API Credentials Summary | API凭证总结

### Notion API

**Key**: `NOTION_API_KEY`  
**Get**: https://www.notion.so/my-integrations  
**Format**: `secret_...` or `你的Notion密钥...`  
**Permissions**: Read database content

**Database ID**: `NOTION_DATABASE_ID`  
**Extract from**: Database URL (32-character string)  
**Format**: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

### OpenAI API

**Key**: `OPENAI_API_KEY`  
**Get**: https://platform.openai.com/api-keys  
**Format**: `sk-...`  
**Model**: `gpt-4o-mini`  
**Cost**: Pay-per-use (approximately $0.15 per 1M input tokens)

---

## Technology Stack | 技术栈

**Backend**:
- Node.js + Express
- Notion API (@notionhq/client)
- OpenAI API (GPT-4o-mini)
- CORS enabled

**Frontend**:
- React 18
- Recharts (data visualization)
- Axios (HTTP client)
- date-fns (date formatting)
- CSS3 (green minimalist theme)

---

## License

ISC

---

## Support | 支持

For issues or questions:
1. Check Troubleshooting section
2. Verify API credentials
3. Check browser console for errors
4. Review backend logs

---

## Credits

Built with Notion API, OpenAI GPT-4o-mini, React, and Recharts.

Powered by green design principles ♻️
