# Flipbase coding challenge junior Node.js developer

## Prerequisites

  - FFMPEG
  - Node.js

## Before you start

You need to the download the approriate FFMPEG package locally to your computer. Please find different packages for Linux, Mac and Windows on this webpage: https://www.ffmpeg.org/download.html.

When you run your Node.js programm, please use the `FFMPEG_PATH` environment variable with the path to the location of the `FFMPEG` program. I downloaded FFMPEG into the `~/Downloads/ffmpeg-v3.4.1` and extracted the program into the `~/Downloads` folder.

    FFMPEG_PATH=/Users/ronjansen/Downloads/ffmpeg node test/ffmpeg.js

## What the heck is FFMPEG?

FFMPEG is a really cool tool which you can use to retrieve metadata from videos files and more importantly: to transcode videos. When you want to publish video's on the web (like we do), and you want your users to be able to view the videos regardless the browser they are using, then you need to have multiple video formats of the same video file. Internet Explorer only accepts MP4 videos; Firefox likes OGV videos and Chrome diggs Webm encoded videos. 

**Important**: If setting up FFMPEG takes you a lot of time, please aks me to troubleshoot. Since this is not part of the assignment, you will not be judged if you were able to setup FFMPEG very quickly or not. The focus of this assignment is on Node.js back-end development, not on experience and skills with regards to transcoding videos.

### How to use it
Encode the video using the `fluent-ffmpeg` NPM library (which is already added to package.json). Don't worry, you only need to use a fraction of this HUGE library. The whole REAMDE can you find at: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg. Please be practical and scan the commands and options you need for this assignment. Also, check the `test/ffmpeg.js` file with example commands how to command a video to another format. 

## The assignment

  1. Setup an server with a single route (`GET /download-and-encode`).

  2. Once a visitor enters this webpage the Node.js server should start downloading a video to the server. The visitors needs to be able to see the progress of the download process in the web browser. 

  3. Once the video has been downloaded the Node.js server, the video should be transcoded to either an MP4 or WEBM format. The visitor should be informed about the transcoding progress.

  4. Send the succesfully transcoded video to the visitor and show the video

Note: please do not spend much time on the front-end; some simple dead ugly HTML without CSS is enough. We are looking for a Node.js expert, not a front-end person expert :)

## Deadline

Please push your final work to a fork of this repository before Friday 17:00h.

## Videos

The videos you need to download and transcode are available here (in an AWS S3 bucket):

  - https://s3.eu-central-1.amazonaws.com/flipbase-coding-challenge/puppies.mp4
  - https://s3.eu-central-1.amazonaws.com/flipbase-coding-challenge/elysium.mkv

**Good luck!**