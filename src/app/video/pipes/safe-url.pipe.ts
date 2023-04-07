import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeURL',
})
export class SafeURLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  // the value the pipe is applied to
  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
