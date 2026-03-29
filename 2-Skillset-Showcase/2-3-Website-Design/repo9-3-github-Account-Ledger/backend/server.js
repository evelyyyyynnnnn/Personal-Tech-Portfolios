require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { Client } = require('@notionhq/client');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache for descriptions to avoid repeated LLM calls (persists across requests)
const descriptionCache = new Map();

// Cache for API responses based on date range: { 'start-end': { ledger: [], summary: {}, timestamp: Date } }
const apiCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration

// Category classification keywords
const CATEGORY_KEYWORDS = {
  'Income1': ['income1'],
  'Income2': ['income2'],
  'Income3': ['income3'],
  'Income4': ['income4'],
  'Income5': ['income5'],
  'Food & Dining': ['grocery', 'geocery', 'starbucks', 'coffee', 'stsrbucks', 'dinner', 'lunch', 'cafe', 'wee', 'trade joe', 'h mart', 'lamian', 'ice cream', 'snacks', 'dish', 'gum', 'mocha', 'purple drinks', 'ice coffee'],
  'Transportation': ['uber', 'bus', 'subway', 'ticket', 'air', 'ny-boston', 'travel-taxi', 'travel bus'],
  'Shopping': ['shein', 'scarf', 'socks', 'case', 'clothes', 'cloth', 'decoration', 'tv', 'mount', 'stand', 'spray', 'mop', 'glue', 'file', 'headphone', 'iphone', 'laptop', 'laplop', 'mask', 'lighting', 'plant', 'battery', 'map', 'item'],
  'Entertainment': ['tennis', 'card', 'big head', 'headshot', 'boost', 'swimming', 'pool'],
  'Health & Wellness': ['yoga', 'nail', 'tail', 'white', 'body'],
  'Utilities & Bills': ['spectrum', 'equipment', 'membership', 'cursor', 'ieee', 'mint', 'mobile', 'apple care', 'ai tools'],
  'Travel': ['travel', 'visa', 'hotel', 'airbnb', 'chicago', 'boston', 'ohio', 'back home', 'chicago to boston'],
  'Services': ['logistic', 'application', 'opt', 'editing', 'set up', 'mounting'],
  'Other': ['daily expense', 'expense']
};

// Classify description into category (keyword-based, fast)
function classifyDescription(description) {
  if (!description) return 'Uncategorized';
  
  const desc = description.toLowerCase();
  
  // First check for Income categories (more specific)
  if (desc.includes('income1')) return 'Income1';
  if (desc.includes('income2')) return 'Income2';
  if (desc.includes('income3')) return 'Income3';
  if (desc.includes('income4')) return 'Income4';
  if (desc.includes('income5')) return 'Income5';
  
  // Then check other categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    // Skip Income categories as already checked above
    if (category.startsWith('Income')) continue;
    
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Uncategorized';
}

// Smart LLM-based classification (for unique/unknown descriptions)
async function classifyWithLLM(description) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a financial transaction classifier. Categorize the description into one of: 
Income1, Income2, Income3, Income4, Income5, Food & Dining, Transportation, Shopping, Entertainment, 
Health & Wellness, Utilities & Bills, Travel, Services, or Other. 
Respond with ONLY the category name, nothing else.`
        },
        {
          role: 'user',
          content: `Categorize: "${description}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 20
    });
    
    const category = response.choices[0].message.content.trim();
    return category;
  } catch (error) {
    console.error('LLM classification error:', error);
    return 'Uncategorized';
  }
}

// Helper function to fetch ALL pages from Notion (handles pagination)
async function fetchAllPages(query) {
  const allPages = [];
  let cursor = undefined;
  
  do {
    const queryWithCursor = { ...query };
    if (cursor) {
      queryWithCursor.start_cursor = cursor;
    }
    
    const response = await notion.databases.query(queryWithCursor);
    allPages.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allPages;
}

// API Routes

// Helper function to get cache key
function getCacheKey(start, end) {
  return `${start || 'all'}-${end || 'all'}`;
}

// Helper function to check if cache is valid
function isCacheValid(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  const age = Date.now() - cacheEntry.timestamp;
  return age < CACHE_DURATION;
}

// Get all ledger entries with optional time filtering
app.get('/api/ledger', async (req, res) => {
  try {
    const { start, end, forceRefresh } = req.query;
    const cacheKey = getCacheKey(start, end);
    
    // Check cache first (unless forceRefresh is true)
    if (forceRefresh !== 'true') {
      const cached = apiCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        console.log(`✅ Cache hit for ${cacheKey}`);
        return res.json(cached.ledger);
      }
    }

    console.log(`🔄 Fetching from Notion for ${cacheKey}`);
    
    // Build query with optional date filter
    const query = {
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    };

    // Add date filter if provided
    if (start || end) {
      query.filter = {
        and: [],
      };
      
      if (start) {
        query.filter.and.push({
          property: 'Date',
          date: {
            on_or_after: start,
          },
        });
      }
      
      if (end) {
        query.filter.and.push({
          property: 'Date',
          date: {
            on_or_before: end,
          },
        });
      }
    }

    // Fetch ALL pages with pagination
    const allPages = await fetchAllPages(query);

    const entries = await Promise.all(allPages.map(async (page) => {
      const properties = page.properties;
      const description = properties.Description?.title?.[0]?.plain_text || '';
      
      // Always use LLM to classify (bypass Notion's Category field completely)
      let category;
      if (descriptionCache.has(description)) {
        // Use cached result (fast)
        category = descriptionCache.get(description);
      } else {
        // Call LLM for new/unknown descriptions only
        category = await classifyWithLLM(description);
        descriptionCache.set(description, category);
      }
      
      const payment = properties.Payment?.number || 0;
      const deposit = properties.Deposit?.number || 0;
      
      // Determine Type: 
      // Income = Deposit has value AND Payment is empty/0
      // Expense = Payment has value (even if Deposit also has value)
      const type = (deposit > 0 && payment === 0) ? 'Income' : 'Expense';
      const amount = (deposit > 0 && payment === 0) ? deposit : payment;
      
      return {
        id: page.id,
        date: properties.Date?.date?.start || '',
        description: description,
        payment: payment,
        deposit: deposit,
        amount: amount,
        type: type,
        account: properties.Account?.select?.name || '',
        category: category,
      };
    }));

    // Cache the result
    apiCache.set(cacheKey, {
      ledger: entries,
      timestamp: Date.now()
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ error: 'Failed to fetch ledger entries' });
  }
});

// Get categories summary (supports time filtering via query params)
app.get('/api/summary', async (req, res) => {
  try {
    const { start, end, forceRefresh } = req.query;
    const cacheKey = `summary-${getCacheKey(start, end)}`;
    
    // Check cache first (unless forceRefresh is true)
    if (forceRefresh !== 'true') {
      const cached = apiCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        console.log(`✅ Cache hit for ${cacheKey}`);
        return res.json(cached.summary);
      }
    }

    console.log(`🔄 Fetching summary from Notion for ${cacheKey}`);
    
    // Build query with optional date filter
    const query = {
      database_id: DATABASE_ID,
    };

    if (start || end) {
      query.filter = { and: [] };
      
      if (start) {
        query.filter.and.push({
          property: 'Date',
          date: { on_or_after: start },
        });
      }
      
      if (end) {
        query.filter.and.push({
          property: 'Date',
          date: { on_or_before: end },
        });
      }
    }

    // Fetch ALL pages with pagination
    const allPages = await fetchAllPages(query);

    const summary = {};
    
    for (const page of allPages) {
      const properties = page.properties;
      const description = properties.Description?.title?.[0]?.plain_text || '';
      
      // Always use LLM to classify (bypass Notion's Category field completely)
      let category;
      if (descriptionCache.has(description)) {
        category = descriptionCache.get(description);
      } else {
        category = await classifyWithLLM(description);
        descriptionCache.set(description, category);
      }
      
      const payment = properties.Payment?.number || 0;
      const deposit = properties.Deposit?.number || 0;
      
      // Determine Type: 
      // Income = Deposit has value AND Payment is empty/0
      // Expense = Payment has value (even if Deposit also has value)
      const isIncome = (deposit > 0 && payment === 0);
      const amount = isIncome ? deposit : payment;

      if (!summary[category]) {
        summary[category] = {
          total: 0,
          count: 0,
          income: 0,
          expense: 0,
        };
      }

      summary[category].total += amount;
      summary[category].count += 1;
      
      if (isIncome) {
        summary[category].income += deposit;
      } else if (payment > 0) {
        summary[category].expense += payment;
      }
    }

    // Cache the result
    apiCache.set(cacheKey, {
      summary: summary,
      timestamp: Date.now()
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Add new entry
app.post('/api/ledger', async (req, res) => {
  try {
    // Clear cache when new entry is added
    apiCache.clear();
    console.log('🔄 Cache cleared after adding new entry');
    
    const { date, description, payment, account, category } = req.body;

    // Auto-classify if category not provided
    const finalCategory = category || classifyDescription(description);

    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: {
        Date: {
          date: {
            start: date,
          },
        },
        Description: {
          title: [
            {
              text: {
                content: description,
              },
            },
          ],
        },
        Payment: {
          number: payment,
        },
        Account: {
          select: {
            name: account,
          },
        },
        Category: {
          select: {
            name: finalCategory,
          },
        },
      },
    });

    res.json({ success: true, id: response.id, category: finalCategory });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Get time-based analysis (daily, weekly, monthly)
app.get('/api/analysis/time', async (req, res) => {
  try {
    const allPages = await fetchAllPages({ database_id: DATABASE_ID });

    const daily = {};
    const weekly = {};
    const monthly = {};
    
    allPages.forEach(page => {
      const properties = page.properties;
      const dateStr = properties.Date?.date?.start;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      const payment = properties.Payment?.number || 0;
      
      // Daily
      const dayKey = date.toISOString().split('T')[0];
      daily[dayKey] = (daily[dayKey] || 0) + payment;
      
      // Weekly
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weekly[weekKey] = (weekly[weekKey] || 0) + payment;
      
      // Monthly
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[monthKey] = (monthly[monthKey] || 0) + payment;
    });

    res.json({ daily, weekly, monthly });
  } catch (error) {
    console.error('Error fetching time analysis:', error);
    res.status(500).json({ error: 'Failed to fetch time analysis' });
  }
});

// Get account-based analysis
app.get('/api/analysis/account', async (req, res) => {
  try {
    const allPages = await fetchAllPages({ database_id: DATABASE_ID });

    const accounts = {};
    
    allPages.forEach(page => {
      const properties = page.properties;
      const account = properties.Account?.select?.name || 'Other';
      const payment = properties.Payment?.number || 0;

      if (!accounts[account]) {
        accounts[account] = {
          total: 0,
          count: 0,
        };
      }

      accounts[account].total += payment;
      accounts[account].count += 1;
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching account analysis:', error);
    res.status(500).json({ error: 'Failed to fetch account analysis' });
  }
});

// Get merchant/description analysis
app.get('/api/analysis/merchant', async (req, res) => {
  try {
    const allPages = await fetchAllPages({ database_id: DATABASE_ID });

    const merchants = {};
    
    allPages.forEach(page => {
      const properties = page.properties;
      const description = properties.Description?.title?.[0]?.plain_text || '';
      const payment = properties.Payment?.number || 0;

      if (!merchants[description]) {
        merchants[description] = {
          total: 0,
          count: 0,
        };
      }

      merchants[description].total += payment;
      merchants[description].count += 1;
    });

    // Sort by total descending
    const sorted = Object.entries(merchants)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20); // Top 20

    res.json(sorted);
  } catch (error) {
    console.error('Error fetching merchant analysis:', error);
    res.status(500).json({ error: 'Failed to fetch merchant analysis' });
  }
});

// Get trends (daily spending trend)
app.get('/api/analysis/trends', async (req, res) => {
  try {
    const allPages = await fetchAllPages({
      database_id: DATABASE_ID,
      sorts: [{ property: 'Date', direction: 'ascending' }],
    });

    const dailyTrend = [];
    let runningTotal = 0;
    
    allPages.forEach(page => {
      const properties = page.properties;
      const dateStr = properties.Date?.date?.start;
      const payment = properties.Payment?.number || 0;
      
      if (dateStr) {
        runningTotal += payment;
        dailyTrend.push({
          date: dateStr,
          payment,
          cumulative: runningTotal,
        });
      }
    });

    res.json(dailyTrend);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get balance analysis (income vs expense)
app.get('/api/analysis/balance', async (req, res) => {
  try {
    const allPages = await fetchAllPages({ database_id: DATABASE_ID });

    let totalIncome = 0;
    let totalExpense = 0;
    
    allPages.forEach(page => {
      const properties = page.properties;
      const payment = properties.Payment?.number || 0;
      const deposit = properties.Deposit?.number || 0;
      
      // Income = Deposit has value AND Payment is empty/0
      // Expense = Payment has value (even if Deposit also has value)
      const isIncome = (deposit > 0 && payment === 0);
      
      if (isIncome) {
        totalIncome += deposit;
      } else if (payment > 0) {
        totalExpense += payment;
      }
    });

    res.json({
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error('Error fetching balance analysis:', error);
    res.status(500).json({ error: 'Failed to fetch balance analysis' });
  }
});

// Get all available categories
app.get('/api/categories', (req, res) => {
  const categories = Object.keys(CATEGORY_KEYWORDS);
  res.json(categories);
});

// Classify a description (uses keyword matching, then LLM if needed)
app.post('/api/classify', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Try keyword matching first
    let category = classifyDescription(description);
    
    // If uncategorized, try LLM
    if (category === 'Uncategorized') {
      category = await classifyWithLLM(description);
    }
    
    res.json({ description, category });
  } catch (error) {
    console.error('Error classifying:', error);
    res.status(500).json({ error: 'Failed to classify description' });
  }
});

// Analyze all descriptions and return discovered categories (LLM-powered)
app.get('/api/analyze-categories', async (req, res) => {
  try {
    const allPages = await fetchAllPages({ database_id: DATABASE_ID });

    const uniqueDescriptions = new Set();
    allPages.forEach(page => {
      const description = page.properties.Description?.title?.[0]?.plain_text || '';
      if (description) uniqueDescriptions.add(description);
    });

    const descriptions = Array.from(uniqueDescriptions);
    
    // Use LLM to analyze and categorize
    const categories = {};
    for (const desc of descriptions) {
      const category = await classifyWithLLM(desc);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(desc);
    }

    res.json({ 
      totalDescriptions: descriptions.length,
      uniqueCategories: Object.keys(categories).length,
      categories: categories 
    });
  } catch (error) {
    console.error('Error analyzing categories:', error);
    res.status(500).json({ error: 'Failed to analyze categories' });
  }
});

// Batch update categories for all uncategorized entries
app.post('/api/update-categories', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });

    const updates = [];
    let successCount = 0;
    let errorCount = 0;

    for (const page of response.results) {
      const properties = page.properties;
      const currentCategory = properties.Category?.select?.name;
      const description = properties.Description?.title?.[0]?.plain_text || '';
      
      // Only update if uncategorized
      if (currentCategory === 'Uncategorized' || !currentCategory) {
        const newCategory = classifyDescription(description);
        
        if (newCategory && newCategory !== 'Uncategorized') {
          try {
            await notion.pages.update({
              page_id: page.id,
              properties: {
                Category: {
                  select: {
                    name: newCategory,
                  },
                },
              },
            });
            successCount++;
          } catch (error) {
            console.error(`Error updating page ${page.id}:`, error);
            errorCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      updated: successCount,
      errors: errorCount,
      message: `Successfully updated ${successCount} entries. ${errorCount} errors.`
    });
  } catch (error) {
    console.error('Error updating categories:', error);
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

// AI Insights - Generate comprehensive spending insights
app.get('/api/ai-insights', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    // Build query with optional date filter
    const query = {
      database_id: DATABASE_ID,
      sorts: [{ property: 'Date', direction: 'descending' }],
    };

    if (start || end) {
      query.filter = { and: [] };
      if (start) {
        query.filter.and.push({ property: 'Date', date: { on_or_after: start } });
      }
      if (end) {
        query.filter.and.push({ property: 'Date', date: { on_or_before: end } });
      }
    }

    const allPages = await fetchAllPages(query);

    // Process ledger entries
    const entries = [];
    for (const page of allPages) {
      const properties = page.properties;
      const description = properties.Description?.title?.[0]?.plain_text || '';
      
      let category;
      if (descriptionCache.has(description)) {
        category = descriptionCache.get(description);
      } else {
        category = await classifyWithLLM(description);
        descriptionCache.set(description, category);
      }
      
      const payment = properties.Payment?.number || 0;
      const deposit = properties.Deposit?.number || 0;
      const isIncome = (deposit > 0 && payment === 0);
      const amount = isIncome ? deposit : payment;
      
      entries.push({
        date: properties.Date?.date?.start || '',
        description,
        category,
        amount,
        type: isIncome ? 'Income' : 'Expense',
        account: properties.Account?.select?.name || '',
      });
    }

    // Calculate statistics
    const totalIncome = entries.filter(e => e.type === 'Income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0);
    const avgDailyExpense = totalExpense / Math.max(1, new Set(entries.map(e => e.date?.split('T')[0])).size);
    
    // Category statistics
    const categoryStats = {};
    entries.filter(e => e.type === 'Expense').forEach(e => {
      if (!categoryStats[e.category]) {
        categoryStats[e.category] = { total: 0, count: 0, avg: 0 };
      }
      categoryStats[e.category].total += e.amount;
      categoryStats[e.category].count += 1;
    });
    Object.keys(categoryStats).forEach(cat => {
      categoryStats[cat].avg = categoryStats[cat].total / categoryStats[cat].count;
    });

    // Top spending categories
    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([cat, stats]) => ({ category: cat, ...stats }));

    // Detect anomalies (spending > 3x average in that category)
    const anomalies = entries.filter(e => {
      if (e.type !== 'Expense' || !categoryStats[e.category]) return false;
      return e.amount > categoryStats[e.category].avg * 3;
    });

    // Prepare data for LLM
    const context = {
      period: start && end ? `${start} to ${end}` : 'all time',
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      avgDailyExpense,
      categories: topCategories,
      anomalies: anomalies.length,
      totalEntries: entries.length,
    };

    // Generate AI insights using OpenAI
    const systemPrompt = `You are a financial advisor analyzing spending data. Provide:
1. A concise 2-3 sentence spending summary
2. List 3-5 actionable recommendations to improve financial health
3. Highlight 1-2 unusual spending patterns if any

Be friendly, specific, and data-driven.`;
    
    const userPrompt = `Analyze this spending data from ${context.period}:
- Total Income: $${context.totalIncome.toFixed(2)}
- Total Expenses: $${context.totalExpense.toFixed(2)}
- Balance: $${context.balance.toFixed(2)}
- Average Daily Spending: $${context.avgDailyExpense.toFixed(2)}
- Top Spending Categories: ${topCategories.map(c => `${c.category} ($${c.total.toFixed(2)})`).join(', ')}
- Anomalies detected: ${anomalies.length} transactions
- Total entries: ${context.totalEntries}

${anomalies.length > 0 ? `Notable unusual expenses:\n${anomalies.slice(0, 5).map(a => `- ${a.description}: $${a.amount.toFixed(2)} in ${a.category}`).join('\n')}` : ''}

Provide your analysis and recommendations.`;

    const llmResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiAnalysis = llmResponse.choices[0].message.content.trim();

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        avgDailyExpense,
        totalEntries: entries.length,
        period: context.period,
      },
      topCategories,
      anomalies: anomalies.slice(0, 10),
      aiInsights: aiAnalysis,
      categoryStats,
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for Vercel serverless
module.exports = app;

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

