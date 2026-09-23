# 数字人课程门户

浏览器请求同源 `/api`，Vite 将请求代理到本机 5001 端口；本机 5001 端口通过 SSH 隧道连接云服务器：

```bash
ssh -N -L 5001:127.0.0.1:5000 -p 29143 root@connect.nmb2.seetacloud.com
```

然后新开终端运行：

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:5173`，测试账号使用云端测试环境账号。

当前门户目标流程为：登录 → 上传原始 PPT/PPTX/PDF → 服务器解析页面 → 编辑逐页讲稿 → 生成语音、数字人和课程视频 → 浏览器下载 MP4/SRT。数字人图片和音色以系统预设呈现，不让用户上传底层素材。门户会将上传接口返回的 `Course_Id` 保存到浏览器本地，并在后续请求中持续携带。\n\n课程接口：\n\n- `POST /Course_Upload`：上传 PPT/PDF，返回 `course_id`；\n- `POST /Course_Parse`：携带 `User`、`Course_Id`，解析页面并生成讲稿草稿；\n- `GET/PUT /Course_Scenes`：携带 `User`、`course_id` 或 `Course_Id`，读取和保存逐页讲稿；\n- `POST /Course_Render`：携带 `User`、`Course_Id`，提交课程生成任务；\n- `POST /Course_State`：携带 `User`、`Course_Id` 查询任务状态；\n- `GET /Course_Download`：携带 `User`、`course_id`、`type=mp4|vtt` 下载结果。
