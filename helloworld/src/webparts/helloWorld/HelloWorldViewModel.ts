import * as ko from 'knockout';

export default class HelloWorldViewModel {
  private messageText: KnockoutObservable<string> = ko.observable('');
  private fontSize: KnockoutObservable<number> = ko.observable(15);
  public items: KnockoutObservableArray<Object> = ko.observableArray();

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
    
  }
}
