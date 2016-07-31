import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SpotApiService } from '../shared';

declare var google: any;

@Component({
  selector: 'main-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('googleMapsDiv') googleMapsDiv;
  map: any;

  constructor(private spotApi: SpotApiService) {
    // Do stuff
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    let mapDiv = this.googleMapsDiv.nativeElement;
    this.map = new google.maps.Map(mapDiv, {
        center: {lat: 42.360, lng: -71.059},
        zoom: 13
    });

    // Add spots to map from the spotApi
    this.spotApi.spots.forEach(function(spot){
      var marker = new google.maps.Marker({
        position: spot,
        map: this.map
      });
    }, this)

  }

}
