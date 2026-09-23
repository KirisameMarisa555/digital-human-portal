import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { digitalHumanApi } from './api/digitalHuman'
import type { CourseScene } from './types'
import { useSession } from './store/session'

type Step = 'upload' | 'edit' | 'generate' | 'result'
type Slide = CourseScene & { title: string }

function LoginCard() {
  const setSession = useSession((state) => state.setSession)
  const [user, setUser] = useState('Test')
  const [password, setPassword] = useState('123000')
  const mutation = useMutation({ mutationFn: () => digitalHumanApi.login(user, password), onSuccess: () => setSession(user) })
  return <div className="auth-card"><div className="eyebrow">DIGITAL HUMAN STUDIO</div><h1>把课件变成会讲课的数字人</h1><p className="muted">上传课件，编辑讲稿，生成完整课程视频。</p><label>账号<input value={user} onChange={(event) => setUser(event.target.value)} /></label><label>密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{mutation.isError && <div className="error">{(mutation.error as Error).message}</div>}<button className="primary full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? '正在连接云端...' : '进入工作台'}</button><div className="hint">数字人形象与声音使用系统预设</div></div>
}

function toSlides(scenes: CourseScene[], fileName: string): Slide[] {
  return scenes.map((scene, index) => ({ ...scene, title: scene.Text?.split('\n')[0] || (index === 0 ? fileName.replace(/\.(pptx?|pdf)$/i, '') : `第 ${scene.Index} 页`) }))
}

function Workspace() {
  const { user, clear } = useSession()
  const [step, setStep] = useState<Step>('upload')
  const [courseName, setCourseName] = useState('我的数字人课程')
  const [file, setFile] = useState<File>()
  const [courseId, setCourseId] = useState(() => localStorage.getItem('dh-course-id') || '')
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  const uploadAndParse = async () => {
    if (!file) return
    setBusy(true); setError(''); setNotice('正在上传课件...')
    try {
      const id = await digitalHumanApi.uploadCourse(user, file, courseName)
      setCourseId(id); localStorage.setItem('dh-course-id', id)
      setNotice(`课件已上传（${id}），正在解析页面...`)
      const scenes = await digitalHumanApi.parseCourse(user, id)
      if (!scenes.length) throw new Error('课件没有解析出页面')
      setSlides(toSlides(scenes, file.name)); setStep('edit'); setNotice(`已解析 ${scenes.length} 页，讲稿可以编辑。`)
    } catch (cause) { setError((cause as Error).message); setNotice('') } finally { setBusy(false) }
  }

  const saveScenes = async () => {
    if (!courseId) throw new Error('当前课程没有 Course_Id')
    await digitalHumanApi.saveCourseScenes(user, courseId, slides)
  }

  const saveDraft = async () => {
    setBusy(true); setError('')
    try { await saveScenes(); setNotice('讲稿已保存。') } catch (cause) { setError((cause as Error).message) } finally { setBusy(false) }
  }

  const generate = async () => {
    if (!courseId) return
    setBusy(true); setError(''); setStep('generate'); setNotice('正在保存讲稿并提交生成任务...')
    try {
      await saveScenes(); await digitalHumanApi.renderCourse(user, courseId); setNotice('课程生成任务已提交，云端正在处理。')
      for (let attempt = 0; attempt < 90; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000))
        const state = await digitalHumanApi.getCourseState(user, courseId)
        if (state.status === 'success') { setStep('result'); setNotice('课程视频已生成，可以下载。'); return }
        if (state.status === 'failed') throw new Error(state.error || '课程生成失败')
        setNotice(`课程正在${state.stage}（${state.progress}% · 已等待 ${Math.round((attempt + 1) * 2)} 秒）...`)
      }
      throw new Error('课程生成超时，请稍后在课程中重试')
    } catch (cause) { setError((cause as Error).message); setStep('edit') } finally { setBusy(false) }
  }

  const download = async () => {
    if (!courseId) return
    setBusy(true); setError('')
    try { const blob = await digitalHumanApi.downloadCourse(user, courseId); if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(URL.createObjectURL(blob)); setNotice('视频已加载，可在线播放。') } catch (cause) { setError((cause as Error).message) } finally { setBusy(false) }
  }

  const updateScript = (script: string) => setSlides((items) => items.map((item, index) => index === active ? { ...item, Script: script } : item))
  const current = slides[active]

  return <div className="shell"><header className="topbar"><div className="brand"><span className="brand-mark">D</span><span>数字人课程工作台</span></div><div className="top-actions"><span>{user}</span><button className="ghost" onClick={clear}>退出</button></div></header><main className="workspace"><section className="hero"><div><div className="eyebrow">CREATE COURSE</div><h1>{courseName}</h1><p>上传一份课件，编辑讲稿，生成数字人课程。</p>{courseId && <small className="muted">Course_Id：{courseId}</small>}</div><div className="hero-badge">数字人预设已就绪</div></section><div className="steps"><StepItem number="01" label="上传课件" active={step === 'upload'} done={step !== 'upload'} /><StepItem number="02" label="编辑讲稿" active={step === 'edit'} done={step === 'generate' || step === 'result'} /><StepItem number="03" label="生成课程" active={step === 'generate'} done={step === 'result'} /><StepItem number="04" label="查看结果" active={step === 'result'} done={false} /></div>{notice && <div className="notice">{notice}</div>}{error && <div className="error">{error}</div>}
    {step === 'upload' && <section className="panel course-upload"><div className="panel-heading"><div><h2>上传课件</h2><p>支持 PowerPoint 和 PDF，服务器会拆分页面并保留课程 ID。</p></div><span className="step">01</span></div><label className="course-name">课程名称<input value={courseName} onChange={(event) => setCourseName(event.target.value)} /></label><label className="dropzone"><input type="file" accept=".ppt,.pptx,.pdf" onChange={(event) => setFile(event.target.files?.[0])} /><span className="upload-icon">↑</span><strong>{file?.name || '点击选择或拖入课件'}</strong><small>文件仅用于本次课程制作</small></label><div className="preset"><div><span className="preset-avatar">D</span><div><strong>数字人预设</strong><small>默认形象 · 默认音色</small></div></div><span className="preset-ok">已固定</span></div><button className="primary" onClick={uploadAndParse} disabled={!file || busy}>{busy ? '正在解析...' : '上传并解析课件'}</button></section>}
    {step === 'edit' && <section className="editor-layout"><aside className="panel slide-list"><div className="panel-heading"><div><h2>课件页面</h2><p>{slides.length} 页 · Course_Id 已保存</p></div><span className="step">02</span></div>{slides.map((slide, index) => <button className={`slide-item ${index === active ? 'selected' : ''}`} key={slide.Index} onClick={() => setActive(index)}><span>{String(slide.Index).padStart(2, '0')}</span><div><strong>{slide.title}</strong><small>{slide.Script ? '已有讲稿' : '待编辑'}</small></div></button>)}</aside><section className="panel editor-main"><div className="canvas"><div className="canvas-label">页面 {current?.Index || '-'}</div><div className="canvas-copy">{current?.Text || '暂无页面文本'}</div></div><div className="script-box"><div className="panel-heading"><div><h2>本页讲稿</h2><p>修改后点击保存草稿。</p></div><button className="ghost" onClick={saveDraft} disabled={busy}>保存草稿</button></div><textarea value={current?.Script || ''} onChange={(event) => updateScript(event.target.value)} placeholder="请输入本页讲稿" /></div><div className="editor-actions"><button className="ghost" onClick={() => setStep('upload')}>重新上传</button><button className="primary" onClick={generate} disabled={busy || !courseId}>{busy ? '正在提交...' : '保存并生成课程'}</button></div></section></section>}
    {step === 'generate' && <section className="panel progress-card"><div className="panel-heading"><div><h2>正在生成课程</h2><p>Course_Id：{courseId}</p></div><span className="step">03</span></div><Progress label="保存逐页讲稿" done /><Progress label="生成语音、数字人和视频" active /><Progress label="合并最终 MP4" /><p className="muted">页面可以保持打开，任务状态由服务器持续查询。</p></section>}
    {step === 'result' && <section className="panel result-card"><div className="panel-heading"><div><h2>课程已生成</h2><p>Course_Id：{courseId}</p></div><span className="step">04</span></div>{videoUrl ? <video className="result-video" controls src={videoUrl} /> : <div className="result-placeholder">视频已准备好，点击下方加载并预览。</div>}<div className="editor-actions"><button className="ghost" onClick={() => setStep('edit')}>继续编辑</button><button className="primary" onClick={download} disabled={busy}>{busy ? '正在加载...' : '加载并预览视频'}</button></div></section>}
    </main></div>
}

function StepItem({ number, label, active, done }: { number: string; label: string; active: boolean; done: boolean }) { return <div className={`step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}><span>{done ? '✓' : number}</span>{label}</div> }
function Progress({ label, done, active }: { label: string; done?: boolean; active?: boolean }) { return <div className="progress-row"><span className={`progress-dot ${done ? 'done' : active ? 'active' : ''}`}>{done ? '✓' : ''}</span><span>{label}</span><strong>{done ? '已完成' : active ? '处理中' : '等待中'}</strong></div> }
export default function App() { return useSession((state) => state.loggedIn) ? <Workspace /> : <div className="auth-shell"><LoginCard /></div> }
