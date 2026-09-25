# 音乐输入

本包不包含原曲音频。请自行取得有权使用的《Let Me Go（共创版）》音轨，并分别放在 `v1/assets/song.mp3` 与 `v2/assets/song.mp3`。

原工程使用约124.44秒的罐装毕加索版本，歌曲来源：[BV1XbY66nEWr](https://www.bilibili.com/video/BV1XbY66nEWr/)。其他同名歌曲或不同剪辑的时间轴不能直接替换。

已有授权本地音轨可以通过FFmpeg转为MP3：

```bash
ffmpeg -i "your-authorized-audio.flac" -vn -c:a libmp3lame -q:a 2 "v2/assets/song.mp3"
```

再复制到v1的对应位置即可。`.gitignore`已排除这些本地音频，避免把文件随源码提交。未导入音乐时可用README中的单章画面入口查看视觉效果。
