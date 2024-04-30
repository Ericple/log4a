import{_ as p,c as l,l as i,a as s,I as e,a3 as a,o as h,D as t}from"./chunks/framework.ClEwN3w8.js";const v=JSON.parse('{"title":"追加器","description":"","frontmatter":{},"headers":[],"relativePath":"zh-tw/guide/appender.md","filePath":"zh-tw/guide/appender.md"}'),k={name:"zh-tw/guide/appender.md"},r=a('<h1 id="追加器" tabindex="-1">追加器 <a class="header-anchor" href="#追加器" aria-label="Permalink to &quot;追加器&quot;">​</a></h1><p>追加器的作用是将日志打印至指定的某处，Log4a实现了两种追加器，分别为</p><ul><li><code>ConsoleAppender</code></li><li><code>FileAppender</code></li></ul><h2 id="consoleappender" tabindex="-1"><code>ConsoleAppender</code> <a class="header-anchor" href="#consoleappender" aria-label="Permalink to &quot;`ConsoleAppender`&quot;">​</a></h2><p>将日志输出到命令行就是通过ConsoleAppender实现的，获取Logger时，Log4a会自动分配一个ConsoleAppender至Logger,因此，正常情况下，你无需配置ConsoleAppender，除非你不希望日志在控制台上出现。</p><h2 id="禁用控制台输出" tabindex="-1">禁用控制台输出 <a class="header-anchor" href="#禁用控制台输出" aria-label="Permalink to &quot;禁用控制台输出&quot;">​</a></h2><p>要禁用控制台输出，请这么做：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 移除logger绑定的ConsoleAppender</span></span>\n<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">removeTypedAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(AppenderTypeEnum.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">CONSOLE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h2 id="再次启用控制台输出" tabindex="-1">再次启用控制台输出 <a class="header-anchor" href="#再次启用控制台输出" aria-label="Permalink to &quot;再次启用控制台输出&quot;">​</a></h2><p>如果在某些情况下，你移除了ConsoleAppender，但后续又需要在控制台中打印日志，可以这么做：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 向logger添加一个ConsoleAppender</span></span>\n<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addConsoleAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><div class="warning custom-block github-alert"><p class="custom-block-title">WARNING</p><p>每个logger至多绑定一个ConsoleAppender，如果logger已绑定ConsoleAppender，则调用addConsoleAppender不会发生任何事。</p></div><h2 id="fileappender" tabindex="-1"><code>FileAppender</code> <a class="header-anchor" href="#fileappender" aria-label="Permalink to &quot;`FileAppender`&quot;">​</a></h2><p>FileAppender提供输出日志到文件的能力，需要开发者手动绑定至Logger。创建FileAppender时开发者可以设置日志缓存最大数量、日志文件占用上限、是否使用多线程、加密函数。</p><div class="info custom-block github-alert"><p class="custom-block-title">INFO</p><p>对于同一个文件，FileAppender在全局下是唯一的，多个Logger可以配置相同的FileAppender，这意味着一个FileAppender可以被绑定至多个Logger实例。这是log4a内部的实现，实际开发时，开发者无需操心这一点。</p></div><p>添加一个FileAppender需要提供两个必选参数：</p><ul><li>文件路径</li><li>FileAppender名称</li></ul><div class="tip custom-block github-alert"><p class="custom-block-title">TIP</p><p>名称用于作为索引来删除某已绑定到Logger的FileAppender</p></div><h2 id="添加一个fileappender" tabindex="-1">添加一个FileAppender <a class="header-anchor" href="#添加一个fileappender" aria-label="Permalink to &quot;添加一个FileAppender&quot;">​</a></h2><p>要添加一个FileAppender，可以这么做：</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addFileAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).filesDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;/fileName.log&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;mainLog&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>这段代码向logger添加了一个具名FileAppender，名称为<code>mainLog</code>，指定了文件路径为应用文件沙箱路径下的<code>fileName.log</code>。</p>',22),d={id:"添加一个多线程fileappender",tabindex:"-1"},E=i("a",{class:"header-anchor",href:"#添加一个多线程fileappender","aria-label":'Permalink to "添加一个多线程FileAppender <Badge type="tip" text="1.3.0-rc.1 +" />"'},"​",-1),g=a(`<p>要添加具有多线程能力的FileAppender，可以通过以下方式:</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addFileAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).filesDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;/fileName.log&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;mainLog&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Level.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ALL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        useWorker: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><div class="tip custom-block github-alert"><p class="custom-block-title">TIP</p><p>为了尽可能不影响应用本身的并发需要，不论开发者设置多少个多线程FileAppender，Log4a都将只占用一个线程。</p></div>`,3),o={id:"配置文件缓存",tabindex:"-1"},c=i("a",{class:"header-anchor",href:"#配置文件缓存","aria-label":'Permalink to "配置文件缓存 <Badge type="tip" text="1.3.0-rc.1 +" />"'},"​",-1),y=a(`<p>如果需要配置日志文件最大缓存个数及最大占用，需要在options中传入相关参数</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addFileAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).filesDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;/fileName.log&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;mainLog&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Level.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ALL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        maxFileSize: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        maxCacheCount: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><ul><li><code>maxFileSize</code> 指定了最大日志文件占用，单位为KB。当日志文件大小超过限制时，将会生成一个缓存文件，并新建一个日志文件以继续写入日志。</li><li><code>maxCacheCount</code> 指定了最大日志文件缓存数量，如果日志缓存数量超过该值，则会删除最早生成的日志缓存。</li></ul><h2 id="配置日志加密" tabindex="-1">配置日志加密 <a class="header-anchor" href="#配置日志加密" aria-label="Permalink to &quot;配置日志加密&quot;">​</a></h2><p>FileAppender允许开发者传入一个加密函数来进行日志加密，该函数接受两个参数，且需要返回加密后的内容：</p><ul><li>日志等级</li><li>日志内容</li></ul><p>这样的设计允许开发者只对某些或某个日志等级的日志进行加密，实现局部加密或整体加密，也使得开发者可以更加自由地编写加密算法。</p><p>配置加密：</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> encryptFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">origin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ArrayBuffer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ArrayBuffer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 对origin利用自定义的加密算法</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> origin;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.logger.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addFileAppender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).filesDir </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;/fileName.log&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;mainLog&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Level.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">ALL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line highlighted"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        encryptor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">level</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Level</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">log</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ArrayBuffer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line highlighted"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(level.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;privateLevel&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line highlighted"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> encryptFunction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(log);</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line highlighted"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> log; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 如果不需要加密，必须返回原始log</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div>`,9);function F(b,u,C,m,A,_){const n=t("Badge");return h(),l("div",null,[r,i("h2",d,[s("添加一个多线程FileAppender "),e(n,{type:"tip",text:"1.3.0-rc.1 +"}),s(),E]),g,i("h2",o,[s("配置文件缓存 "),e(n,{type:"tip",text:"1.3.0-rc.1 +"}),s(),c]),y])}const f=p(k,[["render",F]]);export{v as __pageData,f as default};
