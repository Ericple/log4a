<template>
    <button @click="handleRun" class="runButton" style="margin-bottom: 12px;">在浏览器中运行(请自行打开控制台)</button>
    <div ref="codeEditor" :style="{ width: '100%', height: height }"></div>
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

<script setup>
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
import { runLog4aCode } from '@peercat/log4a';
import { useData } from 'vitepress';
import * as monaco from 'monaco-editor';
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
const props = defineProps({
    code: String,
    height: Number
});
const { isDark } = useData();
const code = ref(props.code ?? '');
const height = ref(props.height ?? '500px');
const codeEditor = ref('codeEditor');
const handleRun = () => {
    runLog4aCode(code.value);
}

const initializeEditor = (el) => {
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
    const editor = monaco.editor.create(el, {
        theme: isDark.value ? 'vs-dark' : 'vs',
        value: code.value,
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
        code.value = v;
    })
    watch(isDark, (v) => {
        editor.updateOptions({
            theme: v ? 'vs-dark' : 'vs'
        })
    })
}
onMounted(() => {
    const instance = getCurrentInstance();
    if (instance)
        initializeEditor(instance.refs.codeEditor);
})
</script>