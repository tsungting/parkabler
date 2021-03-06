import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Position } from '~/util';

// If the user is offline, use this data:
const data = require('./data/spots$.json');

@Injectable()
export class SpotsService {
  private lastSpots: any[] = [];
  public spots: FirebaseListObservable<any[]>;

  constructor(
    private af: AngularFire
  ) {
    // this.spots = Observable.of(data.spots);
    this.spots = af.database.list('spots');
  }

  // Gets all the spots from the database
  public get () {
    return this.spots;
  }
}
