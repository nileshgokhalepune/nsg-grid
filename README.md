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
import {NsgGrid} from 'nsg-grid/nsg-grid';

@Component({
    selector: 'app',
    directives:[NsgGrid]
    template:`
            <h1>Hello Angular 2 Grid</h1>
            <nsg-grid></nsg-grid>
           `
});
export class AppComponent{
    gridData: any[];
    gridColumns:GridCoulums = {
        name:"Column1",
        caption: "Column one",
        sortable:true,
    }
}
```

## Author

Nilesh Gokhale

## License

UNLICENSED. You can use this grid control at your own risk. Feel free to modify the code as you like based on your requriements.