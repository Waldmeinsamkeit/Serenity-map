import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  AlignLeft,
  Bot,
  Braces,
  Check,
  FileJson,
  GitBranch,
  NotebookText,
  Palette,
  Plus,
  Download,
  Tags,
  Upload,
  X,
} from 'lucide-react'
import { type Editor, Tldraw } from 'tldraw'
import { exportReadableContext } from '../ai/context'
import { applyAiPatch, parseAiPatch, summarizePatch, validatePatchForEditor } from '../ai/patch'
import {
  connectLearningCards,
  createLearningCard,
  getCardData,
  getNextBranchPosition,
  getSelectedLearningCards,
  syncLearningCardText,
  updateLearningCard,
} from '../model/learningGraph'
import type { AiPatch, LearningStatus, PatchValidationResult } from '../model/types'
import { loadLocalCanvasSnapshot, saveLocalCanvasSnapshot } from './localCanvasStore'

const STORAGE_KEY = 'serenity:last-ai-context'

interface InspectorState {
  title: string
  body: string
  summary: string
  tags: string
  status: LearningStatus
}

function toInspectorState(editor: Editor): InspectorState | null {
  const selected = getSelectedLearningCards(editor)
  if (selected.length !== 1) return null
  const data = selected[0].data
  return {
    title: data.title,
    body: data.body,
    summary: data.summary,
    tags: data.tags.join(', '),
    status: data.status,
  }
}

function copyText(text: string) {
  void navigator.clipboard?.writeText(text)
}

export function CanvasShell() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const isLoadingSnapshotRef = useRef(false)
  const [inspector, setInspector] = useState<InspectorState | null>(null)
  const [contextText, setContextText] = useState('')
  const [patchText, setPatchText] = useState('')
  const [patch, setPatch] = useState<AiPatch | null>(null)
  const [patchValidation, setPatchValidation] = useState<PatchValidationResult | null>(null)
  const [isPatchOpen, setPatchOpen] = useState(false)
  const [isContextOpen, setContextOpen] = useState(false)
  const [isStylePanelOpen, setStylePanelOpen] = useState(false)
  const [toast, setToast] = useState('')

  const refreshInspector = useCallback((nextEditor = editor) => {
    if (!nextEditor) return
    setInspector(toInspectorState(nextEditor))
  }, [editor])

  const handleMount = useCallback((mountedEditor: Editor) => {
    setEditor(mountedEditor)
    mountedEditor.updateInstanceState({ isGridMode: true })

    void (async () => {
      isLoadingSnapshotRef.current = true
      try {
        const snapshot = await loadLocalCanvasSnapshot()
        if (snapshot) {
          mountedEditor.loadSnapshot(snapshot)
          syncLearningCardText(mountedEditor)
          refreshInspector(mountedEditor)
        }
      } catch {
        showToast('本地画布读取失败，继续使用浏览器缓存')
      } finally {
        window.setTimeout(() => {
          isLoadingSnapshotRef.current = false
        }, 0)
      }
    })()

    mountedEditor.store.listen(() => {
      syncLearningCardText(mountedEditor)
      refreshInspector(mountedEditor)
      if (isLoadingSnapshotRef.current) return
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        void saveLocalCanvasSnapshot(mountedEditor.getSnapshot()).catch(() => {
          showToast('本地画布保存失败')
        })
      }, 800)
    })
    setTimeout(() => {
      syncLearningCardText(mountedEditor)
      refreshInspector(mountedEditor)
    }, 0)
  }, [refreshInspector])

  const selectedCards = useMemo(() => (editor ? getSelectedLearningCards(editor) : []), [editor, inspector])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function addCard() {
    if (!editor) return
    const selected = getSelectedLearningCards(editor)[0]
    const position = getNextBranchPosition(editor, selected?.shape.id)
    const created = createLearningCard(editor, {
      title: selected ? '新的探索分支' : '学习中心',
      summary: selected ? `从「${selected.data.title}」发散` : '从这里开始组织你的学习路径',
      status: selected ? 'exploring' : 'seed',
      tags: selected ? selected.data.tags : ['learning'],
      x: position.x + 130,
      y: position.y + 76,
    })
    if (selected) connectLearningCards(editor, selected.shape.id, created.shapeId, { kind: 'extends' })
    editor.select(created.shapeId)
    refreshInspector(editor)
  }

  function connectSelection() {
    if (!editor) return
    const selected = getSelectedLearningCards(editor)
    if (selected.length !== 2) {
      showToast('选择两个卡片后再连线')
      return
    }
    connectLearningCards(editor, selected[0].shape.id, selected[1].shape.id, {
      kind: 'related',
      label: 'related',
    })
    showToast('已创建学习关系')
  }

  function exportContext() {
    if (!editor) return
    syncLearningCardText(editor)
    const text = exportReadableContext(editor)
    setContextText(text)
    localStorage.setItem(STORAGE_KEY, text)
    setContextOpen(true)
  }

  function parsePatchFromInput(nextText = patchText) {
    if (!editor) return
    const parsed = parseAiPatch(nextText)
    if (!parsed.patch) {
      setPatch(null)
      setPatchValidation({ ok: false, errors: parsed.errors, warnings: [] })
      return
    }
    const validation = validatePatchForEditor(editor, parsed.patch)
    setPatch(parsed.patch)
    setPatchValidation(validation)
  }

  function applyPatch() {
    if (!editor || !patch) return
    const result = applyAiPatch(editor, patch)
    setPatchValidation(result)
    if (result.ok) {
      setPatchOpen(false)
      setPatchText('')
      setPatch(null)
      showToast('AI Patch 已应用')
    }
  }

  function saveInspector() {
    if (!editor || !inspector) return
    const selected = getSelectedLearningCards(editor)
    if (selected.length !== 1) return
    updateLearningCard(editor, selected[0].shape, {
      title: inspector.title,
      body: inspector.body,
      summary: inspector.summary,
      tags: inspector.tags.split(','),
      status: inspector.status,
    })
    syncLearningCardText(editor)
    showToast('卡片已更新')
  }

  const selectedData = selectedCards.length === 1 ? getCardData(selectedCards[0].shape) : null
  const visibleTags = inspector?.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const statusOptions: Array<{ value: LearningStatus; label: string }> = [
    { value: 'seed', label: 'Seed' },
    { value: 'exploring', label: 'Explore' },
    { value: 'verified', label: 'Verified' },
    { value: 'question', label: 'Question' },
    { value: 'archived', label: 'Archive' },
  ]

  return (
    <div className={isStylePanelOpen ? 'app-shell style-panel-open' : 'app-shell'}>
      <div className="canvas-frame">
        <Tldraw persistenceKey="serenity-learning-canvas" onMount={handleMount} />
      </div>

      <aside className="tool-rail" aria-label="Canvas tools">
        <button title="新增卡片" onClick={addCard}>
          <Plus size={18} />
        </button>
        <button title="连接两个选中卡片" onClick={connectSelection}>
          <ArrowRight size={18} />
        </button>
        <button title="从选中节点发散" onClick={addCard}>
          <GitBranch size={18} />
        </button>
        <button
          className={isStylePanelOpen ? 'is-active' : ''}
          title="形状/样式"
          onClick={() => setStylePanelOpen((value) => !value)}
        >
          <Palette size={18} />
        </button>
        <button title="导出 AI Context" onClick={exportContext}>
          <Upload size={18} />
        </button>
        <button title="导入 AI Patch" onClick={() => setPatchOpen(true)}>
          <Download size={18} />
        </button>
      </aside>

      <aside className="inspector">
        <div className="inspector-header">
          <div className="panel-title">
            <span className="panel-icon">
              <Bot size={17} />
            </span>
            <div>
              <strong>Serenity</strong>
              <span>{selectedData ? '节点属性' : '学习画布'}</span>
            </div>
          </div>
          {selectedData && <span className={`status-pill status-${selectedData.status}`}>{selectedData.status}</span>}
        </div>

        {inspector && selectedData ? (
          <div className="field-stack">
            <div className="node-summary">
              <div>
                <span>当前节点</span>
                <strong>{selectedData.title}</strong>
              </div>
              <code>{selectedData.id}</code>
            </div>

            <section className="inspector-section">
              <div className="section-heading">
                <NotebookText size={15} />
                <span>内容</span>
              </div>
              <label className="field-control">
                <span>标题</span>
                <input
                  aria-label="节点标题"
                  value={inspector.title}
                  onChange={(event) => setInspector({ ...inspector, title: event.target.value })}
                />
              </label>
              <label className="field-control">
                <span>摘要</span>
                <textarea
                  aria-label="节点摘要"
                  value={inspector.summary}
                  onChange={(event) => setInspector({ ...inspector, summary: event.target.value })}
                />
              </label>
              <label className="field-control">
                <span>正文</span>
                <textarea
                  aria-label="节点正文"
                  rows={5}
                  value={inspector.body}
                  onChange={(event) => setInspector({ ...inspector, body: event.target.value })}
                />
              </label>
            </section>

            <section className="inspector-section semantic-section">
              <div className="section-heading">
                <Tags size={15} />
                <span>语义</span>
              </div>
              <label className="field-control">
                <span>标签</span>
                <input
                  aria-label="节点标签"
                  value={inspector.tags}
                  onChange={(event) => setInspector({ ...inspector, tags: event.target.value })}
                />
                <small>用英文逗号分隔，标签不会显示在卡片上。</small>
              </label>
              {visibleTags && visibleTags.length > 0 && (
                <div className="tag-list" aria-label="当前标签">
                  {visibleTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="field-control">
                <span>状态</span>
                <div className="status-grid" role="group" aria-label="节点状态">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      className={inspector.status === option.value ? 'is-selected' : ''}
                      type="button"
                      onClick={() => setInspector({ ...inspector, status: option.value })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="inspector-section guide-section">
              <div className="section-heading">
                <AlignLeft size={15} />
                <span>AI 读取方式</span>
              </div>
              <p>标题、摘要、正文、标签和连线会进入 AI Context；卡片上只显示标题与摘要。</p>
            </section>
            <button className="primary-action" onClick={saveInspector}>
              <Check size={16} />
              保存
            </button>
          </div>
        ) : (
          <div className="empty-panel">
            <FileJson size={28} />
            <strong>未选择学习卡片</strong>
            <p>在画布上选择一个节点后，这里会显示可编辑的内容与 AI 语义信息。</p>
          </div>
        )}

      </aside>

      {isContextOpen && (
        <div className="modal-backdrop">
          <section className="context-modal">
            <header>
              <div>
                <h2>AI Context</h2>
                <p>当前画布的 AI 可读语义上下文。</p>
              </div>
              <button title="关闭" onClick={() => setContextOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <textarea readOnly className="context-modal-output" value={contextText} />
            <footer>
              <button onClick={() => setContextOpen(false)}>关闭</button>
              <button
                className="primary-action"
                onClick={() => {
                  copyText(contextText)
                  showToast('AI Context 已复制')
                }}
              >
                <Braces size={16} />
                复制上下文
              </button>
            </footer>
          </section>
        </div>
      )}

      {isPatchOpen && (
        <div className="modal-backdrop">
          <section className="patch-modal">
            <header>
              <div>
                <h2>AI Patch</h2>
                <p>粘贴 JSON patch，校验通过后再应用。</p>
              </div>
              <button title="关闭" onClick={() => setPatchOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <textarea
              className="patch-input"
              value={patchText}
              onChange={(event) => {
                setPatchText(event.target.value)
                parsePatchFromInput(event.target.value)
              }}
              placeholder='{"version":1,"operations":[{"op":"addNode","title":"新的概念"}]}'
            />
            <div className="patch-preview">
              {patch ? summarizePatch(patch).map((line) => <p key={line}>{line}</p>) : <p>暂无可预览操作。</p>}
            </div>
            {patchValidation && (
              <div className={patchValidation.ok ? 'validation-ok' : 'validation-error'}>
                {patchValidation.ok ? '校验通过' : patchValidation.errors.join('\n')}
                {patchValidation.warnings.length ? `\n${patchValidation.warnings.join('\n')}` : ''}
              </div>
            )}
            <footer>
              <button onClick={() => parsePatchFromInput()}>校验</button>
              <button className="primary-action" disabled={!patchValidation?.ok || !patch} onClick={applyPatch}>
                <Check size={16} />
                应用
              </button>
            </footer>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
