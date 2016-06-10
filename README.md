# nsg-grid
A Simple Angular 2 Grid

**nsg-grid** is a grid component for Angular 2 RC1

##Demo

##Installation
````shell
npm install --save nsg-grid
````

## Example

```ts
import {Component} from '@angular/core';
import {DatePicker} from 'nsg-grid/nsg-grid';

@Component({
    selector: 'app',
    directives:[DatePicker]
    template:`
            <h1>Hello Angular 2 DatePicker</h1>
            <nsg-grid></nsg-grid>
           `
});
export class AppComponent{
    myDateValue: any;
}
```

![alt tag](https://github.com/nileshgokhalepune/nsg-datepicker/blob/master/snapshot.JPG)

## Author

Nilesh Gokhale

## License

UNLICENSED. You can use this datepicker at your own risk. Feel free to modify the code as you like based on your requriements.