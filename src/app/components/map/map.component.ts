import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { select } from 'ng2-redux';
import { Observable } from 'rxjs/Observable';
import { MapModes } from './map';
import { GeolocationService, Position } from '~/services';
import { DestinationActions } from '~/actions';
// TODO-rangle: is there a better way to require this?
// The types don't seem to be loading for mapboxgl
// Should i add this to vendor.js?
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

@Component({
  selector: 'pa-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public supportsGL: boolean;
  public zoom: number;
  public mode: MapModes;
  public center: Position;

  @select() private destination$: Observable<Position>;

  constructor(
    private geoLocation: GeolocationService,
    private destinationActions: DestinationActions
  ) {
    this.zoom = 15;
    this.mode = 'street';
    this.center = {lat: -71.06, lng: 42.35};
  }

  ngOnInit() {
    this.supportsGL = mapboxgl.supported();

    // Listen to changes on destination
    this.destination$.subscribe(destination => {
      this.center = destination;
      this.zoom = 15;
    });

  }

  zoomChange(z: number): void {
    this.zoom += z;
  }

  modeChange(v: MapModes): void {
    console.log(v);
    this.mode = v;
  }

  recenterChange(): void {
    // TODO-rangle: would it be better to get this from global state?
    this.geoLocation.currentLocation()
      .then((p: Position) => {
        this.center = p;
        this.zoom = 18;
        this.destinationActions.setDestination(p);
      })
      .catch(() => {
        console.log('Current Location Not found');
      });
  }



}
