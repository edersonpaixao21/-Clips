import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  //create player instance
  player?: videojs.Player;

  // to get info from the clip and show them to the user
  clip?: IClip;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);

    // store resolved data in data property
    this.route.data.subscribe((data) => {
      this.clip = data['clip'] as IClip;

      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4',
      });
    });
  }
}
