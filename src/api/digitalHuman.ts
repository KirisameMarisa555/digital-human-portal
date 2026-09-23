import { apiClient } from './client'
import type { ApiResult, TaskName, TaskStatus } from '../types'

export const digitalHumanApi = {
  async login(user: string, password: string) {
    const { data } = await apiClient.post<ApiResult<string>>('/Login', { User: user, Password: password })
    if (data.result !== 'Success') throw new Error('账号或密码错误')
    return data.result
  },
  async uploadImage(user: string, file: File) {
    const content = await file.arrayBuffer()
    const bytes = new Uint8Array(content)
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    const { data } = await apiClient.post<ApiResult<string>>('/Send_Image', { User: user, Img: btoa(binary) })
    if (data.result !== 'Success') throw new Error('图片上传失败')
  },
  async uploadVideo(user: string, file: File) {
    const form = new FormData(); form.append('Json', JSON.stringify({ User: user })); form.append('File', file)
    const { data } = await apiClient.post<ApiResult<string>>('/Send_Video', form)
    if (data.result !== 'Success') throw new Error('课件视频上传失败')
  },
  async uploadAudio(user: string, file: File, audioName = file.name) {
    const form = new FormData(); form.append('Json', JSON.stringify({ User: user, Audio_Name: audioName })); form.append('File', file)
    const { data } = await apiClient.post<ApiResult<string>>('/Send_PPT_Audio', form)
    if (data.result !== 'Success') throw new Error('音频上传失败')
  },
  async createSynthesis(user: string) {
    const { data } = await apiClient.post<ApiResult<string>>('/Get_Inference_User_Audio_Sadtalker', { User: user })
    if (data.result === 'Failed') throw new Error('数字人推理任务提交失败')
    return data.result
  },
  async mergeVideo(user: string) {
    const { data } = await apiClient.post<ApiResult<string>>('/PPT_Video_Merge', { User: user })
    if (data.result === 'Failed') throw new Error('视频合成任务提交失败')
    return data.result
  },
  async getTaskStatus(user: string, task: TaskName): Promise<TaskStatus> {
    const { data } = await apiClient.post<ApiResult<TaskStatus>>('/Get_State', { User: user, Task: task })
    return data.result
  },
  async downloadVideo(user: string) {
    const { data } = await apiClient.post<ApiResult<string>>('/Pull_Video_Merge', { User: user })
    if (data.result === 'Failed') throw new Error('视频暂不可用')
    return data.result
  },
}
