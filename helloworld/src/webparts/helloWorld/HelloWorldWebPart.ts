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

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

let _instance: number = 0;

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  private _sampleElement: HTMLElement;
  private _id: number;
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
      console.log('found update');
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

  private _getMockListData(): Promise<ISPLists> {
    return MockHttpClient.get(this.host.pageContext.webAbsoluteUrl).then(() => {
      const listData: ISPLists = {
        value:
        [
          { Title: 'Mock List 1', Id: '1' },
          { Title: 'Mock List 2', Id: '2' },
          { Title: 'Mock List 3', Id: '3' }
        ]
      };

      return listData;
    }) as Promise<ISPLists>;
  }


  private _getListData(): Promise<ISPLists> {
    return this.host.httpClient.get(this.host.pageContext.webAbsoluteUrl + `/_api/web/lists?$filter=Hidden eq false`)
      .then((response: Response) => {
        return response.json();
      });
  }

  private _renderListAsync(): void {

    // Test environment
    if (this.host.hostType === HostType.TestPage) {
      this._getMockListData().then((response) => {
        this._renderList(response.value);
      });

      // SharePoint environment
    } else if (this.host.hostType === HostType.ModernPage) {
      this._getListData()
        .then((response) => {
          this._renderList(response.value);
        });
    }
  }

  private _renderList(items: ISPList[]): void {

    this.listItems.removeAll();
    items.forEach((item: ISPList) => {
        console.log(item);
        this.listItems.push(item);
    });
    

  }
}
