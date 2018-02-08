# Video Downloading, Transcoding and Rendering with Node.js and FFMPEG

## Prerequisites

  - FFMPEG
  - Node.js

## Setup

* Download the appropriate FFMPEG package to your computer: https://www.ffmpeg.org/download.html. Use the `FFMPEG_PATH` environment variable with the path to the location of the `FFMPEG` program. 
* npm i
* Hack away!

## Running the program

Syntax:
`npm start <.mkv file>`

Example:
`npm start http://www.sample-videos.com/video/mkv/720/big_buck_bunny_720p_2mb.mkv`

## The Application

  1. A single route server (`GET /download-and-encode`).

  2. The application takes in a .mkv video file as command line argument

  3. Once entering the webpage Node.js starts downloading a video to the server. One sees the progress of the download process in the web browser. 

  4. Once the video has been downloaded on the Node.js server, the video transcodes to an MP4 format. One will be informed about the transcoding progress.

  5. The succesfully transcoded video is sent to the client side and shown in MP4 format


