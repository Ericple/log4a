import{_ as s,c as a,o as i,a3 as n}from"./chunks/framework.ClEwN3w8.js";const E=JSON.parse('{"title":"快速开始","description":"","frontmatter":{},"headers":[],"relativePath":"zh-tw/guide/getting-started.md","filePath":"zh-tw/guide/getting-started.md"}'),e={name:"zh-tw/guide/getting-started.md"},l=n(`<h1 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h1><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><h2 id="前置准备" tabindex="-1">前置准备 <a class="header-anchor" href="#前置准备" aria-label="Permalink to &quot;前置准备&quot;">​</a></h2><ul><li><a href="https://nodejs.org/" target="_blank" rel="noreferrer">Node.js</a> 18及以上版本</li><li><a href="https://gitee.com/openharmony/docs/blob/master/zh-cn/release-notes/OpenHarmony-v4.1-release.md#%E9%85%8D%E5%A5%97%E5%85%B3%E7%B3%BB" target="_blank" rel="noreferrer">Huawei DevEco Studio</a> 4.1 Release及以上版本</li><li>OpenHarmony/ HarmonyOS SDK</li></ul><p>推荐使用ohpm，从OpenHarmony三方库中心仓直接安装log4a的最新发行版本</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-0ajT3" id="tab-_q7pYWY" checked="checked"><label for="tab-_q7pYWY">ohpm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ohpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @pie/log4a</span></span></code></pre></div></div></div><h2 id="打印第一行日志" tabindex="-1">打印第一行日志 <a class="header-anchor" href="#打印第一行日志" aria-label="Permalink to &quot;打印第一行日志&quot;">​</a></h2><p>Log4a的易用体现在很多方面，最突出的一个特点就是自动格式化日志，要利用这个特点，你只需要这么做：</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { LogManager, Logger } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@pie/log4a&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@Entry</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@Component</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">struct MainPage {</span></span>
<span class="line highlighted"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    logger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Logger </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LogManager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLogger</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    world</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: string </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;world&#39;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    aboutToAppear</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line highlighted"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">info</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello {}!&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.world);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ... Your code here</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p><strong>输出</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>[INFO ]	2024-04-30 15:27:29.809	[MainPage:1]	Hello world!</span></span></code></pre></div><div class="tip custom-block github-alert"><p class="custom-block-title">TIP</p><p>我们把输出的信息简化成以下内容，并对各个内容分别进行解释：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>[a] b [c:d] e</span></span></code></pre></div><ul><li>a 日志等级</li><li>b 日志打印时间</li><li>c 日志来源（所属上下文）</li><li>d 该日志为日志所属上下文的第d条日志</li><li>e 日志内容</li></ul></div>`,12),t=[l];function p(h,r,k,d,o,c){return i(),a("div",null,t)}const b=s(e,[["render",p]]);export{E as __pageData,b as default};
