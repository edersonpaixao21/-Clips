import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.scss'],
  providers: [DatePipe],
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable = true;

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    if (this.scrollable) {
      // create event listener
      window.addEventListener('scroll', this.handleScroll);
    }
  }
  ngOnDestroy(): void {
    if (this.scrollable) {
      // destroy event listener to prevent memory leak
      window.removeEventListener('scroll', this.handleScroll);
    }

    // to empty clips rendered on screen so every time the user loads the page, it will render new clips
    this.clipService.pageClips = [];
  }

  // fn to create infinite scrollable clips
  handleScroll = () => {
    // get the sizes of the document element
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    // verify if the user scrolled to the bottom enough to make start new queries to the Firebase
    const bottomOfWindow = Math.floor(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) this.clipService.getClips();
  };
}
