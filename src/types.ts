export type TaskName = 'VITS_Train' | 'VITS_Inference' | 'Audio_Video_Inference' | 'Video_Merge'

export type ApiResult<T> = { result: T }

export type TaskStatus = boolean | string | null

export type CourseDraft = {
  user: string
  title: string
  ppt?: File
  image?: File
  audio?: File
}
