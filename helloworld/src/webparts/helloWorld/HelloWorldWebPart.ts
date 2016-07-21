import {
  BaseClientSideWebPart,
  IWebPartContext,
  IWebPartData,
  IPropertyPaneSettings,
  IPropertyPaneFieldType,
  HostType
} from '@ms/sp-client-platform';

import { DisplayMode } from '@ms/sp-client-base';
import HelloWorldViewModel from './HelloWorldViewModel';
import * as ko from 'knockout';

import MockHttpClient from './tests/MockHttpClient';
import strings from './loc/Strings.resx';

export interface IHelloWorldWebPartProps {
  description: string;
  value: number;
}

export interface ISPLocationList{
  items: ISPLocationListItem[]
}

export interface ISPLocationListItem{
  Name: string,
  Lat: string,
  Long: string,
  Weather: Object
}

export interface ISPList {
  Title: string;
  Id: string;
}

let _instance: number = 0;

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  private _sampleElement: HTMLElement;
  private _id: number;
  private digestValue: string;
  private description: KnockoutObservable<string> = ko.observable('');
  private value: KnockoutObservable<number> = ko.observable(0);
  private shouter: KnockoutSubscribable<{}> = new ko.subscribable();
  private listItems: KnockoutObservableArray<Object> = ko.observableArray();

  public constructor(context: IWebPartContext) {
    super(context);
    this._id = _instance++;
    this._sampleElement = this._createComponentElement(`SampleElement-${this._id}`);
    this._registerComponent();
    this.domElement.appendChild(this._sampleElement);
    ko.applyBindings(this.shouter, this.domElement);

    this.description.subscribe((newValue: string) => {
      this.shouter.notifySubscribers(newValue, 'description');
    });

    this.value.subscribe((newValue: number) => {
      this.shouter.notifySubscribers(newValue, 'value');
    });

    this.listItems.subscribe((newValue: Object) => {
      this.shouter.notifySubscribers(newValue, 'items');
    });
  }

  public render(mode: DisplayMode = DisplayMode.Read, data?: IWebPartData): void {
    this.description(this.properties.description);
    this.value(this.properties.value);
    this._renderListAsync();
    
  }

  private _createComponentElement(tagName: string): HTMLElement {
    const customerDom: HTMLElement = document.createElement('div');
    customerDom.setAttribute('data-bind', 'component: { name: "' + tagName + '", params: $data }');
    return customerDom;
  }

  private _registerComponent(): void {
    ko.components.register(
      `SampleElement-${this._id}`,
      {
        viewModel: HelloWorldViewModel,
        template: require('./HelloWorld.template.html.js'),
        synchronous: false
      });

  }


  protected get propertyPaneSettings(): IPropertyPaneSettings {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                {
                  type: IPropertyPaneFieldType.Slider,
                  targetProperty: 'value',
                  properties: {
                    min: 15,
                    max: 50,
                    step: 1,
                    initialValue: 15
                  }
                }]
            }]
        }]
    };
  }

  private _getLocationData(): Promise<ISPLocationList> {
    return this.host.httpClient.get(this.host.pageContext.webAbsoluteUrl + '/_api/web/lists/GetByTitle("OfficeLocations")')
      .then((response: Response) => {
        console.log(response.json());
        return response.json();
      });
  }

  private _renderListAsync(): void {

     if (this.host.hostType === HostType.ModernPage) {
      this._getLocationData()
        .then((response) => {
          this._renderList(response.items);
        });
      // Classic SharePoint environment      
    } else if (this.host.hostType == HostType.ClassicPage) {

      this._getLocationData()
        .then((response) => {
          this._renderList(response.items);
        });
    }
  }

  private _renderList(items: ISPLocationListItem[]): void {

    this.listItems.removeAll();
    items.forEach((item: ISPLocationListItem) => {
      this.listItems.push(item);
    });


  }


  }
