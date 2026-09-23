export type TaskName = 'VITS_Train' | 'VITS_Inference' | 'Audio_Video_Inference' | 'Video_Merge' | 'Course_Parse' | 'Course_Render'

export type ApiResult<T> = { result: T }

export type TaskStatus = boolean | string | null

export type CourseScene = {
  Index: number
  Image?: string
  Text?: string
  Script: string
}

export type CourseUploadResult = { result: string; course_id: string }
export type CourseScenesResult = { result: string; course_id?: string; scenes: CourseScene[] }
export type CourseTaskState = {
  task_id?: string
  status: 'idle' | 'queued' | 'running' | 'success' | 'failed'
  stage: string
  progress: number
  error?: string | null
}

export type CourseDraft = {
  user: string
  title: string
  ppt?: File
  image?: File
  audio?: File
}
