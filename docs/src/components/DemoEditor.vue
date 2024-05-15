<template>
    <button @click="handleRun" class="runButton" style="margin-bottom: 12px;">在浏览器中运行(请自行打开控制台)</button>
    <div ref="code" :style="{ width: '100%', height: height }"></div>
</template>

<style>
.runButton {
    width: 100%;
    background-color: var(--vp-c-bg);
    margin-top: 12px;
    padding: 8px;
    border: 1px solid;
    transition: all 0.3s;
}

.runButton:hover {
    background-color: rgb(154, 154, 154);
    border: 1px solid var(--vp-c-bg);
}
</style>

<script>
import { defineComponent, ref } from 'vue';
import { runLog4aCode } from '@peercat/log4a';
import { useData } from 'vitepress';
import * as monaco from 'monaco-editor';
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

let keywords = [
    'const',
    'struct',
    'abstract',
    'this',
    'module',
    'export',
    'interface',
    'let',
    'type',
    'function',
    'return',
    'class',
    'public',
    'private',
    'constructor',
    'implements',
    'new',
    'static',
    'for', 'of', 'in', 'continue', 'typeof', 'if', 'else', 'while', 'LogManager', 'extends'
];
self.MonacoEnvironment = {
    getWorker(_, __) {
        if (__ == 'typescript' || __ == 'javascript') {
            return new tsWorker();
        }
        return new editorWorker()
    }
}
export default defineComponent({
    data() {
        const cp = this.$attrs.code ?? '';
        const code = ref(cp);
        const h = this.$attrs.height ?? '500px'
        return {
            handleRun: () => {
                runLog4aCode(code.value);
            },
            code,
            editor: null,
            height: h
        }
    },
    mounted() {
        this.initEditor();
    },
    methods: {
        initEditor() {
            const { isDark } = useData();
            const editor = monaco.editor.create(this.$refs.code, {
                theme: isDark ? 'vs-dark' : 'vs',
                value: this.code,
                language: 'javascript',
                lineNumbers: 'on',
                folding: true,
                scrollBeyondLastLine: true,
                automaticLayout: true,
                codeLens: false,
                minimap: {
                    enabled: false
                }
            });
            editor.onDidChangeModelContent(() => {
                const v = editor.getValue();
                this.code = v;
            })
        }
    }
})
</script>