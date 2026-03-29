题目一
以下是gemini-3-pro-preview-11-2025天气卡
请你创建一个网页，把下面的内容插入网页当中，构成一个可以看到其插件内容的网页设计：

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Living Weather Card</title>
    <style>
        :root {
            --bg-primary: #0a0a0a;
            --card-w: 420px;
            --card-h: 600px;
            --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            
            /* 动态主题色 - JS会更新这些 */
            --theme-hue: 210;
            --theme-sat: 50%;
            --theme-light: 50%;
            --accent: hsl(var(--theme-hue), var(--theme-sat), 70%);
            --text-primary: #fff;
            --text-secondary: rgba(255,255,255,0.7);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--bg-primary);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: var(--font-main);
            overflow: hidden;
            color: var(--text-primary);
            transition: background-color 3s ease;
        }

        /* 启动覆盖层 */
        #start-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: opacity 1s ease;
        }
        #start-overlay h2 { font-weight: 300; letter-spacing: 2px; margin-bottom: 20px; }
        #start-overlay p { color: var(--text-secondary); font-size: 0.9em; }

        /* 主卡片容器 */
        .card-container {
            width: var(--card-w);
            height: var(--card-h);
            position: relative;
            perspective: 1500px;
        }

        #weather-card {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 
                0 30px 60px -15px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,255,255,0.05) inset;
            transform-style: preserve-3d;
            transition: transform 0.2s ease-out, box-shadow 0.5s ease;
            background: #111; /* Fallback */
        }

        /* 背景画布层 - 位于最底 */
        #bg-canvas, #scene-canvas, #ui-canvas {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
        }
        #bg-canvas { z-index: 1; transition: filter 1s ease; } /* 天空渐变, 极光等 */
        #scene-canvas { z-index: 2; mix-blend-mode: plus-lighter; } /* 粒子: 雨雪, 阳光 */
        #fx-canvas { /* 特殊效果层: 闪电, 雾气 */
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            z-index: 3;
            pointer-events: none;
            opacity: 0.7;
            mix-blend-mode: overlay;
        }

        /* 内容 UI 层 */
        .card-content {
            position: relative;
            z-index: 10;
            height: 100%;
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.4) 100%);
            pointer-events: none; /* 让鼠标事件穿透到 Canvas */
        }
        
        /* 顶部信息栏 */
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .location-group h3 { font-size: 1.8rem; font-weight: 600; letter-spacing: 0.5px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .location-group p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px; display: flex; align-items: center; gap: 6px; }
        
        .live-indicator {
            width: 8px; height: 8px; background: #0f0; border-radius: 50%;
            box-shadow: 0 0 10px #0f0;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.5; transform: scale(0.8); } }

        /* 核心温度区 */
        .temp-hero {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding-left: 10px;
        }
        .main-temp {
            font-size: 6rem;
            font-weight: 200;
            line-height: 1;
            position: relative;
            text-shadow: 0 10px 30px rgba(0,0,0,0.3);
            letter-spacing: -2px;
        }
        .main-temp span { font-size: 0.5em; vertical-align: super; opacity: 0.8; }
        .weather-desc {
            font-size: 1.5rem;
            font-weight: 400;
            opacity: 0.9;
            padding-left: 5px;
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }

        /* 底部控制区 (允许点击) */
        .controls-area {
            pointer-events: all;
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: background 0.3s ease, border 0.3s ease;
        }
        .controls-area:hover {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        }

        /* 天气切换器 */
        .weather-switcher {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        .switch-btn {
            width: 50px; height: 50px;
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.05);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .switch-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.1); color: #fff; }
        .switch-btn.active {
            background: var(--text-primary);
            color: var(--bg-primary);
            box-shadow: 0 0 20px var(--accent);
            transform: scale(1.15);
        }
        .switch-btn svg { width: 24px; height: 24px; fill: currentColor; }

        /* 音乐播放器精简版 */
        .music-player {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .now-playing {
            display: flex;
            flex-direction: column;
            font-size: 0.8rem;
        }
        .track-label { opacity: 0.5; font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase; }
        .track-name { font-weight: 500; margin-top: 2px; }
        
        .audio-controls { display: flex; align-items: center; gap: 15px; }
        #volume-slider {
            width: 80px; height: 4px; border-radius: 2px;
            -webkit-appearance: none; background: rgba(255,255,255,0.2); outline: none;
        }
        #volume-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #fff; border-radius: 50%; cursor: pointer; }
        
        #play-btn {
            width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3);
            background: transparent; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease;
        }
        #play-btn:hover { border-color: #fff; background: rgba(255,255,255,0.1); }
        #play-btn svg { width: 14px; height: 14px; fill: currentColor; }

        /* 音频可视化 */
        #spectrum-canvas {
            position: absolute;
            bottom: 120px;
            left: 0;
            width: 100%;
            height: 60px;
            z-index: 5;
            opacity: 0.3;
            pointer-events: none;
            mix-blend-mode: overlay;
        }

    </style>
</head>
<body>

    <!-- 首次交互覆盖层 -->
    <div id="start-overlay">
        <h2>LIVING WEATHER</h2>
        <p>戴上耳机 · 点击任意处开始体验</p>
    </div>

    <div class="card-container" id="container">
        <div id="weather-card">
            <!-- Canvas Layers -->
            <canvas id="bg-canvas"></canvas>
            <canvas id="scene-canvas"></canvas>
            <canvas id="fx-canvas"></canvas>
            <canvas id="spectrum-canvas"></canvas>

            <!-- HTML Content Layer -->
            <div class="card-content">
                <div class="top-bar">
                    <div class="location-group">
                        <h3 id="loc-text">自然界</h3>
                        <p><div class="live-indicator"></div> 实时演算生成中</p>
                    </div>
                    <div id="time-text" style="font-variant-numeric: tabular-nums; opacity: 0.8;">12:34</div>
                </div>

                <div class="temp-hero">
                    <div class="main-temp"><span id="temp-val">26</span><span>°</span></div>
                    <div class="weather-desc" id="weather-desc">和煦阳光</div>
                </div>

                <div class="controls-area">
                    <!-- 天气切换按钮组 -->
                    <div class="weather-switcher">
                        <button class="switch-btn active" data-weather="sunny" title="晴天">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                        </button>
                        <button class="switch-btn" data-weather="rainy" title="雨天">
                            <svg viewBox="0 0 24 24"><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"></path></svg>
                        </button>
                        <button class="switch-btn" data-weather="snowy" title="雪天">
                            <svg viewBox="0 0 24 24"><path d="M12 3v18M6.8 5.2l10.4 13.6M5.2 17.2l13.6-10.4M21 12H3M19.5 12l-2.5 2.5M19.5 12l-2.5-2.5M4.5 12l2.5 2.5M4.5 12l2.5-2.5M12 21l2.5-2.5M12 21l-2.5-2.5M12 3L9.5 5.5M12 3l2.5 2.5"></path></svg>
                        </button>
                        <button class="switch-btn" data-weather="windy" title="大风">
                            <svg viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"></path></svg>
                        </button>
                    </div>

                    <!-- 音乐控制 -->
                    <div class="music-player">
                        <div class="now-playing">
                            <span class="track-label">Now Generating</span>
                            <span class="track-name" id="track-name">Pastorale (Sun)</span>
                        </div>
                        <div class="audio-controls">
                             <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="0.7">
                             <button id="play-btn">
                                <svg id="play-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"></path></svg>
                                <!-- 暂停/静音图标会在 JS 中切换 -->
                             </button>
                        </div>
                    </div>
                </div> <!-- end controls-area -->
            </div> <!-- end card-content -->
        </div>
    </div>

    <script>
/**
 * =========================================
 * 核心工具库 & 全局状态
 * =========================================
 */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const lerp = (start, end, t) => start * (1 - t) + end * t;
const rnd = (min, max) => Math.random() * (max - min) + min;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const STATE = {
    weather: 'sunny',
    isPlaying: false,
    volume: 0.7,
    hasInteracted: false,
    targetTemp: 26,
    currTemp: 26,
    mouse: { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }, // 归一化鼠标坐标
    time: 0 // 全局时间
};

/**
 * =========================================
 * 音频引擎 (Web Audio API)
 * 完全生成式，不使用外部文件
 * =========================================
 */
class AudioEngine {
    constructor() {
        this.ctx = window.AudioContext || window.webkitAudioContext;
        this.ac = null; // 延迟初始化
        this.masterGain = null;
        this.analyser = null;
        
        // 场景音频节点容器
        this.scenes = { sunny: null, rainy: null, snowy: null, windy: null };
        this.activeSceneStr = null;
        this.loops = []; // 存储活跃的调度循环
    }

    init() {
        if (this.ac) return;
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ac.createGain();
        this.masterGain.gain.setValueAtTime(STATE.volume, this.ac.currentTime);
        this.analyser = this.ac.createAnalyser();
        this.analyser.fftSize = 512; // 用于可视化
        this.analyser.smoothingTimeConstant = 0.85;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ac.destination);

        // 初始化各场景 (但不连接到 master，省资源)
        // 仅当切换到该场景时才连接并开始生成
    }

    resume() { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); }
    
    setVolume(val) {
        if (!this.masterGain) return;
        // 指数型音量过渡更自然
        this.masterGain.gain.setTargetAtTime(val, this.ac.currentTime, 0.1);
    }

    // --- 核心生成器 ---

    // 白/粉/褐噪声生成器
    createNoise(type = 'white') {
        const bufferSize = 2 * this.ac.sampleRate;
        const buffer = this.ac.createBuffer(1, bufferSize, this.ac.sampleRate);
        const output = buffer.getChannelData(0);
        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        } else if (type === 'pink') { // 简化的粉噪近似
            let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
            for(let i=0; i<bufferSize; i++) {
                const w = Math.random()*2-1;
                b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
                b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
                b6 = w * 0.115926; output[i] *= 0.11;
            }
        }
        const noise = this.ac.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        return noise;
    }

    // 播放单个音符 (带简单 ADSR)
    playTone(freq, time, duration, type = 'sine', vol = 0.2, dest) {
        const osc = this.ac.createOscillator();
        const env = this.ac.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(vol, time + duration * 0.2); // Attack
        env.gain.exponentialRampToValueAtTime(0.001, time + duration); // Release

        osc.connect(env);
        env.connect(dest || this.masterGain);
        osc.start(time);
        osc.stop(time + duration + 0.5);
    }

    // --- 场景切换器 ---
    async switchScene(weather) {
        if (!this.ac) return;
        this.resume();
        
        const fadeTime = 3;
        const now = this.ac.currentTime;

        // 淡出当前场景
        if (this.activeSceneStr && this.scenes[this.activeSceneStr]) {
             const oldScene = this.scenes[this.activeSceneStr];
             oldScene.gain.gain.setTargetAtTime(0, now, fadeTime / 5);
             setTimeout(() => { if(oldScene.stop) oldScene.stop(); }, fadeTime * 1000);
        }

        this.clearLoops();
        this.activeSceneStr = weather;

        // 创建新场景
        if (weather === 'sunny') this.scenes.sunny = this.createSunnyScene();
        else if (weather === 'rainy') this.scenes.rainy = this.createRainyScene();
        else if (weather === 'snowy') this.scenes.snowy = this.createSnowyScene();
        else if (weather === 'windy') this.scenes.windy = this.createWindyScene();

        // 淡入新场景
        const newScene = this.scenes[weather];
        newScene.gain.gain.setValueAtTime(0, now);
        newScene.gain.connect(this.masterGain);
        newScene.gain.gain.setTargetAtTime(1, now + 0.1, fadeTime / 3);
        
        if (newScene.start) newScene.start();

        // 更新 UI 音乐名称
        const trackNames = {
            sunny: 'Sunlight Etude (C Maj)',
            rainy: 'Gray Noise Nocturne (A Min)',
            snowy: 'Aurora Drone (D min)',
            windy: 'Gale Rhapsody (Dorian)'
        };
        $('track-name').textContent = trackNames[weather] || 'Unknown';
    }

    clearLoops() { this.loops.forEach(clearInterval); this.loops = []; }

    // ============ 各天气场景生成逻辑 ============

    // ☀️ 晴天：温暖的大调和弦，鸟鸣，轻柔底噪
    createSunnyScene() {
        const sceneGain = this.ac.createGain();
        
        // 1. 底噪 (模拟温暖空气/远处活动)
        const noise = this.createNoise('pink');
        const noiseFilter = this.ac.createBiquadFilter();
        noiseFilter.type = 'lowpass'; noiseFilter.frequency.value = 400;
        const noiseGain = this.ac.createGain(); noiseGain.gain.value = 0.03;
        noise.connect(noiseFilter).connect(noiseGain).connect(sceneGain);
        noise.start();

        // 2. 音乐循环 (C大调五声: C4(261), D4(293), E4(329), G4(392), A4(440))
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        // 添加延迟效果器模拟混响
        const delay = this.ac.createDelay(); delay.delayTime.value = 0.4;
        const delayGain = this.ac.createGain(); delayGain.gain.value = 0.3;
        delay.connect(delayGain).connect(delay).connect(sceneGain);
        
        const playNote = () => {
            const now = this.ac.currentTime;
            const note = notes[Math.floor(Math.random() * notes.length)];
            const dur = rnd(2, 6); // 长音符
            // 偶尔双音叠加
            this.playTone(note, now, dur, 'sine', rnd(0.05, 0.15), sceneGain);
            if(Math.random()>0.7) this.playTone(notes[0]/2, now, dur+2, 'sine', 0.05, sceneGain); // 低音根音
            
            // 发送部分信号到延迟
            // (这里简化处理，上面直接 playTone 到了 sceneGain，实际应该分轨)
        };
        this.loops.push(setInterval(playNote, 4000)); // 每4秒尝试演奏

        // 3. 随机鸟鸣 (高频快速调制的正弦波)
        const chirp = () => {
            if(Math.random() > 0.3) return; // 不是每次都叫
            const now = this.ac.currentTime;
            const osc = this.ac.createOscillator();
            const mod = this.ac.createOscillator(); // 调制器
            const gain = this.ac.createGain();
            
            mod.frequency.value = rnd(30, 70);
            const modGain = this.ac.createGain();
            modGain.gain.value = rnd(300, 900);
            mod.connect(modGain).connect(osc.frequency);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(rnd(2000, 4000), now);
            osc.frequency.exponentialRampToValueAtTime(rnd(1000, 2500), now + 0.3);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(rnd(0.05, 0.1), now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + rnd(0.2, 0.5));

            osc.connect(gain).connect(sceneGain);
            mod.start(now); osc.start(now);
            mod.stop(now+0.6); osc.stop(now+0.6);
        };
        this.loops.push(setInterval(chirp, 5500));

        return { gain: sceneGain, stop: () => { noise.stop(); } };
    }

    // 🌧️ 雨天：粉红噪声(雨)+低频噪声(雷)+小调钢琴
    createRainyScene() {
        const sceneGain = this.ac.createGain();

        // 1. 雨声 (主要的持续底噪)
        const rain = this.createNoise('white');
        const rainFilter = this.ac.createBiquadFilter();
        rainFilter.type = 'lowpass'; rainFilter.frequency.value = 3000; // 闷闷的雨声
        const rainGain = this.ac.createGain(); 
        rainGain.gain.value = 0.4; 
        
        // 用 LFO 轻微调制雨声音量，模拟雨势波动
        const lfo = this.ac.createOscillator(); lfo.frequency.value = 0.2; 
        const lfoGain = this.ac.createGain(); lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain).connect(rainGain.gain); lfo.start();

        rain.connect(rainFilter).connect(rainGain).connect(sceneGain);
        rain.start();

        // 2. 音乐 (A小调稀疏钢琴: A3, C4, E4, G4, B4) - 声音偏冷(triangle/saw混合)
        const notes = [220.00, 261.63, 329.63, 392.00, 493.88];
        const playMelancholy = () => {
            const now = this.ac.currentTime;
            const note = notes[Math.floor(Math.random() * notes.length)];
            // 用三角波模拟更丰富的类似电钢琴音色
            this.playTone(note, now, rnd(1.5, 3), 'triangle', rnd(0.05, 0.1), sceneGain);
        }
        this.loops.push(setInterval(playMelancholy, 5000)); // 慢速

        // 3. 随机雷声
        this.loops.push(setInterval(() => {
            if(Math.random() > 0.2) return;
            this.triggerThunder(sceneGain);
        }, 8000));

        return { gain: sceneGain, stop: () => { rain.stop(); lfo.stop(); } };
    }
    
    // 触发一次雷声
    triggerThunder(dest) {
        const now = this.ac.currentTime;
        // 两个噪声源：一个是爆发的高频(近处)，一个是隆隆低频(远处)
        const boom = this.createNoise('pink');
        const boomFilter = this.ac.createBiquadFilter();
        boomFilter.type = 'lowpass'; boomFilter.frequency.setValueAtTime(800, now);
        boomFilter.frequency.exponentialRampToValueAtTime(100, now + 1.5); // 声音迅速变闷

        const boomGain = this.ac.createGain();
        boomGain.gain.setValueAtTime(0, now);
        boomGain.gain.linearRampToValueAtTime(rnd(0.6, 1), now + 0.1); // 瞬间爆发
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + rnd(2, 4)); // 缓慢消逝

        boom.connect(boomFilter).connect(boomGain).connect(dest || this.masterGain);
        boom.start(now); boom.stop(now + 5);
        
        // 视觉联动：闪电
        flashLightning(); 
    }

    // ❄️ 雪天：带通滤波风声，极为空灵的长音
    createSnowyScene() {
        const sceneGain = this.ac.createGain();
        
        // 1. 寒风 (带通滤波扫描的粉红噪声)
        const wind = this.createNoise('pink');
        const windFilter = this.ac.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.Q.value = 4; // 窄频带制造"哨声"感
        
        const lfo = this.ac.createOscillator();
        lfo.frequency.value = 0.08; // 极慢的扫描
        const lfoGain = this.ac.createGain(); lfoGain.gain.value = 400; // 扫描范围
        lfo.connect(lfoGain).connect(windFilter.frequency);
        windFilter.frequency.setValueAtTime(600, this.ac.currentTime); // 中心频率
        lfo.start();

        const windGain = this.ac.createGain(); windGain.gain.value = 0.15;
        wind.connect(windFilter).connect(windGain).connect(sceneGain);
        wind.start();

        // 2. 空灵 Drone (正弦波长音和弦: D minor add9 -> D, F, A, E)
        const chord = [146.83, 174.61, 220.00, 329.63]; // D3, F3, A3, E4
        chord.forEach((freq, i) => {
            const osc = this.ac.createOscillator();
            osc.type = 'sine'; osc.frequency.value = freq;
            const gain = this.ac.createGain();
            gain.gain.value = 0.04 / (i + 1); // 高音音量更小
            
            // 让每个音符的音量独立缓慢呼吸
            const breathe = this.ac.createOscillator();
            breathe.frequency.value = rnd(0.05, 0.2);
            const breatheGain = this.ac.createGain();
            breatheGain.gain.value = 0.02;
            breathe.connect(breatheGain).connect(gain.gain);
            breathe.start();

            osc.connect(gain).connect(sceneGain);
            osc.start();
            // 这里不 push 到 loops 因为是持续的，但在 stop 时需要断开
            sceneGain.cleanup = () => { osc.stop(); breathe.stop(); };
        });

        // 偶尔的高频冰晶声 (非常高频的正弦短音)
        this.loops.push(setInterval(() => {
            if(Math.random() > 0.4) return;
            this.playTone(rnd(3000, 6000), this.ac.currentTime, rnd(0.1, 0.3), 'sine', 0.05, sceneGain);
        }, 2500));

        return { gain: sceneGain, stop: () => { wind.stop(); lfo.stop(); if(sceneGain.cleanup) sceneGain.cleanup(); } };
    }

    // 💨 风天：强烈的调制噪声，快速无序的音符
    createWindyScene() {
        const sceneGain = this.ac.createGain();
        // 强风：类似雪天的风，但更猛烈、低沉、混乱
        const wind1 = this.createNoise('pink');
        const wind2 = this.createNoise('brown'); // 加入褐噪增加低频轰鸣
        
        const filter1 = this.ac.createBiquadFilter();
        filter1.type = 'lowpass'; filter1.frequency.value = 600;
        const filter2 = this.ac.createBiquadFilter();
        filter2.type = 'bandpass'; filter2.Q.value = 1;

        // 用随机随时变化的 LFO 模拟阵风
        const gustLFO = this.ac.createOscillator(); gustLFO.frequency.value = 0.1; // 基础慢速
        const gustGain = this.ac.createGain(); gustGain.gain.value = 500;
        gustLFO.connect(gustGain).connect(filter2.frequency);
        filter2.frequency.setValueAtTime(800, this.ac.currentTime);
        gustLFO.start();
        
        wind1.connect(filter2).connect(sceneGain);
        wind2.connect(filter1).connect(sceneGain);
        wind1.start(); wind2.start();

        sceneGain.gain.setValueAtTime(0.3, this.ac.currentTime); // 基础风量较大

        // 音乐：风铃 (非周期性的高频金属撞击声)
        const playChime = () => {
            const now = this.ac.currentTime;
            // 产生一串快速的随机音符
            const count = Math.floor(rnd(3, 8));
            for(let i=0; i<count; i++) {
                const freq = rnd(2000, 5000); // 极高频
                // 高通滤波后的方波更像金属
                this.playTone(freq, now + i*rnd(0.05,0.1), rnd(0.3, 1), 'sine', rnd(0.02, 0.06), sceneGain);
            }
        }
        this.loops.push(setInterval(() => {
            // 阵风来时风铃更容易响 (简单模拟：随机概率高)
            if(Math.random() > 0.6) playChime();
        }, 3000));

        return { gain: sceneGain, stop: () => { wind1.stop(); wind2.stop(); gustLFO.stop(); } };
    }
}
const Audio = new AudioEngine();

/**
 * =========================================
 * 视觉引擎 (Canvas + WebGL-like trickery 2D)
 * =========================================
 */

// 简易 2D 噪声用于云和自然纹理
const noise2D = (() => {
    // 极简的伪随机数哈希，不追求 Perlin 的完美但足够用
    const k = new Uint8Array(512);
    for (let i=0; i<512; i++) k[i] = (Math.sin(i*0.1)*127+128)|0; 
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => (1 - t) * a + t * b;
    return (x, y) => { // 返回 [-1, 1]
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = fade(x), v = fade(y);
        const a = k[X]+Y, aa = k[a], ab = k[a+1], b = k[X+1]+Y, ba = k[b], bb = k[b+1];
        const res = lerp(lerp(grad(k[aa], x, y), grad(k[ba], x-1, y), u), lerp(grad(k[ab], x, y-1), grad(k[bb], x-1, y-1), u), v);
        return res;
    };
    function grad(hash, x, y) { const h = hash & 15, u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : 0; return (h & 1) === 0 ? u + v : u - v; }
})();

class VisualEngine {
    constructor() {
        this.canvases = {
            bg: $('bg-canvas'),
            scene: $('scene-canvas'),
            fx: $('fx-canvas'),
            spec: $('spectrum-canvas')
        };
        this.ctxs = {};
        for(let key in this.canvases) this.ctxs[key] = this.canvases[key].getContext('2d');

        this.particles = [];
        this.clouds = []; // 用于绘制云的"粒子"
        this.w = 0; this.h = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 闪电状态
        this.lightning = 0; 
    }

    resize() {
        const rect = $('weather-card').getBoundingClientRect();
        this.w = rect.width; this.h = rect.height;
        // 设置 canvas 物理像素大小 (Retina屏优化)
        const dpr = window.devicePixelRatio || 1;
        for(let key in this.canvases) {
             this.canvases[key].width = this.w * dpr;
             this.canvases[key].height = this.h * dpr;
             this.ctxs[key].scale(dpr, dpr); // 逻辑坐标系保持不变
        }
    }

    start() {
        this.initClouds();
        this.loop();
    }

    // 初始化云朵 (用大号圆形粒子模拟，避免复杂的 volume rendering)
    initClouds() {
        for(let i=0; i<20; i++) {
            this.clouds.push({
                x: rnd(0, this.w), y: rnd(-50, this.h/2),
                r: rnd(50, 150), // 半径
                den: rnd(0.02, 0.1) // 密度/不透明度
            });
        }
    }

    switchWeather(newW, oldW) {
        this.particles = []; // 清空旧粒子
        // 根据天气预生成一些粒子
        if (newW === 'rainy') {
            for(let i=0; i<100; i++) this.particles.push(this.createRainDrop());
        } else if (newW === 'snowy') {
            for(let i=0; i<80; i++) this.particles.push(this.createSnowFlake());
        } else if (newW === 'windy') {
             for(let i=0; i<30; i++) this.particles.push(this.createDebris());
        } else if (newW === 'sunny') {
             for(let i=0; i<20; i++) this.particles.push(this.createDust());
        }
        
        // 更新 CSS 变量用于 UI 主题
        const themes = {
            sunny: {h:35, s:'85%', l:'60%', t: 28, desc: '灿烂暖阳'},
            rainy: {h:220, s:'30%', l:'40%', t: 19, desc: '滂沱大雨'},
            snowy: {h:190, s:'50%', l:'70%', t: -3, desc: '静谧飘雪'},
            windy: {h:170, s:'15%', l:'50%', t: 15, desc: '狂风过境'}
        };
        const t = themes[newW];
        document.documentElement.style.setProperty('--theme-hue', t.h);
        document.documentElement.style.setProperty('--theme-sat', t.s);
        
        // 平滑过渡温度数值
        STATE.targetTemp = t.t;
        $('weather-desc').textContent = t.desc;
    }

    // --- 粒子工厂 ---
    createRainDrop() { return { x: rnd(0, this.w), y: rnd(0, this.h), l: rnd(10, 30), v: rnd(15, 25), a: rnd(0.2, 0.6) }; }
    createSnowFlake() { return { x: rnd(0, this.w), y: rnd(0, this.h), r: rnd(1, 3), v: rnd(0.5, 1.5), sw: rnd(0, Math.PI*2) }; }
    createDebris() { return { x: rnd(0, this.w), y: rnd(this.h-200, this.h), r: rnd(2,5), vx: rnd(3,8), vy: rnd(-1,1), rot: rnd(0,6) }; }
    createDust() { return { x: rnd(0,this.w), y:rnd(0,this.h), r: rnd(0.5, 2), vx: rnd(-0.5,0.5), vy: rnd(-0.5,0.5), a: rnd(0.3, 0.7) }; }

    loop() {
        requestAnimationFrame(() => this.loop());
        STATE.time += 0.016;
        this.update();
        this.draw();
        if(STATE.weather !== 'sunny') this.lightning *= 0.9; // 闪电衰减
    }

    update() {
        // 缓慢逼近目标温度
        STATE.currTemp = lerp(STATE.currTemp, STATE.targetTemp, 0.05);
        $('temp-val').textContent = Math.round(STATE.currTemp);

        // 更新粒子
        const w = STATE.weather;
        const time = STATE.time;
        this.particles.forEach(p => {
            if (w === 'rainy') {
                p.y += p.v;
                // 风力影响: 鼠标 x 位置稍微影响雨倾斜
                p.x += (STATE.mouse.x - 0.5) * 2; 
                if(p.y > this.h) { p.y = -p.l; p.x = rnd(0, this.w); }
            } else if (w === 'snowy') {
                p.y += p.v;
                p.x += Math.sin(time + p.sw) * 0.5 + (STATE.mouse.x-0.5); // 飘荡
                if(p.y > this.h) { p.y = -5; p.x = rnd(0, this.w); }
            } else if (w === 'windy') {
                p.x += p.vx + (Math.sin(time*2)*2); // 阵风
                p.y += p.vy; p.rot += 0.1;
                if(p.x > this.w) p.x = -10;
            } else if (w === 'sunny') {
                p.x += p.vx; p.y += p.vy;
                if(p.x < 0 || p.x > this.w) p.vx *= -1;
                if(p.y < 0 || p.y > this.h) p.vy *= -1;
            }
        });
    }

    draw() {
        const { bg: cbg, scene: cs, fx: cfx, spec: csp } = this.ctxs;
        cbg.clearRect(0,0,this.w,this.h); cs.clearRect(0,0,this.w,this.h); cfx.clearRect(0,0,this.w,this.h); csp.clearRect(0,0,this.w,this.h);

        this.drawBackground(cbg);
        this.drawScene(cs);
        this.drawFX(cfx);
        if(Audio.analyser) this.drawSpectrum(csp);
    }

    drawBackground(ctx) {
        const w = STATE.weather;
        const t = STATE.time;

        // 1. 基础天空渐变
        let grad = ctx.createLinearGradient(0,0,0,this.h);
        if (w === 'sunny') {
            // 随鼠标移动太阳位置 (视差)
            const sunX = this.w * (1 - STATE.mouse.x * 0.3);
            const sunY = this.h * 0.2 * (1 + STATE.mouse.y * 0.5);
            
            grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, this.w*0.8);
            grad.addColorStop(0, '#ffd700'); // 太阳核心
            grad.addColorStop(0.2, '#ffaa00');
            grad.addColorStop(1, '#4da6ff');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,this.w,this.h);
            
            // God rays (简单模拟: 旋转的大透明三角形)
            ctx.save();
            ctx.translate(sunX, sunY);
            ctx.rotate(t * 0.05);
            ctx.fillStyle = 'rgba(255,255,200, 0.05)';
            for(let i=0; i<8; i++) {
                ctx.rotate(Math.PI/4);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(this.w, -100); ctx.lineTo(this.w, 100); ctx.fill();
            }
            ctx.restore();

        } else if (w === 'rainy') {
            grad.addColorStop(0, '#1a1a2e');
            grad.addColorStop(1, '#16213e');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,this.w,this.h);

            // 绘制厚重的乌云 (使用 noise2D)
            ctx.fillStyle = 'rgba(10,10,20, 0.3)';
            for(let x=0; x<this.w; x+=20) { // 低分辨率渲染以提高性能
                for(let y=0; y<this.h/2; y+=20) {
                    const n = noise2D(x*0.005 + t*0.1, y*0.01);
                    if(n > 0.3) ctx.fillRect(x,y,20,20);
                }
            }

        } else if (w === 'snowy') {
            grad.addColorStop(0, '#a8c0ff');
            grad.addColorStop(1, '#3f2b96'); // 冷紫色调
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,this.w,this.h);
            
            // 极光 (多层正弦波叠加)
            /* 省略复杂极光，用简单渐变色块代替以节省篇幅，实际可用复杂正弦波 */

        } else if (w === 'windy') {
            grad.addColorStop(0, '#616161');
            grad.addColorStop(1, '#9bc5c3');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,this.w,this.h);
        }

        // 闪电闪光
        if (this.lightning > 0.01) {
            ctx.fillStyle = `rgba(255,255,255,${this.lightning})`;
            ctx.fillRect(0,0,this.w,this.h);
        }
    }

    drawScene(ctx) {
        const w = STATE.weather;
        ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        
        this.particles.forEach(p => {
            if (w === 'rainy') {
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = p.a;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (STATE.mouse.x-0.5)*5, p.y + p.l); ctx.stroke();
            } else if (w === 'snowy') {
                // 雪花需要一点模糊感
                // ctx.filter = 'blur(1px)'; // 性能消耗大，谨慎使用
                ctx.globalAlpha = rnd(0.5, 0.9);
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
            } else if (w === 'windy') {
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.fillStyle = 'rgba(30,30,30,0.5)'; // 深色碎片
                ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
                ctx.restore();
            } else if (w === 'sunny') {
                 ctx.globalAlpha = p.a;
                 ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
            }
        });
        ctx.globalAlpha = 1; ctx.filter = 'none';
    }

    drawFX(ctx) {
        // 在这里可以绘制覆盖在最上层的效果，如镜头光晕、水滴在玻璃上的效果
    }

    drawSpectrum(ctx) {
        const bufferLength = Audio.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        Audio.analyser.getByteFrequencyData(dataArray);

        const barW = this.w / bufferLength * 2.5;
        let x = 0;
        for(let i = 0; i < bufferLength; i++) {
            const barH = dataArray[i] / 2; // 缩放一下
            // 颜色根据天气变化
            const hue = STATE.weather === 'sunny' ? 45 : 200; 
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
            ctx.fillRect(x, this.h - barH - 100, barW, barH); // 绘制到底部上方一点
            x += barW + 1;
        }
    }
}
const Visual = new VisualEngine();

// 全局辅助：触发闪电
window.flashLightning = () => { Visual.lightning = 0.8; };


/**
 * =========================================
 * 交互控制
 * =========================================
 */

// 3D 卡片倾斜效果
$('container').addEventListener('mousemove', e => {
    const rect = $('container').getBoundingClientRect();
    // 计算鼠标相对于卡片中心的归一化坐标 (-1 到 1)
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    
    // 更新全局鼠标状态供 canvas 使用 (0 到 1)
    STATE.mouse.x = (x + 1) / 2;
    STATE.mouse.y = (y + 1) / 2;

    // 应用 CSS 3D 变换 (限制角度在 +/- 10deg)
    $('weather-card').style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
});

// 鼠标离开恢复
$('container').addEventListener('mouseleave', () => {
    $('weather-card').style.transform = `rotateY(0deg) rotateX(0deg)`;
    STATE.mouse.x = 0.5; STATE.mouse.y = 0.5;
});

// 首次交互解锁音频
$('start-overlay').addEventListener('click', async () => {
    Audio.init();
    await Audio.ac.resume();
    
    $('start-overlay').style.opacity = 0;
    setTimeout(() => $('start-overlay').remove(), 1000);
    
    // 开始默认场景
    Visual.start();
    togglePlay(true); // 自动开始播放
    Audio.switchScene('sunny');
    Visual.switchWeather('sunny');
});

// 天气切换
$$('.switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const w = btn.dataset.weather;
        if(w === STATE.weather) return;

        $$('.switch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const oldW = STATE.weather;
        STATE.weather = w;
        Audio.switchScene(w);
        Visual.switchWeather(w, oldW);
    });
});

// 播放控制
$('play-btn').addEventListener('click', () => togglePlay());

function togglePlay(forceState) {
    STATE.isPlaying = forceState !== undefined ? forceState : !STATE.isPlaying;
    
    // 切换图标
    const icon = $('play-icon');
    if(STATE.isPlaying) {
        Audio.resume();
        Audio.setVolume(STATE.volume); // 恢复音量
        // 暂停图标
        icon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    } else {
        Audio.setVolume(0); // 静音代替停止，保持引擎运行
        // 播放图标
        icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
}

$('volume-slider').addEventListener('input', e => {
    STATE.volume = parseFloat(e.target.value);
    if(STATE.isPlaying) Audio.setVolume(STATE.volume);
});

// 点击卡片场景触发特殊音效 (彩蛋)
$('weather-card').addEventListener('click', (e) => {
    // 避免点到控制区
    if (e.target.closest('.controls-area')) return;

    if(Audio.ac && STATE.isPlaying) {
        if(STATE.weather === 'rainy') Audio.triggerThunder();
        // 可以添加更多点击互动...
    }
});

// 简单的时间更新
setInterval(() => {
    const d = new Date();
    $('time-text').textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}, 1000);

    </script>
</body>
</html>

题目二



