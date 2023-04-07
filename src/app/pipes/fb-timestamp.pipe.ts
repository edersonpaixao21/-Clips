import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'fbTimestamp',
})
export class FbTimestampPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: firebase.firestore.FieldValue | undefined) {
    if (!value) {
      return '';
    }

    // firebase Timestamp returns a FieldValue and bc we want to use a valid date, we should type is as Timestamp
    const date = (value as firebase.firestore.Timestamp).toDate();

    // using pipe to transform the date to 'mediumDate' ~>  'MMM d, y' which is ~>  Jun 15, 2015
    return this.datePipe.transform(date, 'mediumDate', '', 'pt-br');
  }
}
