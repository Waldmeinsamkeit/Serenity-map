import { useCallback, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Braces,
  Check,
  Database,
  FileJson,
  GitBranch,
  History,
  NotebookText,
  Palette,
  Plus,
  Download,
  RotateCw,
  Save,
  Tags,
  Trash2,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { type Editor, type TLShapeId, Tldraw } from 'tldraw'
import { exportObsidianMarkdown } from '../ai/context'
import { applyAiPatch, parsePatchText, summarizePatch, validatePatchForEditor } from '../ai/patch'
import {
  buildCanvasIndex,
  connectLearningCards,
  createLearningCard,
  getCardData,
  getNextBranchPosition,
  getSelectedLearningCards,
  syncLearningCardText,
  updateLearningCard,
} from '../model/learningGraph'
import { createRoboticsIndustryMap } from '../model/roboticsSeed'
import { createAiSemiconductorIndustryMap } from '../model/aiSemiconductorSeed'
import { SERENITY_META_KEY, type AiPatch, type LearningStatus, type PatchValidationResult } from '../model/types'
import {
  createLocalCanvasBackup,
  loadLocalCanvasSnapshot,
  restoreLocalCanvasPageFromBackup,
  saveLocalCanvasSnapshot,
} from './localCanvasStore'
import { inspectSerenitySnapshot, isSaveableSerenitySnapshot } from './snapshotGuards'

const STORAGE_KEY = 'serenity:last-ai-context'

interface InspectorState {
  title: string
  body: string
  summary: string
  tags: string
  status: LearningStatus
}

type SaveStatus = 'loading' | 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict' | 'skipped'

interface SyncStatusState {
  status: SaveStatus
  message: string
  updatedAt?: string
  pageId?: string
  pageName?: string
  nodeCount: number
  edgeCount: number
}

const INITIAL_SYNC_STATUS: SyncStatusState = {
  status: 'loading',
  message: '正在连接本地快照',
  nodeCount: 0,
  edgeCount: 0,
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

function downloadMarkdownFile(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function markdownFilename() {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  return `serenity-canvas-${timestamp}.md`
}

function formatSyncTime(value?: string) {
  if (!value) return '尚未写入'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间未知'
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function hasAnyLearningCard(editor: Editor) {
  return editor.getSnapshot().document.store
    ? Object.values(editor.getSnapshot().document.store).some((record) => (
      record.typeName === 'shape' ? Boolean(getCardData(record)) : false
    ))
    : false
}

export function CanvasShell() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const canSaveSnapshotRef = useRef(false)
  const saveWarningShownRef = useRef(false)
  const saveInFlightRef = useRef(false)
  const saveAgainRef = useRef(false)
  const manualSaveRef = useRef<(() => void) | null>(null)
  const importFileInputRef = useRef<HTMLInputElement | null>(null)
  const storeUpdatedAtRef = useRef<string | undefined>(undefined)
  const [inspector, setInspector] = useState<InspectorState | null>(null)
  const [contextText, setContextText] = useState('')
  const [patchText, setPatchText] = useState('')
  const [patch, setPatch] = useState<AiPatch | null>(null)
  const [patchValidation, setPatchValidation] = useState<PatchValidationResult | null>(null)
  const [isPatchOpen, setPatchOpen] = useState(false)
  const [isContextOpen, setContextOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isStylePanelOpen, setStylePanelOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(INITIAL_SYNC_STATUS)
  const [toast, setToast] = useState('')

  const refreshInspector = useCallback((nextEditor = editor) => {
    if (!nextEditor) return
    setInspector(toInspectorState(nextEditor))
  }, [editor])

  const updateSyncStatus = useCallback((
    nextEditor: Editor,
    status: SaveStatus,
    message: string,
    updatedAt = storeUpdatedAtRef.current
  ) => {
    const index = buildCanvasIndex(nextEditor)
    const currentPage = nextEditor.getCurrentPage()
    setSyncStatus({
      status,
      message,
      updatedAt,
      pageId: currentPage.id,
      pageName: currentPage.name,
      nodeCount: index.nodesById.size,
      edgeCount: index.edgesById.size,
    })
  }, [])

  const handleMount = useCallback((mountedEditor: Editor) => {
    setEditor(mountedEditor)
    mountedEditor.updateInstanceState({ isGridMode: true })

    const saveSnapshot = () => {
      if (saveInFlightRef.current) {
        saveAgainRef.current = true
        updateSyncStatus(mountedEditor, 'dirty', '有新修改，等待当前保存完成')
        return
      }

      const snapshot = mountedEditor.getSnapshot()
      const health = inspectSerenitySnapshot(snapshot)
      if (!health.ok || !isSaveableSerenitySnapshot(snapshot)) {
        updateSyncStatus(mountedEditor, 'skipped', '跳过空画布，未覆盖 MCP 快照')
        if (!saveWarningShownRef.current) {
          saveWarningShownRef.current = true
          showToast('跳过空画布保存，避免覆盖本地数据')
        }
        return
      }
      saveInFlightRef.current = true
      updateSyncStatus(mountedEditor, 'saving', '正在写入本地快照')
      void saveLocalCanvasSnapshot(snapshot, storeUpdatedAtRef.current).then((result) => {
        storeUpdatedAtRef.current = result.updatedAt
        saveWarningShownRef.current = false
        updateSyncStatus(mountedEditor, 'saved', '已保存，MCP 可读取当前页', result.updatedAt)
      }).catch((error) => {
        const message = error instanceof Error ? error.message : ''
        if (message.includes('changed on disk')) {
          updateSyncStatus(mountedEditor, 'conflict', '本地快照已被外部修改')
          showToast('本地快照有外部修改，请刷新后再保存')
        } else {
          updateSyncStatus(mountedEditor, 'error', '本地画布保存失败')
          showToast('本地画布保存失败')
        }
      }).finally(() => {
        saveInFlightRef.current = false
        if (saveAgainRef.current) {
          saveAgainRef.current = false
          saveTimerRef.current = window.setTimeout(saveSnapshot, 0)
        }
      })
    }

    const seedDefaultCanvas = () => {
      createRoboticsIndustryMap(mountedEditor)
      createAiSemiconductorIndustryMap(mountedEditor)
      syncLearningCardText(mountedEditor)
      refreshInspector(mountedEditor)
      saveSnapshot()
    }

    void (async () => {
      canSaveSnapshotRef.current = false
      try {
        const stored = await loadLocalCanvasSnapshot()
        if (stored?.snapshot) {
          storeUpdatedAtRef.current = stored.updatedAt
          const health = inspectSerenitySnapshot(stored.snapshot)
          if (health.ok) {
            try {
              mountedEditor.loadSnapshot(stored.snapshot)
              syncLearningCardText(mountedEditor)
              refreshInspector(mountedEditor)
              updateSyncStatus(mountedEditor, 'saved', '已加载本地快照，MCP 可读取', stored.updatedAt)
            } catch {
              updateSyncStatus(mountedEditor, 'error', '本地快照无法加载')
              showToast('本地画布快照无法加载，已重新初始化')
            }
          } else {
            updateSyncStatus(mountedEditor, 'skipped', '本地快照为空，已重新初始化')
            showToast('本地画布快照为空，已重新初始化')
          }
        }
        if (!hasAnyLearningCard(mountedEditor)) {
          seedDefaultCanvas()
        }
      } catch {
        updateSyncStatus(mountedEditor, 'error', '本地画布读取失败')
        showToast('本地画布读取失败，已重新初始化')
        if (!hasAnyLearningCard(mountedEditor)) {
          seedDefaultCanvas()
        }
      } finally {
        window.setTimeout(() => {
          canSaveSnapshotRef.current = true
        }, 0)
      }
    })()

    mountedEditor.store.listen(() => {
      syncLearningCardText(mountedEditor)
      refreshInspector(mountedEditor)
      if (!canSaveSnapshotRef.current) return
      updateSyncStatus(mountedEditor, 'dirty', '有未保存更改，等待自动同步')
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null
        saveSnapshot()
      }, 800)
    })
    setTimeout(() => {
      syncLearningCardText(mountedEditor)
      refreshInspector(mountedEditor)
    }, 0)
    manualSaveRef.current = saveSnapshot
  }, [refreshInspector, updateSyncStatus])

  const selectedCards = useMemo(() => (editor ? getSelectedLearningCards(editor) : []), [editor, inspector])
  const searchResults = useMemo(() => {
    if (!editor) return []
    const query = searchQuery.trim().toLowerCase()
    const nodes = [...buildCanvasIndex(editor).nodesById.values()]
    if (!query) return nodes.slice(0, 8)
    return nodes
      .filter((node) => {
        const haystack = [
          node.id,
          node.title,
          node.summary,
          node.body,
          node.status,
          ...node.tags,
        ].join(' ').toLowerCase()
        return haystack.includes(query)
      })
      .slice(0, 12)
  }, [editor, inspector, searchQuery])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function syncNow() {
    if (!editor || !manualSaveRef.current) return
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    manualSaveRef.current()
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

  async function clearCurrentPage() {
    if (!editor) return
    const currentPage = editor.getCurrentPage()
    const shapeIds = editor.getCurrentPageShapes().map((shape) => shape.id)
    if (!shapeIds.length) {
      showToast('当前页面已经为空')
      return
    }

    const pageMeta = currentPage.meta as Record<string, unknown>
    const existingSerenityMeta = pageMeta[SERENITY_META_KEY]
    const serenityPageMeta =
      existingSerenityMeta && typeof existingSerenityMeta === 'object' && !Array.isArray(existingSerenityMeta)
        ? existingSerenityMeta
        : {}

    try {
      await createLocalCanvasBackup(editor.getSnapshot(), currentPage.id, 'clear-current-page')
    } catch {
      updateSyncStatus(editor, 'error', '清空前备份失败，未清空当前页')
      showToast('清空前备份失败，未清空当前页')
      return
    }

    editor.markHistoryStoppingPoint('clear-current-page')
    editor.run(() => {
      editor.updatePage({
        id: currentPage.id,
        meta: {
          ...pageMeta,
          [SERENITY_META_KEY]: {
            ...serenityPageMeta,
            kind: 'serenity-page',
            allowEmpty: true,
            clearedAt: new Date().toISOString(),
          },
        },
      })
      editor.deleteShapes(shapeIds)
      editor.selectNone()
    })
    refreshInspector(editor)
    showToast('当前页面已清空，可撤销或从历史恢复')
  }

  async function restorePreviousPage() {
    if (!editor) return
    const currentPage = editor.getCurrentPage()
    try {
      updateSyncStatus(editor, 'saving', '正在恢复上一版页面')
      canSaveSnapshotRef.current = false
      const restored = await restoreLocalCanvasPageFromBackup(currentPage.id)
      storeUpdatedAtRef.current = restored.updatedAt
      editor.loadSnapshot(restored.snapshot as any)
      syncLearningCardText(editor)
      refreshInspector(editor)
      updateSyncStatus(editor, 'saved', '已恢复上一版页面，MCP 可读取', restored.updatedAt)
      showToast('已恢复上一版页面')
      window.setTimeout(() => {
        canSaveSnapshotRef.current = true
      }, 0)
    } catch {
      canSaveSnapshotRef.current = true
      updateSyncStatus(editor, 'error', '没有可恢复的历史页面')
      showToast('没有可恢复的历史页面')
    }
  }

  function exportContext() {
    if (!editor) return
    syncLearningCardText(editor)
    const text = exportObsidianMarkdown(editor)
    setContextText(text)
    localStorage.setItem(STORAGE_KEY, text)
    downloadMarkdownFile(markdownFilename(), text)
    setContextOpen(true)
  }

  function parsePatchFromInput(nextText = patchText) {
    if (!editor) return
    const parsed = parsePatchText(nextText, buildCanvasIndex(editor))
    if (!parsed.patch) {
      setPatch(null)
      setPatchValidation({ ok: false, errors: parsed.errors, warnings: [] })
      return
    }
    const validation = validatePatchForEditor(editor, parsed.patch)
    setPatch(parsed.patch)
    setPatchValidation(validation)
  }

  async function importMarkdownFile(file?: File) {
    if (!file) return
    const text = await file.text()
    setPatchText(text)
    parsePatchFromInput(text)
  }

  function focusSearchResult(shapeId: string) {
    if (!editor) return
    const typedShapeId = shapeId as TLShapeId
    editor.select(typedShapeId)
    const bounds = editor.getShapePageBounds(typedShapeId)
    if (bounds) {
      editor.zoomToBounds(bounds, { animation: { duration: 220 }, inset: 96 })
    }
    refreshInspector(editor)
    setSearchOpen(false)
  }

  function applyPatch() {
    if (!editor || !patch) return
    const result = applyAiPatch(editor, patch)
    setPatchValidation(result)
    if (result.ok) {
      setPatchOpen(false)
      setPatchText('')
      setPatch(null)
      showToast('Obsidian Markdown 已导入')
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
  const mcpLabel = syncStatus.status === 'saved'
    ? 'MCP 已同步'
    : syncStatus.status === 'saving'
      ? 'MCP 同步中'
      : 'MCP 待同步'
  const syncButtonDisabled =
    !editor || syncStatus.status === 'saving' || syncStatus.status === 'loading'
  const syncStatusTitle = `${syncStatus.message} · ${syncStatus.pageName ?? '当前页'} · ${syncStatus.nodeCount} 节点 / ${syncStatus.edgeCount} 连线 · ${formatSyncTime(syncStatus.updatedAt)}`

  return (
    <div className={isStylePanelOpen ? 'app-shell style-panel-open' : 'app-shell'}>
      <div className="canvas-frame">
        <Tldraw onMount={handleMount} />
      </div>

      <aside className="tool-rail" aria-label="Canvas tools">
        <button title="新增卡片" onClick={addCard}>
          <Plus size={18} />
        </button>
        <button title="连接两个选中卡片" onClick={connectSelection}>
          <ArrowRight size={18} />
        </button>
        <button title="清空当前页面" onClick={() => void clearCurrentPage()}>
          <Trash2 size={18} />
        </button>
        <button title="恢复上一版页面" onClick={() => void restorePreviousPage()}>
          <History size={18} />
        </button>
        <button title="从选中节点发散" onClick={addCard}>
          <GitBranch size={18} />
        </button>
        <button
          className={isStylePanelOpen ? 'is-active' : ''}
          title="形状/样式"
          onClick={() => {
            setStylePanelOpen((value) => !value)
            setSearchOpen(false)
          }}
        >
          <Palette size={18} />
        </button>
        <button
          className={isSearchOpen ? 'is-active' : ''}
          type="button"
          title="搜索节点"
          aria-label="搜索节点"
          aria-expanded={isSearchOpen}
          aria-controls="node-search-popover"
          onClick={() => {
            setSearchOpen((value) => !value)
            setStylePanelOpen(false)
          }}
        >
          <Search size={18} />
        </button>
        <button title="导入 Obsidian Markdown" onClick={() => setPatchOpen(true)}>
          <Download size={18} />
        </button>
        <button title="导出 Obsidian Markdown" onClick={exportContext}>
          <Upload size={18} />
        </button>
      </aside>

      {isSearchOpen && (
        <div className="search-popover" id="node-search-popover">
          <div className="search-popover-header">
            <strong>搜索节点</strong>
            <span>{searchResults.length} 个结果</span>
          </div>
          <div className="search-box">
            <Search size={15} />
            <input
              autoFocus
              aria-label="搜索节点"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="标题、正文、标签或 ID"
            />
            {searchQuery && (
              <button type="button" title="清空搜索" aria-label="清空搜索" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="search-results">
            {searchResults.length ? (
              searchResults.map((node) => (
                <button key={node.id} type="button" onClick={() => focusSearchResult(node.shapeId)}>
                  <strong>{node.title}</strong>
                  <span>{node.summary || node.body || node.id}</span>
                  <code>{node.tags.length ? node.tags.join(', ') : node.status}</code>
                </button>
              ))
            ) : (
              <p role="status">没有匹配的节点</p>
            )}
          </div>
        </div>
      )}

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
          <div className="inspector-header-actions">
            <div className={`sync-status-inline sync-status-${syncStatus.status}`} aria-live="polite" title={syncStatusTitle}>
              <span className="sync-status-icon">
                {syncStatus.status === 'error' || syncStatus.status === 'conflict' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Save size={14} />
                )}
              </span>
              <div>
                <strong>{mcpLabel}</strong>
                <span>{formatSyncTime(syncStatus.updatedAt)}</span>
              </div>
            </div>
            <button
              className="sync-now-button"
              type="button"
              disabled={syncButtonDisabled}
              title={syncStatusTitle}
              onClick={syncNow}
            >
              <RotateCw size={14} />
            </button>
            {selectedData && <span className={`status-pill status-${selectedData.status}`}>{selectedData.status}</span>}
          </div>
        </div>

        <div className="sync-status-meta" aria-label="MCP 同步详情">
          <Database size={13} />
          <span>
            {syncStatus.message} · {syncStatus.pageName ?? '当前页'} · {syncStatus.nodeCount} 节点 / {syncStatus.edgeCount} 连线
          </span>
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
          <section className="context-modal markdown-modal">
            <header className="markdown-modal-header">
              <div>
                <span className="modal-kicker">Export</span>
                <h2>Obsidian Markdown</h2>
                <p>当前画布已转换为可放入 Obsidian 的 Markdown。</p>
              </div>
              <button type="button" title="关闭" aria-label="关闭导出弹窗" onClick={() => setContextOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="markdown-modal-grid">
              <aside className="markdown-side-panel">
                <div>
                  <span>文件类型</span>
                  <strong>.md / text/markdown</strong>
                </div>
                <div>
                  <span>包含内容</span>
                  <strong>Properties、节点、关系、Mermaid</strong>
                </div>
                <div>
                  <span>Obsidian 特性</span>
                  <strong>[[内链]]、#tags、callout</strong>
                </div>
              </aside>
              <textarea readOnly className="context-modal-output markdown-textarea" value={contextText} />
            </div>
            <footer className="markdown-modal-footer">
              <button type="button" onClick={() => setContextOpen(false)}>关闭</button>
              <button
                className="primary-action"
                onClick={() => {
                  copyText(contextText)
                  showToast('Obsidian Markdown 已复制')
                }}
              >
                <Braces size={16} />
                复制 Markdown
              </button>
            </footer>
          </section>
        </div>
      )}

      {isPatchOpen && (
        <div className="modal-backdrop">
          <section className="patch-modal markdown-modal import-markdown-modal">
            <header className="markdown-modal-header">
              <div>
                <span className="modal-kicker">Import</span>
                <h2>Obsidian Markdown</h2>
                <p>粘贴或选择 Serenity 导出的 Markdown，校验通过后再应用。</p>
              </div>
              <button type="button" title="关闭" aria-label="关闭导入弹窗" onClick={() => setPatchOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="import-modal-grid">
              <aside className="markdown-side-panel import-source-panel">
                <div>
                  <span>输入来源</span>
                  <strong>粘贴 Markdown 或选择 .md 文件</strong>
                </div>
                <button type="button" onClick={() => importFileInputRef.current?.click()}>
                  <Download size={15} />
                  选择 Markdown
                </button>
                <p>会转换为节点更新、新增节点和关系连接，再交给 Serenity 校验。</p>
              </aside>
              <textarea
                className="patch-input markdown-textarea"
                value={patchText}
                onChange={(event) => {
                  setPatchText(event.target.value)
                  parsePatchFromInput(event.target.value)
                }}
                placeholder={'---\ntitle: "Serenity Canvas Export"\ntype: canvas-context\n---\n\n## Nodes\n### 新的概念 (node-new-concept)'}
              />
            </div>
            <div className="patch-preview markdown-preview-panel">
              <strong>操作预览</strong>
              {patch ? summarizePatch(patch).map((line) => <p key={line}>{line}</p>) : <p>暂无可预览操作。</p>}
            </div>
            {patchValidation && (
              <div className={patchValidation.ok ? 'validation-ok' : 'validation-error'}>
                {patchValidation.ok ? '校验通过' : patchValidation.errors.join('\n')}
                {patchValidation.warnings.length ? `\n${patchValidation.warnings.join('\n')}` : ''}
              </div>
            )}
            <footer className="markdown-modal-footer">
              <input
                ref={importFileInputRef}
                type="file"
                accept=".md,text/markdown,text/plain"
                hidden
                onChange={(event) => {
                  void importMarkdownFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <button type="button" onClick={() => parsePatchFromInput()}>校验</button>
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
