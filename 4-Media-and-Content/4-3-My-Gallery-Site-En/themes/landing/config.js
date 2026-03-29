const CONFIG = {

  HEADER_BUTTON_1_TITLE: 'Github开源',
  HEDEAR_BUTTON_1_URL: 'https://github.com/Viiiikedy?tab=repositories',

  HEADER_BUTTON_2_TITLE: '作者博客',
  HEDEAR_BUTTON_2_URL: 'https://vicky-post-site.vercel.app/',

  // 首页大图英雄板块
  HERO_TITLE_1: 'Vicky Dou',
  HERO_P_1: '一个喜欢折腾的商科生',
  HERO_BUTTON_1_TEXT: '精彩视频',
  HERO_BUTTON_1_LINK: 'https://vicky-youtube-video.netlify.app',
  HERO_BUTTON_2_TEXT: '更多语言',
  HERO_BUTTON_2_LINK: 'https://post-site-english.vercel.app/',
  HERO_VIDEO_IMAGE: '/images/home.png',
  HERO_VIDEO_URL: 'https://www.bilibili.com/video/BV16G41197wz/?spm_id_from=333.999.0.0&vd_source=36da479fc94e0bc10a19bac973eebb18',
  //HERO_VIDEO_IFRAME: 'https://www.bilibili.com/video/BV16G41197wz/?spm_id_from=333.999.0.0&vd_source=36da479fc94e0bc10a19bac973eebb18',
  HERO_VIDEO_TIPS: 'Watch the full video (2 min)',

  // 我的介绍
  FEATURES_HEADER_1: '学习的过程',
  FEATURES_HEADER_1_P: "如何搭建自己的知识体系，甚至成为IP？<br/>现代社会，<strong class='font-bold text-red-500'>碎片化</strong>为主流、更是主打<strong class='font-bold  text-red-500'>肤浅吸睛</strong>的流量、是<strong class='font-bold text-red-500'>功利主义</strong>且<strong class='font-bold text-red-500'>娱乐至上</strong>的潮流;<br/>而现在，是时候专注自己的知识库了",
  FEATURES_HEADER_2: 'Notebook+Portfolio配套组合',
  FEATURES_HEADER_2_P: 'Notebook作为知识库沉淀和记录生活中随处可见的知识，Portfolio作为渲染脚本，借助SEO技术在搜索引擎提升个人价值输出。',
  FEATURES_CARD_1_TITLE: '简单快速的系统',
  FEATURES_CARD_1_P: '在生活中看到就在本地写下，gitpush之后即可呈现给互联网',
  FEATURES_CARD_2_TITLE: '高效传播的媒介',
  FEATURES_CARD_2_P: '优秀的SEO、站内链接清晰跳转路径、快速的响应速度，让您的思想系统化地触达到更多的受众',
  FEATURES_CARD_3_TITLE: '人性化的定制工具',
  FEATURES_CARD_3_P: '依托Hexo，Heo，Jekyll和Vue等多家老牌网站的多款主题模板，可以搭建各种不同风格和作用的网站，同时提高个人审美。',

  // 我的介绍2
  FEATURES_BLOCK_HEADER: '我能做什么',
  FEATURES_BLOCK_P: '人人自媒体时代，但是想来容易做来总是不知道如何推进，困难重重。<br/>您可以向我发出邀约？',
  FEATURES_BLOCK_1_TITLE: '同是计算小白出身',
  FEATURES_BLOCK_1_P: '比起一开始天赋异禀的大佬、一个同样踩坑从零到一的人更有帮助',
  FEATURES_BLOCK_2_TITLE: '网站部署云端开发',
  FEATURES_BLOCK_2_P: '本地博客搭建、git云端、第三方服务器挂载都可以代为操作',
  FEATURES_BLOCK_3_TITLE: '品牌网站设计',
  FEATURES_BLOCK_3_P: '不好看可不行，交互设计出身的我可以最大化审美价值',
  FEATURES_BLOCK_4_TITLE: '打造您的个人品牌',
  FEATURES_BLOCK_4_P: '到底想表达什么故事，常年文笔撰写经验熟悉宣传套路',
  FEATURES_BLOCK_5_TITLE: '面试模拟笔试经验',
  FEATURES_BLOCK_5_P: '金融量化计算机刷题，那些不需要绕的远路我来帮',
  FEATURES_BLOCK_6_TITLE: '开始做自己吧',
  FEATURES_BLOCK_6_P: 'Vickydou，助您从零到一搭建自己的知识库',

  // 感言
  TESTIMONIALS_HEADER: '个人已搭建10个子网站，日常效率提升20%，减少不必要时间浪费80小时',
  TESTIMONIALS_P: '网站内容涵盖金融学习、计算机学习、语言学习、艺术作品设计、学术作品、中英博客、中英油管风格视频、户外旅行照片等生活',

  TESTIMONIALS_AVATAR: 'https://s2.loli.net/2023/09/13/u5W1QP7i9f6wjNe.png',
  TESTIMONIALS_NICKNAME: 'Vicky_D',
  TESTIMONIALS_ID: 'Vicky`Dou 站长',
  TESTIMONIALS_SOCIAL_NAME: '@日语学习',
  TESTIMONIALS_SOCIAL_URL: 'https://japanese-book.netlify.app',
  TESTIMONIALS_WORD: '“ 因为喜欢韩综的设计精良和韩国电影的超级现实主义开始学习韩语，之后逐渐发现自己对于语言学习无比的热爱，一起加入起来吧！ “',

  POST_REDIRECT_ENABLE: process.env.NEXT_PUBLIC_POST_REDIRECT_ENABLE || false, // 是否开启文章地址重定向 ； 用于迁移旧网站域名
  POST_REDIRECT_URL: process.env.NEXT_PUBLIC_POST_REDIRECT_URL || 'https://blog.tangly1024.com', // 重定向网站地址

  NEWSLETTER: process.env.NEXT_PUBLIC_THEME_LANDING_NEWSLETTER || false // 是否开启邮件订阅 请先配置mailchimp功能 https://docs.tangly1024.com/article/notion-next-mailchimp
}
export default CONFIG
