const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

if (!process.env.FFMPEG_PATH)
  throw new Error('Whoops! You need to send the FFMPEG_PATH environment ' + 
    'variable before you run this test');

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

ffmpeg('./test/input.mp4') 

  /**
   *  This is how you transcode to MP4:
   */
  
  // .outputOptions([
  //   '-acodec libmp3lame',
  //   '-vcodec libx264',
  //   '-preset slow',
  //   '-profile:v baseline',
  //   '-level 3.0',
  //   '-pix_fmt yuv420p',
  //   '-movflags +faststart'
  // ])
  // .output('./test/output.mp4')
 
  /**
   *  This is how you transcode to WEBM:
   */
  
  .outputOptions([
    '-acodec libvorbis',
    '-vcodec libvpx-vp9',
    '-quality realtime',
    '-cpu-used 7',
  ])
  .output('./test/output.webm')
  .on('start', () => {
    console.log('Relax! FFMPEG is doing all the hard work')
  })
  .on('progress', function(progress) {
    console.log(progress.timemark + ' seconds of the video are transcoded');
  })
  .on('error', (err) => {
    console.error(err)
  })
  .on('end', () => {
    if (fs.existsSync('./test/output.webm'))
      return console.log('Yeah! You are good to go!')

    console.error('Whoopsie daisies; please check if you 1) downloaded FFMPEG ' +
     'to your computer and 2) if the FFMPEG_PATH is set accordingly.')
  })
  .run();