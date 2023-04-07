import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady = false;
  private ffmpeg;
  isRunning = false;

  constructor() {
    // turn log ON to debug ffmpeg during development
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    // prevent file to reload
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    // start the process of getting screenshots
    this.isRunning = true;
    // convert to binary data
    const data = await fetchFile(file);

    // store the file before running ffmpeg commands
    this.ffmpeg.FS('writeFile', file.name, data);

    // const seconds = [1, 2, 3, 4, 5, 6];
    const seconds = [1, 2, 3];
    const commands: string[] = [];

    // create multiple screenshots
    seconds.forEach((second) => {
      commands.push(
        // Input
        // grab a specific file from FileSystem (FS()), can be access by their name
        '-i',
        file.name,
        // Output Options
        // configure the timestamp - format: hh:mm:ss
        '-ss',
        `00:00:0${second + 2}`,
        // define how many frames to focus on to take the screenshot
        '-frames:v',
        '1',
        // the size of the image screenshot - it can be resized to a specific value - fn scale(width:height)
        // using '-1' will preserver the original aspect ratio from the uploaded video
        '-filter:v',
        'scale=510:-1',
        // Output
        `output_0${second}.png`
      );
    });

    // processing the file
    await this.ffmpeg.run(...commands);

    // create variable to store the screenshots URLs
    const screenshots: string[] = [];

    seconds.forEach((second) => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );
      //use BLOB: Binary Large OBject - It cannot be updated after being created
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });

      // create URL to be shown in the browser
      const screenshotURL = URL.createObjectURL(screenshotBlob);

      screenshots.push(screenshotURL);
    });

    this.isRunning = false;

    return screenshots;
  }

  async blobFromUrl(url: string) {
    // using fetch to get a file in the memory of the user browser
    const response = await fetch(url);
    const blob = await response.blob();

    // return the created blob from the URL
    return blob;
  }
}
