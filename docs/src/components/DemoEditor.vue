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
import * as monaco from 'monaco-editor';
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
export default defineComponent({
    data() {
        const cp = this.$attrs.code??'';
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
        monaco.languages.register({ id: 'arkts' })
        monaco.languages.setLanguageConfiguration('arkts', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"', notIn: ['string'] },
                { open: "'", close: "'", notIn: ['string', 'comment'] },
                { open: '`', close: '`', notIn: ['string', 'comment'] },
                { open: '/**', close: ' */', notIn: ['string'] }
            ],
            folding: {
                markers: {
                    start: new RegExp('^\\s*//\\s*#?region\\b'),
                    end: new RegExp('^\\s*//\\s*#?endregion\\b')
                }
            },
            onEnterRules: [
                {
                    // e.g. /** | */
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    afterText: /^\s*\*\/$/,
                    action: {
                        indentAction: monaco.languages.IndentAction.IndentOutdent,
                        appendText: ' * '
                    }
                },
                {
                    // e.g. /** ...|
                    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                    action: {
                        indentAction: monaco.languages.IndentAction.None,
                        appendText: ' * '
                    }
                },
                {
                    // e.g.  * ...|
                    beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                    action: {
                        indentAction: monaco.languages.IndentAction.None,
                        appendText: '* '
                    }
                },
                {
                    // e.g.  */|
                    beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                    action: {
                        indentAction: monaco.languages.IndentAction.None,
                        removeText: 1
                    }
                }
            ],
        })
        monaco.languages.setMonarchTokensProvider('arkts', {
            tokenizer: {
                root: [
                    [/\"[^"]*"/, 'arkts-string'],
                    [/\'[^']*'/, 'arkts-string'],
                    [/\`[^`]*`/, 'arkts-string'],
                    [/@?[a-zA-Z][\w$]*/, {
                        cases: {
                            '@keywords': {
                                token: 'keyword.$0',
                                next: '@qualified'
                            },
                            '@default': 'variable'
                        }
                    }],
                    [/\\s[^\.].*\(\)/, 'function'],
                    [/\/\/.*/, 'comment']
                ],
                qualified: [
                    [
                        /[a-zA-Z_][\w]*/,
                        {
                            cases: {
                                '@keywords': { token: 'keyword.$0' },
                                '@default': 'identifier'
                            }
                        }
                    ],
                    [/\./, 'delimiter'],
                    ['', '', '@pop']
                ],
            },
            keywords,
            tokenPostfix: '.ets',
            defaultToken: ''
        });
        monaco.languages.typescript.typescriptDefaults.addExtraLib(`
        declare namespace Namespace {
            interface LM {
                text: string;
            }
        }
        `)
        monaco.editor.defineTheme('arktsTheme', {
            base: 'vs-dark',
            inherit: false,
            rules: [
                { token: 'arkts-string', foreground: 'AA7DFC' },
                { token: 'keyword', foreground: 'BBB529', fontStyle: 'bold' },
                { token: 'function', foreground: '65CCE1' },
                { token: 'comment', foreground: '808080' },
                { token: 'identifier', foreground: '507874' }
            ],
            colors: {
                "editor.foreground": "#FFFFFF",
                "editor.background": "#2B2B2B"
            }
        })
        monaco.languages.registerCompletionItemProvider('arkts', {
            provideCompletionItems: (model, position) => {
                let word = model.getWordUntilPosition(position);
                let range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                let suggestions = [
                    {
                        label: 'LogManager',
                        kind: monaco.languages.CompletionItemKind.Constant,
                        insertText: 'LogManager',
                        range,
                        documentation: ''
                    },
                    {
                        label: 'Logger',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: 'Logger',
                        range
                    },
                    {
                        label: 'AbstractLogger',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: 'AbstractLogger',
                        range
                    },
                    {
                        label: 'AbstractAppender',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: 'AbstractAppender',
                        range
                    },
                    {
                        label: 'CSVLayout',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: 'CSVLayout',
                        range
                    },
                    {
                        label: 'PatternLayout',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: 'PatternLayout',
                        range
                    }
                ].concat(keywords.map(k => {
                    return {
                        label: k,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: k
                    }
                }))
                return { suggestions }
            }
        })
        const editor = monaco.editor.create(this.$refs.code, {
            theme: "arktsTheme",
            value: this.code,
            language: 'arkts',
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
})
</script>