import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest, lastValueFrom } from 'rxjs';
import IClip from '../models/clip.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  // query snapshot from Firebase db
  pageClips: IClip[] = [];
  pendingRequest = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }
        // query the data from user's database collection
        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({ title });
  }

  async deleteClip(clip: IClip) {
    // delete clip from storage
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    //delete screenshot from storage
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    await clipRef.delete();
    await screenshotRef.delete();

    // delete collection from storage
    await this.clipsCollection.doc(clip.docID).delete();
  }

  async getClips() {
    // don't query if pending is true
    if (this.pendingRequest) return;

    // to make requests
    this.pendingRequest = false;

    // make queries to the Firebase
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    const { length } = this.pageClips;

    if (length) {
      const lastDocId = this.pageClips[length - 1].docID;
      const lastDoc = await lastValueFrom(
        this.clipsCollection.doc(lastDocId).get()
      );
      // make queries after the last doc, so it doesn't request the same exact docs again
      query = query.startAfter(lastDoc);
    }

    // receive the requested clips and push them into the pageClips array
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data(),
      });
    });

    // to be able to do requests again
    this.pendingRequest = false;
  }

  // ActivatedRouteSnapshot: Store current route being visited ~> Access route params
  // RouterStateSnapshot: Store the representation of our route in a tree (Won't be used)
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params['id'])
      .get()
      .pipe(
        map((snapshot) => {
          //get the ID from the video in the URL
          const data = snapshot.data();

          if (!data) {
            // redirect user if page doesn't exist
            this.router.navigate(['/']);
            return null;
          }

          return data;
        })
      );
  }
}
