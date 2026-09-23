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

当前门户目标流程为：登录 → 上传原始 PPT/PPTX/PDF → 服务器解析页面 → 编辑逐页讲稿 → 生成语音、数字人和课程视频 → 浏览器下载 MP4/SRT。数字人图片和音色以系统预设呈现，不让用户上传底层素材。\n\n云端现有服务尚未提供原始 PPT 解析、讲稿生成和课程级渲染接口；当前页面先完成产品流程和交互骨架。接入真实接口时使用以下课程接口契约：\n\n- `POST /Course_Upload`：上传 PPT/PDF，返回 `Course_Id`；\n- `POST /Course_Parse`：解析页面并生成讲稿草稿；\n- `PUT /Course_Slides`：保存用户编辑后的讲稿；\n- `POST /Course_Render`：提交课程生成任务；\n- `POST /Course_State`：查询课程任务状态；\n- `POST /Course_Download`：下载最终 MP4。
