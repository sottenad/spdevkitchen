import * as ko from 'knockout';

export default class HelloWorldViewModel {
  private messageText: KnockoutObservable<string> = ko.observable('');
  private fontSize: KnockoutObservable<number> = ko.observable(15);
  public items: KnockoutObservableArray<any> = ko.observableArray();
  public selectedItem: KnockoutObservable<any> = ko.observable();
  public events: KnockoutObservableArray<any> = ko.observableArray();
  public currentTime: KnockoutObservable<string> = ko.observable('');

  

  public selectedEvents = ko.computed(() => {
    console.log(ko.unwrap(this.events));
    return ko.unwrap(this.events).filter((event) => {
      if (this.selectedItem() != undefined) {
        console.log(this.selectedItem())
        return event.OfficeId == ko.unwrap(this.selectedItem).Id;
      }
      else {
        return false;
      }
    });
  });



  public getUserLocation(): void {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.nearestItem(position.coords.latitude, position.coords.longitude);

      });
    }
    // Default to Washington, DC
    else
      this.nearestItem(38.8951, -77.0367);
  }

  public setTime():void {
    var date:Date = new Date();
    this.currentTime(date.getHours() + ':' + date.getMinutes() )
  }

  private nearestItem(latitude, longitude): any {
    var mindif = 99999;
    var closest;
    let cities = ko.unwrap(this.items);
    console.log(cities);

    for (let index = 0; index < cities.length; ++index) {
      var dif = this.PythagorasEquirectangular(latitude, longitude, cities[index].Latitude, cities[index].Longitude);
      if (dif < mindif) {
        closest = index;
        mindif = dif;
      }
    }
    this.selectedItem(cities[closest]);
    // echo the nearest city
    console.log(cities[closest]);
  }
  private Deg2Rad(deg) {
    return deg * Math.PI / 180;
  }
  private PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
    lat1 = this.Deg2Rad(lat1);
    lat2 = this.Deg2Rad(lat2);
    lon1 = this.Deg2Rad(lon1);
    lon2 = this.Deg2Rad(lon2);
    var R = 6371; // km
    var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    var y = (lat2 - lat1);
    var d = Math.sqrt(x * x + y * y) * R;
    return d;
  }

  constructor(shouter: KnockoutSubscribable<{}>) {
    shouter.subscribe((value: string) => {
      this.messageText(value);
    }, this, 'description');

    shouter.subscribe((value: number) => {
      this.fontSize(value);
    }, this, 'value');

    shouter.subscribe((values: Array<Object>) => {
      this.items(values);
    }, this, 'items');

    shouter.subscribe(() => {
      if (this.selectedItem() == undefined) {
        this.getUserLocation();
      }
    }, this, 'itemsLoaded');

    shouter.subscribe((value: Array<any>) => {
      this.events(value);
    }, this, 'events');


    this.selectedItem.subscribe((newValue) => {
      this.events
    });

    this.setTime();
  }
}
