import {Component, Input, Pipe, PipeTransform, AfterViewInit, OnChanges, SimpleChange, Output, EventEmitter} from '@angular/core';
import {NgFor, NgStyle, NgClass, NgIf} from '@angular/common';

export interface GridColumn {
    name: string;
    caption?: string;
    dataType?: string;
    width?: number,
    sortable?: boolean;
    sortDesc?: boolean;
    filterable?: boolean;
    filter?: string;
    align?: string;
}

export interface GridOptions {
    pageable?: boolean;
    pageSize?: number;
    tableStriped?: boolean;
    tableHover?: boolean;
}

@Pipe({
    name: 'values'
})
class ValuesPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        if (!value) return;
        let keyArr = Object.keys(value),
            dataArr = [];
        keyArr.forEach(key => {
            if (args && args.length > 0 && args[0].indexOf(key) !== -1) {
                dataArr.push(key);
            } else {
            }
        });
        return dataArr;
    }
}

@Component({
    selector: 'nsg-grid',
    templateUrl: './app/components/nsg-grid.html',
    pipes: [ValuesPipe],
    directives: [NgFor, NgStyle, NgClass, NgIf],
    styles: [`
        .container{
            margin: 2px;
        }
        .pointer{
            cursor:pointer
        }
        .pager>li{
            display:inline;
            margin:1px;
            float:left;
        }
        td,th{
            border-left:1px solid #ddd!important;
            border-right:1px solid #ddd!important;
        }
    `],
    template:`
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" />
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
            <div class="container-fluid">
                <div class="panel panel-header">
                    <!--<input type="text" [(ngModel)]="filter" (keyup)="filterData(filter)" />-->
                </div>
                <table class="table table-condensed" [ngClass]="{'table-hover': useGridOptions.tableHover, 'table-striped':useGridOptions.tableStriped}">
                    <tr>
                        <th [style.text-align]="textAlign('center')" *ngFor="let column of gridColumns" [style.width]="column.width ? column.width + 'px' : 'auto'">
                            <span *ngIf="!column.sortable">{{column.caption ? column.caption : column.name}}</span>
                            <div>
                                <label *ngIf="column.sortable" class="pointer" (click)="onSort(column)" [style.cursor]="pointer">{{column.caption ? column.caption : column.name}}
                                <span><i class="fa" [ngClass]="{'fa-sort-asc': !column.sortDesc, 'fa-sort-desc':column.sortDesc}"></i></span></label>
                            </div>
                            <!--<input type="text" [(ngModel)]="column.filter" *ngIf="column.filterable" (keyup)="filterData(column)" />-->
                        </th>
                    </tr>
                    <tr *ngFor="let row of gridData" (click)="rowSelectedEvent(row)">
                        <td  *ngFor="let col of row | values : providedCols">
                            <span>{{row[col]}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td *ngIf="!gridData" [attr.colspan]="gridColumns.length">
                            <span>No Rows</span>
                        </td>
                    </tr>
                    <tr>
                        <td [attr.colspan]="gridColumns.length" [style.visible]="useGridOptions.pageable">
                            <div class="footer" [style.display]="inline">
                                <div [style.float]="left">
                                    <ul class="pager" *ngIf="(pages && pages.length > 0)">
                                        <li>
                                            <a href="#" (click)="pageIt(0)">&lt;&lt;</a>
                                        </li>
                                        <li *ngFor="let num of pages">
                                            <a *ngIf="(num-1) !== pageNum" href="#" (click)="pageIt(num-1)">{{num}}</a>
                                            <span [style.background-color]="backGround()" [style.color]="color()" *ngIf="(num-1) === pageNum">{{num}}</span>
                                        </li>
                                        <li>
                                            <a href="#" (click)="pageIt(totalPages-1)">&gt;&gt;</a>
                                        </li>
                                        <li [style.floot]="right">

                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
                <div>
                Event: {{gridEvent}}
                </div>
            </div>    
    `
})
export class NsgGrid implements AfterViewInit, OnChanges {
    @Input('grid-columns') gridColumns: GridColumn[];
    @Input('grid-data') gridData: any[];
    @Input('grid-options') gridOptions: GridOptions;
    @Output() rowSelected: EventEmitter<any> = new EventEmitter<any>();
    private providedCols: string[] = [];
    private originalData: any[];
    private filters: GridColumn[] = [];

    private totalPages: number;
    private pages: number[];
    private pageNum: number = 0;
    private maxPageNumToShow: number = 5;
    private useGridOptions: GridOptions;
    private defaultGridOptions: GridOptions = {
        pageable: true,
        pageSize: 10,
        tableHover: true,
        tableStriped: true
    }

    /*Test*/
    private gridEvent:string;

    ngAfterViewInit() {
        if (this.gridColumns) {
            this.gridColumns.forEach(col => {
                this.providedCols.push(col.name);
                if (col.filterable) {
                    this.filters.push(col);
                }
            });
        }

        if (this.gridData) {
            this.originalData = this.gridData;
        }
        if (this.gridOptions) {
            this.useGridOptions = this.gridOptions;
        } else {
            this.useGridOptions = this.defaultGridOptions;
        }
    }

    ngOnChanges(changes: {
        [key: string]: SimpleChange;
    }) {
        if (changes["gridData"] && changes["gridData"].currentValue) {
            this.originalData = changes["gridData"].currentValue
            if (this.useGridOptions.pageable) {
                this.pageIt(this.pageNum);
                this.totalPages = Math.ceil(this.originalData.length / this.useGridOptions.pageSize);
                this.createPageNumbers(this.pageNum);
                console.log("Data loaded");
                this.gridEvent = "Data Loaded";
            }
        }
    }

    constructor() {
        this.useGridOptions = this.defaultGridOptions;
    }

    private onSort(column) {
        if (!this.gridData) return;
        if (!column.sortDesc) {
            var sortedArray = this.gridData.sort((x, y) => {
                if (x[column.name] > y[column.name]) {
                    return 1;
                } else if (x[column.name] < y[column.name]) {
                    return -1;
                } else {
                    return 0;
                }
            });
            column.sortDesc = true;
        } else {
            var sortedArray = this.gridData.reverse();
            column.sortDesc = false;
        }
        this.gridData = sortedArray;
    }

    private filterData(column: GridColumn) {
        var filteredData = this.originalData.filter((data) => {
            if (data[column.name].indexOf(column.filter) !== -1) {
                return true;
            } else {
                return false;
            }
        });
        if (this.useGridOptions.pageable)
            this.pageIt(this.pageNum);
        this.gridData = filteredData;
    }

    private pageIt(pageNum: number) {
        this.gridData = this.originalData.skip(this.useGridOptions.pageSize * pageNum).take(this.useGridOptions.pageSize);
        this.pageNum = pageNum;
        this.createPageNumbers(this.pageNum);
        this.gridEvent = "Page Changed";
    }

    private createPageNumbers(currentPage: number) {
        var numberOfPages = Math.ceil(this.originalData.length / this.useGridOptions.pageSize);
        var pageStart = currentPage === 0 ? currentPage : currentPage - 1; // currentPage === 0 ? currentPage : (currentPage + this.maxPageNumToShow) >= numberOfPages ? this.maxPageNumToShow - currentPage : currentPage - 1;

        var tempPages = Array(this.maxPageNumToShow).fill(pageStart).map((x, i) => {
            return x + i + 1;
        });
        if (numberOfPages < this.maxPageNumToShow)
            tempPages = tempPages.slice(0, numberOfPages);
        this.pages = tempPages.filter((n) => {
            return n <= numberOfPages;
        })
    }

    private rowSelectedEvent(row) {
        this.rowSelected.emit(row);
        this.gridEvent = "Row Selected";
    }

    private backGround() {
        return "green";
    }
    private color() {
        return "white";
    }

    private textAlign(align) {
        return align;
    }

}

interface ArrayConstructor {
    skip(count: number): any[];
    take(count: number): any[];
}

Array.prototype.skip = function (count: number): any[] {
    return this.slice(count);
}

Array.prototype.take = function (count: number) {
    var takeArray = [];
    for (var index = 0; index < count; index++) {
        if (index > this.length) break;
        var element = this[index];
        takeArray.push(element);
    }
    return takeArray;
}
