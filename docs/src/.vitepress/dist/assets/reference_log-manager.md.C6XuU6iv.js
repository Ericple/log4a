import{_ as e,c as a,o,a3 as t}from"./chunks/framework.ClEwN3w8.js";const _=JSON.parse('{"title":"LogManager","description":"","frontmatter":{},"headers":[],"relativePath":"reference/log-manager.md","filePath":"reference/log-manager.md"}'),r={name:"reference/log-manager.md"},n=t('<h1 id="logmanager" tabindex="-1">LogManager <a class="header-anchor" href="#logmanager" aria-label="Permalink to &quot;LogManager&quot;">​</a></h1><div class="info custom-block github-alert"><p class="custom-block-title">INFO</p><p>管理全局Logger</p></div><h2 id="方法" tabindex="-1">方法 <a class="header-anchor" href="#方法" aria-label="Permalink to &quot;方法&quot;">​</a></h2><p><code>LogManager</code>具有以下方法</p><h2 id="getlogger-context" tabindex="-1"><code>getLogger(context)</code> <a class="header-anchor" href="#getlogger-context" aria-label="Permalink to &quot;`getLogger(context)`&quot;">​</a></h2><ul><li><code>context</code> Object 必须传入<code>this</code></li></ul><p>根据上下文获取对应Logger，参数需传入this</p><h2 id="anonymous" tabindex="-1"><code>anonymous()</code> <a class="header-anchor" href="#anonymous" aria-label="Permalink to &quot;`anonymous()`&quot;">​</a></h2><p>获取匿名Logger</p><h2 id="terminate" tabindex="-1"><code>terminate()</code> <a class="header-anchor" href="#terminate" aria-label="Permalink to &quot;`terminate()`&quot;">​</a></h2><p>回收所有Logger。调用该方法的同时，Log4a会清除所有Appender，如果Appender存在多线程，则线程会被终止。开发者应在应用退出时调用此方法。</p>',11),c=[n];function l(i,d,g,s,h,m){return o(),a("div",null,c)}const u=e(r,[["render",l]]);export{_ as __pageData,u as default};
